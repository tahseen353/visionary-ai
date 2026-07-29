import mongoose from 'mongoose';
import { FileDB, isUsingMongoose } from '../db.ts';

// 1. Define Mongoose Schema and Model
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  credits: { type: Number, default: 50 }, // Configurable signup credits
  plan: { type: String, default: 'Starter' },
}, { timestamps: true });

let MongooseUserModel: any;
try {
  MongooseUserModel = mongoose.model('User') || mongoose.model('User', UserSchema);
} catch {
  MongooseUserModel = mongoose.model('User', UserSchema);
}

// 2. Define File-based DB Fallback
const fileDB = new FileDB<any>('users');

// 3. Unified Export API
export const User = {
  async findOne(filter: any) {
    if (isUsingMongoose) {
      return MongooseUserModel.findOne(filter);
    }
    return fileDB.findOne(filter);
  },

  async findById(id: string) {
    if (isUsingMongoose) {
      return MongooseUserModel.findById(id);
    }
    return fileDB.findById(id);
  },

  async create(data: any) {
    if (isUsingMongoose) {
      const newUser = new MongooseUserModel(data);
      return newUser.save();
    }
    return fileDB.create(data);
  },

  async findByIdAndUpdate(id: string, update: any, options: any = { new: true }) {
    if (isUsingMongoose) {
      return MongooseUserModel.findByIdAndUpdate(id, update, options);
    }
    return fileDB.findByIdAndUpdate(id, update);
  },

  async deleteOne(filter: any) {
    if (isUsingMongoose) {
      return MongooseUserModel.deleteOne(filter);
    }
    return fileDB.deleteOne(filter);
  }
};
