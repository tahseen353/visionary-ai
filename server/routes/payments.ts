import express, { Response } from 'express';
import Stripe from 'stripe';
import crypto from 'crypto';
import { protect, AuthRequest } from '../middleware/auth.ts';
import { User } from '../models/User.ts';
import { PaymentModel } from '../models/Payment.ts';
import { TransactionModel } from '../models/Transaction.ts';

const router = express.Router();

// Lazy initialize Stripe
let stripeClient: Stripe | null = null;
function getStripe(): Stripe | null {
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) return null;
  if (!stripeClient) {
    stripeClient = new Stripe(secret);
  }
  return stripeClient;
}

// Map plans and top-ups to their credit rewards and prices
const OFFERS: Record<string, { credits: number; price: number; type: 'plan' | 'topup' }> = {
  // Plans
  'starter': { price: 15, credits: 50, type: 'plan' },
  'creator': { price: 49, credits: 250, type: 'plan' },
  'pro': { price: 149, credits: 1000, type: 'plan' },
  // Top-ups
  'topup_100': { price: 10, credits: 100, type: 'topup' },
  'topup_500': { price: 40, credits: 500, type: 'topup' },
  'topup_1000': { price: 75, credits: 1000, type: 'topup' },
};

// @route   POST /api/payments/stripe/checkout
// @desc    Create Stripe Checkout Session or simulate one
router.post('/stripe/checkout', protect, async (req: AuthRequest, res: Response): Promise<any> => {
  const { itemId } = req.body; // e.g. 'starter', 'topup_500'
  const user = req.user;

  const offer = OFFERS[itemId];
  if (!offer) {
    return res.status(400).json({ error: 'Invalid plan or top-up item selected' });
  }

  try {
    const stripe = getStripe();
    const orderId = `pay_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

    // Create payment intent / log in our DB
    const payment = await PaymentModel.create({
      userId: user._id || user.id,
      provider: 'stripe',
      orderId,
      amount: offer.price,
      currency: 'usd',
      creditsPurchased: offer.credits,
      status: 'pending',
    });

    const hostUrl = process.env.APP_URL || 'http://localhost:3000';

    if (!stripe) {
      console.log('Stripe Secret Key not found. Falling back to server-side Payment Simulation.');
      // Simulate successful checkout redirection immediately
      const mockSessionId = `mock_stripe_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Update payment record to simulated success (for instant credit update in simulation mode)
      await PaymentModel.findOneAndUpdate(
        { orderId },
        { paymentId: mockSessionId, status: 'success' }
      );

      // Add credits to user
      const isPlan = offer.type === 'plan';
      const userUpdate: any = {
        credits: user.credits + offer.credits,
      };
      if (isPlan) {
        userUpdate.plan = itemId.charAt(0).toUpperCase() + itemId.slice(1);
      }

      await User.findByIdAndUpdate(user._id || user.id, userUpdate);

      // Log transaction
      await TransactionModel.create({
        userId: user._id || user.id,
        type: 'credit',
        amount: offer.credits,
        reason: isPlan ? `Upgraded to ${userUpdate.plan} Plan` : `Purchased ${offer.credits} credits top-up`,
        paymentId: mockSessionId,
      });

      return res.json({
        simulated: true,
        url: `${hostUrl}/pricing?payment_status=success&session_id=${mockSessionId}&credits=${offer.credits}`,
      });
    }

    // Real Stripe Integration
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: offer.type === 'plan' ? `Lumina AI - ${itemId.toUpperCase()} Plan` : `Lumina AI - ${offer.credits} Credits Top-up`,
              description: offer.type === 'plan' ? `Monthly subscription with ${offer.credits} credits` : `Instant addition of ${offer.credits} image generation credits`,
            },
            unit_amount: offer.price * 100, // in cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${hostUrl}/pricing?payment_status=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${hostUrl}/pricing?payment_status=cancelled`,
      metadata: {
        userId: (user._id || user.id).toString(),
        orderId,
        itemId,
        credits: offer.credits.toString(),
        isPlan: (offer.type === 'plan').toString(),
      },
    });

    await PaymentModel.findOneAndUpdate(
      { orderId },
      { paymentId: session.id }
    );

    return res.json({ url: session.url });
  } catch (error: any) {
    console.error('Stripe checkout error:', error);
    return res.status(500).json({ error: error.message || 'Payment initiation failed' });
  }
});

