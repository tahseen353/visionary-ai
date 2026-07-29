import express, { Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.ts';
import { protect, AuthRequest } from '../middleware/auth.ts';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'visionary-super-secret-key-123';

// Generate Token helper
function generateToken(id: string): string {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: '30d' });
}

// @route   POST /api/auth/register
// @desc    Register a new user
router.post('/register', async (req: express.Request, res: Response): Promise<any> => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Please provide name, email, and password' });
  }

  try {
    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user - standard plan Starter, credits 50
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      credits: 50, // default credits
      plan: 'Starter',
    });

    const token = generateToken(user._id || user.id);

    return res.status(201).json({
      user: {
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        credits: user.credits,
        plan: user.plan,
      },
      token,
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: error.message || 'Server error' });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
router.post('/login', async (req: express.Request, res: Response): Promise<any> => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Please provide email and password' });
  }

  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = generateToken(user._id || user.id);

    return res.json({
      user: {
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        credits: user.credits,
        plan: user.plan,
      },
      token,
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return res.status(500).json({ error: error.message || 'Server error' });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user profile
router.get('/me', protect, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const user = req.user;
    return res.json({
      id: user._id || user.id,
      name: user.name,
      email: user.email,
      credits: user.credits,
      plan: user.plan,
    });
  } catch (error: any) {
    console.error('Fetch me error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

export default router;
