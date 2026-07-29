import express, { Response } from 'express';
import { protect, AuthRequest } from '../middleware/auth.ts';
import { TransactionModel } from '../models/Transaction.ts';

const router = express.Router();

// @route   GET /api/users/transactions
// @desc    Get user credit transaction history
router.get('/transactions', protect, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const user = req.user;
    const transactions = await TransactionModel.find({ userId: user._id || user.id }, { createdAt: -1 });
    
    const formatted = transactions.map((tx: any) => ({
      id: tx._id || tx.id,
      userId: tx.userId,
      type: tx.type,
      amount: tx.amount,
      reason: tx.reason,
      createdAt: tx.createdAt,
    }));

    return res.json(formatted);
  } catch (error: any) {
    console.error('Fetch transactions error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

export default router;