// @route   POST /api/payments/stripe/webhook
// @desc    Stripe webhook listener
router.post('/stripe/webhook', express.raw({ type: 'application/json' }), async (req: express.Request, res: Response): Promise<any> => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  const stripe = getStripe();
  if (!stripe) {
    return res.status(400).send('Stripe is not configured');
  }

  let event: Stripe.Event;

  try {
    if (endpointSecret && sig) {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } else {
      // Direct reading if no webhook secret (not recommended for production but needed for quick test)
      event = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    }
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const metadata = session.metadata;

    if (metadata) {
      const { userId, orderId, itemId, credits, isPlan } = metadata;

      try {
        const payment = await PaymentModel.findOne({ orderId });
        if (payment && payment.status !== 'success') {
          // Update payment status
          await PaymentModel.findOneAndUpdate(
            { orderId },
            { status: 'success', paymentId: session.id }
          );

          // Find user
          const user = await User.findById(userId);
          if (user) {
            const addedCredits = parseInt(credits, 10);
            const userUpdate: any = {
              credits: user.credits + addedCredits,
            };
            if (isPlan === 'true') {
              userUpdate.plan = itemId.charAt(0).toUpperCase() + itemId.slice(1);
            }

            await User.findByIdAndUpdate(userId, userUpdate);

            // Log Transaction
            await TransactionModel.create({
              userId,
              type: 'credit',
              amount: addedCredits,
              reason: isPlan === 'true' ? `Upgraded to ${userUpdate.plan} Plan` : `Purchased ${addedCredits} credits top-up`,
              paymentId: session.id,
            });

            console.log(`Payment success processed for user: ${userId}, added credits: ${addedCredits}`);
          }
        }
      } catch (err: any) {
        console.error('Webhook database processing error:', err);
        return res.status(500).send('Database error');
      }
    }
  }

  return res.json({ received: true });
});

// @route   POST /api/payments/stripe/verify-session
// @desc    Direct fallback verification in case webhook is not configured yet
router.post('/stripe/verify-session', protect, async (req: AuthRequest, res: Response): Promise<any> => {
  const { sessionId } = req.body;
  const stripe = getStripe();

  if (!sessionId) {
    return res.status(400).json({ error: 'Session ID is required' });
  }

  try {
    // If it's a simulated session ID
    if (sessionId.startsWith('mock_stripe_')) {
      const payment = await PaymentModel.findOne({ paymentId: sessionId });
      if (payment) {
        return res.json({ success: true, simulated: true, credits: payment.creditsPurchased });
      }
      return res.status(404).json({ error: 'Simulated payment session not found' });
    }

    if (!stripe) {
      return res.status(400).json({ error: 'Stripe is not configured on the backend' });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status === 'paid') {
      const orderId = session.metadata?.orderId;
      const payment = await PaymentModel.findOne({ orderId });

      if (payment && payment.status !== 'success') {
        const userId = session.metadata?.userId || '';
        const credits = parseInt(session.metadata?.credits || '0', 10);
        const itemId = session.metadata?.itemId || '';
        const isPlan = session.metadata?.isPlan === 'true';

        // Update payment
        await PaymentModel.findOneAndUpdate({ orderId }, { status: 'success' });

        // Update User
        const user = await User.findById(userId);
        if (user) {
          const userUpdate: any = {
            credits: user.credits + credits,
          };
          if (isPlan) {
            userUpdate.plan = itemId.charAt(0).toUpperCase() + itemId.slice(1);
          }
          await User.findByIdAndUpdate(userId, userUpdate);

          // Log transaction
          await TransactionModel.create({
            userId,
            type: 'credit',
            amount: credits,
            reason: isPlan ? `Upgraded to ${userUpdate.plan} Plan` : `Purchased ${credits} credits top-up`,
            paymentId: session.id,
          });
        }
        return res.json({ success: true, credits });
      }
      return res.json({ success: true, message: 'Already processed' });
    }

    return res.status(400).json({ error: 'Payment session is not paid' });
  } catch (error: any) {
    console.error('Verify session error:', error);
    return res.status(500).json({ error: error.message || 'Verification failed' });
  }
});

