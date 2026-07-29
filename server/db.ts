import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), '.data');

// Ensure local data directory exists for file fallback
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export let isUsingMongoose = false;

export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.log('MONGODB_URI not found in environment variables. Falling back to local file-based storage.');
    isUsingMongoose = false;
    return;
  }

  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('MongoDB connected successfully via Mongoose.');
    isUsingMongoose = true;
  } catch (err: any) {
    console.error('MongoDB connection error:', err.message);
    console.log('Falling back to local file-based storage.');
    isUsingMongoose = false;
  }
}

// File-based database helper
export class FileDB<T extends { id?: string; _id?: any; createdAt?: any; updatedAt?: any }> {
  private filePath: string;

  constructor(collectionName: string) {
    this.filePath = path.join(DATA_DIR, `${collectionName}.json`);
    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, JSON.stringify([]));
    }
  }

  private read(): T[] {
    try {
      const data = fs.readFileSync(this.filePath, 'utf-8');
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  private write(data: T[]): void {
    fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2));
  }

  async find(filter: Partial<T> = {}): Promise<T[]> {
    const records = this.read();
    return records.filter((rec) => {
      for (const key in filter) {
        if (rec[key] !== filter[key]) return false;
      }
      return true;
    });
  }

  async findOne(filter: Partial<T> = {}): Promise<T | null> {
    const records = await this.find(filter);
    return records[0] || null;
  }

  async findById(id: string): Promise<T | null> {
    const records = this.read();
    return records.find((rec) => rec.id === id || rec._id === id) || null;
  }

  async create(doc: Omit<T, 'id' | '_id' | 'createdAt' | 'updatedAt'>): Promise<T> {
    const records = this.read();
    const id = Math.random().toString(36).substr(2, 9);
    const now = new Date().toISOString();
    const newDoc = {
      ...doc,
      id,
      _id: id,
      createdAt: now,
      updatedAt: now,
    } as unknown as T;

    records.push(newDoc);
    this.write(records);
    return newDoc;
  }

  async findByIdAndUpdate(id: string, update: Partial<T>): Promise<T | null> {
    const records = this.read();
    const index = records.findIndex((rec) => rec.id === id || rec._id === id);
    if (index === -1) return null;

    const updated = {
      ...records[index],
      ...update,
      updatedAt: new Date().toISOString(),
    };
    records[index] = updated;
    this.write(records);
    return updated;
  }

  async findOneAndUpdate(filter: Partial<T>, update: Partial<T>): Promise<T | null> {
    const doc = await this.findOne(filter);
    if (!doc) return null;
    const id = doc.id || doc._id;
    return this.findByIdAndUpdate(id, update);
  }

  async deleteOne(filter: Partial<T>): Promise<{ deletedCount: number }> {
    const records = this.read();
    const initialLength = records.length;
    const filtered = records.filter((rec) => {
      for (const key in filter) {
        if (rec[key] !== filter[key]) return true;
      }
      return false;
    });

    this.write(filtered);
    return { deletedCount: initialLength - filtered.length };
  }

  async findByIdAndDelete(id: string): Promise<T | null> {
    const doc = await this.findById(id);
    if (!doc) return null;
    await this.deleteOne({ id } as Partial<T>);
    return doc;
  }
}
