import mongoose from 'mongoose';
import { FileDB, isUsingMongoose } from '../db.ts';

const ImageSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  prompt: { type: String, required: true },
  enhancedPrompt: { type: String },
  imageUrl: { type: String, required: true },
  style: { type: String, required: true },
  aspectRatio: { type: String, required: true },
  creditsUsed: { type: Number, required: true },
}, { timestamps: true });

let MongooseImageModel: any;
try {
  MongooseImageModel = mongoose.model('Image') || mongoose.model('Image', ImageSchema);
} catch {
  MongooseImageModel = mongoose.model('Image', ImageSchema);
}

const fileDB = new FileDB<any>('images');

export const ImageModel = {
  async find(filter: any = {}, sort: any = { createdAt: -1 }) {
    if (isUsingMongoose) {
      return MongooseImageModel.find(filter).sort(sort);
    }
    const results = await fileDB.find(filter);
    // Sort file-based items: newest first by default
    return results.sort((a: any, b: any) => {
      const field = Object.keys(sort)[0] || 'createdAt';
      const direction = sort[field] || -1;
      const dateA = new Date(a[field]).getTime();
      const dateB = new Date(b[field]).getTime();
      return direction === -1 ? dateB - dateA : dateA - dateB;
    });
  },

  async findById(id: string) {
    if (isUsingMongoose) {
      return MongooseImageModel.findById(id);
    }
    return fileDB.findById(id);
  },

  async create(data: any) {
    if (isUsingMongoose) {
      const newImg = new MongooseImageModel(data);
      return newImg.save();
    }
    return fileDB.create(data);
  },

  async findByIdAndDelete(id: string) {
    if (isUsingMongoose) {
      return MongooseImageModel.findByIdAndDelete(id);
    }
    return fileDB.findByIdAndDelete(id);
  },

  async deleteOne(filter: any) {
    if (isUsingMongoose) {
      return MongooseImageModel.deleteOne(filter);
    }
    return fileDB.deleteOne(filter);
  }
};