// @route   POST /api/payments/razorpay/order
// @desc    Create simulated or real Razorpay Order
router.post('/razorpay/order', protect, async (req: AuthRequest, res: Response): Promise<any> => {
  const { itemId } = req.body;
  const user = req.user;

  const offer = OFFERS[itemId];
  if (!offer) {
    return res.status(400).json({ error: 'Invalid plan or top-up item selected' });
  }

  try {
    const mockOrderId = `razor_order_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

    // Create payment in database
    await PaymentModel.create({
      userId: user._id || user.id,
      provider: 'razorpay',
      orderId: mockOrderId,
      amount: offer.price,
      currency: 'INR',
      creditsPurchased: offer.credits,
      status: 'pending',
    });

    // We return standard payload for Razorpay client-side checkout
    return res.json({
      orderId: mockOrderId,
      amount: offer.price * 100, // in paise
      currency: 'INR',
      key: process.env.RAZORPAY_KEY_ID || 'rzp_test_mock_12345',
      name: 'Lumina AI',
      description: offer.type === 'plan' ? `${itemId.toUpperCase()} Subscription` : `${offer.credits} Credits Top-up`,
      user: {
        name: user.name,
        email: user.email,
      },
    });
  } catch (error: any) {
    console.error('Razorpay order creation error:', error);
    return res.status(500).json({ error: 'Server error creating payment order' });
  }
});

// @route   POST /api/payments/razorpay/verify
// @desc    Verify Razorpay signature and credit user
router.post('/razorpay/verify', protect, async (req: AuthRequest, res: Response): Promise<any> => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  const user = req.user;

  if (!razorpay_order_id || !razorpay_payment_id) {
    return res.status(400).json({ error: 'Order ID and Payment ID are required' });
  }

  try {
    // Check if we are running in real Razorpay mode or simulated
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    let verified = true;

    if (keySecret && razorpay_signature) {
      const generated_signature = crypto
        .createHmac('sha256', keySecret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

      verified = generated_signature === razorpay_signature;
    } else {
      console.log('Razorpay keys missing or signature absent. Auto-verifying in Simulation Mode.');
    }

    if (!verified) {
      return res.status(400).json({ error: 'Payment verification failed, invalid signature' });
    }

    // Retrieve payment
    const payment = await PaymentModel.findOne({ orderId: razorpay_order_id });
    if (!payment) {
      return res.status(404).json({ error: 'Payment record not found' });
    }

    if (payment.status === 'success') {
      return res.json({ success: true, message: 'Payment already credited' });
    }

    // Find itemId from payment price/currency mapping
    let matchedItemId = '';
    let offer = null;
    for (const [id, details] of Object.entries(OFFERS)) {
      if (details.credits === payment.creditsPurchased && details.price === payment.amount) {
        matchedItemId = id;
        offer = details;
        break;
      }
    }

    if (!offer) {
      return res.status(400).json({ error: 'Could not resolve payment credits reward' });
    }

    // Update payment record
    await PaymentModel.findOneAndUpdate(
      { orderId: razorpay_order_id },
      { status: 'success', paymentId: razorpay_payment_id }
    );

    // Update user credits & subscription
    const isPlan = offer.type === 'plan';
    const userUpdate: any = {
      credits: user.credits + payment.creditsPurchased,
    };
    if (isPlan) {
      userUpdate.plan = matchedItemId.charAt(0).toUpperCase() + matchedItemId.slice(1);
    }

    await User.findByIdAndUpdate(user._id || user.id, userUpdate);

    // Write transaction record
    await TransactionModel.create({
      userId: user._id || user.id,
      type: 'credit',
      amount: payment.creditsPurchased,
      reason: isPlan ? `Upgraded to ${userUpdate.plan} Plan` : `Purchased ${payment.creditsPurchased} credits top-up`,
      paymentId: razorpay_payment_id,
    });

    return res.json({
      success: true,
      credits: payment.creditsPurchased,
      userCredits: userUpdate.credits,
    });
  } catch (error: any) {
    console.error('Razorpay verification error:', error);
    return res.status(500).json({ error: 'Server error verifying payment' });
  }
});

export default router;
