export interface User {
  id: string;
  name: string;
  email: string;
  credits: number;
  plan: string;
  createdAt: string;
  updatedAt: string;
}

export interface ImageGeneration {
  id: string;
  userId: string;
  prompt: string;
  enhancedPrompt?: string;
  imageUrl: string;
  style: string;
  aspectRatio: string;
  creditsUsed: number;
  createdAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'credit' | 'debit';
  amount: number;
  reason: string;
  paymentId?: string;
  createdAt: string;
}

export interface PaymentRecord {
  id: string;
  userId: string;
  provider: 'stripe' | 'razorpay';
  orderId?: string;
  paymentId?: string;
  amount: number;
  currency: string;
  creditsPurchased: number;
  status: 'pending' | 'success' | 'failed';
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}
