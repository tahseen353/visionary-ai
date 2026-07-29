import express, { Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import path from 'path';
import { protect, AuthRequest } from '../middleware/auth.ts';
import { User } from '../models/User.ts';
import { ImageModel } from '../models/Image.ts';
import { TransactionModel } from '../models/Transaction.ts';

const router = express.Router();

const GENERATIONS_DIR = path.join(process.cwd(), 'generations');
if (!fs.existsSync(GENERATIONS_DIR)) {
  fs.mkdirSync(GENERATIONS_DIR, { recursive: true });
}

// Lazy initialization helper for GoogleGenAI
let aiClient: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is required. Please set it in Settings > Secrets.');
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// @route   POST /api/images/generate
// @desc    Generate an image using Gemini API
router.post('/generate', protect, async (req: AuthRequest, res: Response): Promise<any> => {
  const { prompt, style = 'Default', aspectRatio = '1:1', enhancePrompt = false } = req.body;

  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Please provide a valid prompt' });
  }

  const user = req.user;
  if (user.credits < 1) {
    return res.status(400).json({ error: 'Insufficient credits. Please top up or upgrade your plan.' });
  }

  try {
    const ai = getAIClient();
    let finalPrompt = prompt;
    let enhancedPromptText = '';

    // 1. Perform prompt expansion/enhancement if requested
    if (enhancePrompt) {
      try {
        const expanderResponse = await ai.models.generateContent({
          model: 'gemini-3.5-flash',
          contents: `Expand this short image generation description into a highly detailed, sensory, visually evocative prompt for an AI image generator. Do not include any greeting or introduction, just return the pure expanded text in English. Description: "${prompt}"`,
        });
        enhancedPromptText = expanderResponse.text?.trim() || '';
        if (enhancedPromptText) {
          finalPrompt = enhancedPromptText;
        }
      } catch (err: any) {
        console.error('Prompt expansion error:', err.message);
        // Fall back to original prompt if expansion fails
      }
    }

    // 2. Append style modifier if it's not "Default"
    let styledPrompt = finalPrompt;
    if (style && style !== 'Default' && style !== 'None') {
      styledPrompt = `${finalPrompt}, in ${style} style, high-quality, professional digital art.`;
    }

    // 3. Trigger image generation using gemini-3.1-flash-lite-image
    console.log(`Generating image for prompt: "${styledPrompt}" with aspectRatio: ${aspectRatio}`);
    
    const genResponse = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite-image',
      contents: {
        parts: [
          {
            text: styledPrompt,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio as any, // "1:1" | "3:4" | "4:3" | "9:16" | "16:9"
        },
      },
    });

    let base64Data = '';
    const parts = genResponse.candidates?.[0]?.content?.parts || [];
    for (const part of parts) {
      if (part.inlineData && part.inlineData.data) {
        base64Data = part.inlineData.data;
        break;
      }
    }

    if (!base64Data) {
      return res.status(500).json({ error: 'Failed to retrieve image data from Gemini.' });
    }

    // 4. Save base64 image locally as a PNG file
    const filename = `img_${Date.now()}_${Math.random().toString(36).substr(2, 6)}.png`;
    const filepath = path.join(GENERATIONS_DIR, filename);
    const buffer = Buffer.from(base64Data, 'base64');
    fs.writeFileSync(filepath, buffer);

    const imageUrl = `/generations/${filename}`;

    // 5. Deduct 1 credit from user
    const updatedCredits = user.credits - 1;
    await User.findByIdAndUpdate(user._id || user.id, {
      credits: updatedCredits,
    });

    // 6. Log transaction
    await TransactionModel.create({
      userId: user._id || user.id,
      type: 'debit',
      amount: 1,
      reason: `Generated image: "${prompt.substring(0, 30)}..."`,
    });

    // 7. Save generation history record
    const savedImage = await ImageModel.create({
      userId: user._id || user.id,
      prompt,
      enhancedPrompt: enhancedPromptText || undefined,
      imageUrl,
      style,
      aspectRatio,
      creditsUsed: 1,
    });

    return res.status(201).json({
      image: {
        id: savedImage._id || savedImage.id,
        prompt: savedImage.prompt,
        enhancedPrompt: savedImage.enhancedPrompt,
        imageUrl: savedImage.imageUrl,
        style: savedImage.style,
        aspectRatio: savedImage.aspectRatio,
        creditsUsed: savedImage.creditsUsed,
        createdAt: savedImage.createdAt,
      },
      userCredits: updatedCredits,
    });
  } catch (error: any) {
    console.error('Image generation route error:', error);
    return res.status(500).json({
      error: error.message || 'An error occurred during image generation. Ensure your API key is correctly configured.',
    });
  }
});

// @route   GET /api/images
// @desc    Get all generations (supports filtering by userId or general public)
router.get('/', async (req: express.Request, res: Response): Promise<any> => {
  const { userId, limit = 50 } = req.query;

  try {
    const filter = userId ? { userId } : {};
    const images = await ImageModel.find(filter, { createdAt: -1 });
    const formatted = images.slice(0, Number(limit)).map((img: any) => ({
      id: img._id || img.id,
      userId: img.userId,
      prompt: img.prompt,
      enhancedPrompt: img.enhancedPrompt,
      imageUrl: img.imageUrl,
      style: img.style,
      aspectRatio: img.aspectRatio,
      creditsUsed: img.creditsUsed,
      createdAt: img.createdAt,
    }));
    return res.json(formatted);
  } catch (error: any) {
    console.error('Fetch images error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

// @route   DELETE /api/images/:id
// @desc    Delete a generation
router.delete('/:id', protect, async (req: AuthRequest, res: Response): Promise<any> => {
  const { id } = req.params;
  const user = req.user;

  try {
    const image = await ImageModel.findById(id);
    if (!image) {
      return res.status(404).json({ error: 'Image not found' });
    }

    // Verify ownership
    if (image.userId !== (user._id || user.id).toString()) {
      return res.status(403).json({ error: 'Not authorized to delete this image' });
    }

    // Try to delete local file
    try {
      const filename = path.basename(image.imageUrl);
      const filepath = path.join(GENERATIONS_DIR, filename);
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }
    } catch (e) {
      console.error('Error deleting local file:', e);
    }

    await ImageModel.findByIdAndDelete(id);

    return res.json({ success: true, message: 'Image deleted successfully' });
  } catch (error: any) {
    console.error('Delete image error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

export default router;
