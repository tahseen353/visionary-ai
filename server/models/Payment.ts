import mongoose from 'mongoose';
import { FileDB, isUsingMongoose } from '../db.ts';

const PaymentSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  provider: { type: String, enum: ['stripe', 'razorpay'], required: true },
  orderId: { type: String },
  paymentId: { type: String },
  amount: { type: Number, required: true },
  currency: { type: String, required: true },
  creditsPurchased: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'success', 'failed'], default: 'pending' },
}, { timestamps: true });

let MongoosePaymentModel: any;
try {
  MongoosePaymentModel = mongoose.model('Payment') || mongoose.model('Payment', PaymentSchema);
} catch {
  MongoosePaymentModel = mongoose.model('Payment', PaymentSchema);
}

const fileDB = new FileDB<any>('payments');

export const PaymentModel = {
  async find(filter: any = {}, sort: any = { createdAt: -1 }) {
    if (isUsingMongoose) {
      return MongoosePaymentModel.find(filter).sort(sort);
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

  async findOne(filter: any) {
    if (isUsingMongoose) {
      return MongoosePaymentModel.findOne(filter);
    }
    return fileDB.findOne(filter);
  },

  async create(data: any) {
    if (isUsingMongoose) {
      const newPay = new MongoosePaymentModel(data);
      return newPay.save();
    }
    return fileDB.create(data);
  },

  async findOneAndUpdate(filter: any, update: any) {
    if (isUsingMongoose) {
      return MongoosePaymentModel.findOneAndUpdate(filter, update, { new: true });
    }
    return fileDB.findOneAndUpdate(filter, update);
  }
};
