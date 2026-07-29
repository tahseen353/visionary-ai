import mongoose from 'mongoose';
import { FileDB, isUsingMongoose } from '../db.ts';

const TransactionSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  type: { type: String, enum: ['credit', 'debit'], required: true },
  amount: { type: Number, required: true },
  reason: { type: String, required: true },
  paymentId: { type: String },
}, { timestamps: true });

let MongooseTransactionModel: any;
try {
  MongooseTransactionModel = mongoose.model('Transaction') || mongoose.model('Transaction', TransactionSchema);
} catch {
  MongooseTransactionModel = mongoose.model('Transaction', TransactionSchema);
}

const fileDB = new FileDB<any>('transactions');

export const TransactionModel = {
  async find(filter: any = {}, sort: any = { createdAt: -1 }) {
    if (isUsingMongoose) {
      return MongooseTransactionModel.find(filter).sort(sort);
    }
    const results = await fileDB.find(filter);
    return results.sort((a: any, b: any) => {
      const field = Object.keys(sort)[0] || 'createdAt';
      const direction = sort[field] || -1;
      const dateA = new Date(a[field]).getTime();
      const dateB = new Date(b[field]).getTime();
      return direction === -1 ? dateB - dateA : dateA - dateB;
    });
  },

  async create(data: any) {
    if (isUsingMongoose) {
      const newTx = new MongooseTransactionModel(data);
      return newTx.save();
    }
    return fileDB.create(data);
  }
};
