import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';
import api from '../lib/api.ts';
import {
  Sparkles,
  Coins,
  ShieldCheck,
  CreditCard,
  History,
  CheckCircle,
  Loader2,
  AlertCircle,
  X,
  Plus
} from 'lucide-react';

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: 15,
    credits: 50,
    description: 'Perfect for enthusiasts exploring the boundaries of AI art.',
    features: [
      '50 High-Fidelity Generations',
      'AI Prompt Enhancer Toggle',
      'Standard Generation Speeds',
      'Personal Gallery Saving',
      'Standard Support',
    ],
    accent: 'border-purple-950/20 bg-slate-950/40',
    buttonAccent: 'bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300',
  },
  {
    id: 'creator',
    name: 'Creator',
    price: 49,
    credits: 250,
    description: 'Crafted for active creators and digital design professionals.',
    features: [
      '250 High-Fidelity Generations',
      'AI Prompt Enhancer Toggle',
      'Priority Generation Speeds',
      'Full Gallery History Storage',
      'Commercial Usage License',
      'Priority Support',
    ],
    accent: 'border-purple-500 bg-purple-950/10 relative overflow-hidden ring-1 ring-purple-500/25',
    buttonAccent: 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-500/20',
    popular: true,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 149,
    credits: 1000,
    description: 'Tailored for agencies, studios, and high-frequency developers.',
    features: [
      '1,000 High-Fidelity Generations',
      'AI Prompt Enhancer Toggle',
      'Blazing Fast Generation Queue',
      'Bulk Download & Deletion',
      'Commercial Usage License',
      '24/7 Dedicated Account Manager',
    ],
    accent: 'border-purple-950/20 bg-slate-950/40',
    buttonAccent: 'bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300',
  },
];

const TOP_UPS = [
  { id: 'topup_100', name: 'Micro Boost', credits: 100, price: 10, desc: 'Instantly add 100 credits' },
  { id: 'topup_500', name: 'Power Refuel', credits: 500, price: 40, desc: 'Instantly add 500 credits' },
  { id: 'topup_1000', name: 'Cosmic Pack', credits: 1000, price: 75, desc: 'Instantly add 1,000 credits' },
];

export default function Pricing() {
  const { user, refreshUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Loading/Payment States
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [successModal, setSuccessModal] = useState<{ open: boolean; credits: number } | null>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(true);

  // Check URL params for successful checkout callbacks
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const status = params.get('payment_status');
    const creditsAdded = params.get('credits');

    if (status === 'success') {
      const parsedCredits = parseInt(creditsAdded || '100', 10);
      setSuccessModal({ open: true, credits: parsedCredits });
      refreshUser();
      
      // Clean query params
      navigate('/pricing', { replace: true });
    }
  }, [location]);

  // Load transactions
  const fetchTransactions = async () => {
    if (!user) return;
    try {
      const response = await api.get('/api/users/transactions');
      setTransactions(response.data);
    } catch (err) {
      console.error('Error fetching transactions:', err);
    } finally {
      setLoadingTransactions(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchTransactions();
    } else {
      setLoadingTransactions(false);
    }
  }, [user]);

  const handleCheckout = async (itemId: string) => {
    if (!user) {
      navigate('/login');
      return;
    }

    setCheckoutLoading(itemId);
    try {
      const response = await api.post('/api/payments/stripe/checkout', { itemId });
      const { url } = response.data;
      
      // Redirect to Checkout page (or mock success handler)
      window.location.href = url;
    } catch (err: any) {
      alert(err.response?.data?.error || err.message || 'Payment initiation failed');
    } finally {
      setCheckoutLoading(null);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 lg:px-8 py-12 flex flex-col gap-16 relative">
      
      {/* Success Modal */}
      {successModal?.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0c051a] border border-purple-500/35 max-w-sm w-full p-6 rounded-3xl text-center flex flex-col items-center gap-4 relative shadow-2xl">
            <button
              onClick={() => setSuccessModal(null)}
              className="absolute top-4 right-4 p-1 hover:bg-white/5 rounded-lg text-slate-500 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
              <CheckCircle className="w-6 h-6" />
            </div>
            <h3 className="text-white text-base font-bold tracking-tight">Payment Completed!</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Fantastic! Your account has been credited with **{successModal.credits} image generation credits**. Your balance has been refreshed.
            </p>
            <button
              onClick={() => setSuccessModal(null)}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold text-xs py-2.5 rounded-xl cursor-pointer hover:opacity-90"
            >
              Perfect, Let's Create!
            </button>
          </div>
        </div>
      )}

      {/* 1. Header */}
      <div className="text-center flex flex-col items-center gap-4 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-950/20 border border-purple-500/20 rounded-full text-[10px] font-bold tracking-widest uppercase text-purple-300">
          <Coins className="w-3.5 h-3.5 text-purple-400" />
          <span>Flexible Plans & Credits</span>
        </div>
        <h1 className="text-white text-3xl sm:text-5xl font-extrabold tracking-tight leading-none">
          Power Your Imagination
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm max-w-lg leading-relaxed">
          Unlock premium limits, commercial licensing, and priority generation queues. Choose a subscription plan or fuel up on-demand.
        </p>
      </div>

      {/* 2. Subscription Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {PLANS.map((plan) => (
          <div
            key={plan.id}
            className={`border rounded-3xl p-6 sm:p-8 flex flex-col gap-6 shadow-xl ${plan.accent} backdrop-blur-sm relative`}
          >
            {plan.popular && (
              <span className="absolute top-4 right-4 text-[9px] uppercase tracking-wider font-extrabold px-2 py-0.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded shadow">
                Most Popular
              </span>
            )}

            <div>
              <h3 className="text-white text-base font-bold tracking-tight">{plan.name}</h3>
              <p className="text-slate-500 text-xs mt-1 leading-relaxed min-h-[32px]">{plan.description}</p>
            </div>

            <div className="flex items-baseline gap-1 border-b border-slate-900 pb-5">
              <span className="text-white text-3xl sm:text-4xl font-extrabold font-mono">${plan.price}</span>
              <span className="text-slate-500 text-xs font-medium">/ month</span>
            </div>

            {/* Features */}
            <div className="flex-1">
              <h4 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-4">Included Features</h4>
              <ul className="flex flex-col gap-3 text-xs text-slate-300">
                {plan.features.map((feat, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => handleCheckout(plan.id)}
              disabled={checkoutLoading !== null}
              className={`w-full py-3 rounded-xl font-semibold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 ${plan.buttonAccent}`}
            >
              {checkoutLoading === plan.id ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Redirecting...</span>
                </>
              ) : user?.plan.toLowerCase() === plan.id ? (
                <span>Active Plan</span>
              ) : (
                <span>Select {plan.name} Plan</span>
              )}
            </button>
          </div>
        ))}
      </div>

      {/* 3. Top-ups Section */}
      <div className="bg-[#070311]/40 border border-purple-950/25 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row gap-8 items-center justify-between backdrop-blur-md shadow-lg">
        <div className="max-w-md flex flex-col gap-2">
          <span className="text-[10px] tracking-wider uppercase font-extrabold text-pink-400">Power Refuel</span>
          <h2 className="text-white text-xl sm:text-2xl font-extrabold tracking-tight">Running Low on Power?</h2>
          <p className="text-slate-400 text-xs leading-relaxed">
            Purchase extra on-demand credits instantly to refuel your generation capacity. Top-ups do not expire and can be stacked on top of any monthly plan.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full md:w-auto">
          {TOP_UPS.map((pack) => (
            <div
              key={pack.id}
              className="bg-slate-950/40 border border-purple-950/15 p-4 rounded-2xl flex flex-col gap-3 min-w-[150px] shadow-sm relative group hover:border-purple-500/20 transition-all"
            >
              <div>
                <p className="text-white text-xs font-bold">{pack.name}</p>
                <p className="text-slate-500 text-[10px] mt-0.5">{pack.desc}</p>
              </div>

              <div className="flex items-baseline gap-1 my-1">
                <span className="text-white text-xl font-bold font-mono">${pack.price}</span>
                <span className="text-[10px] text-slate-500">/ one-off</span>
              </div>

              <button
                onClick={() => handleCheckout(pack.id)}
                disabled={checkoutLoading !== null}
                className="w-full py-2 bg-purple-950/30 hover:bg-purple-900/30 text-purple-300 border border-purple-500/20 rounded-xl text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1 hover:border-purple-500/40"
              >
                {checkoutLoading === pack.id ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5" />
                    <span>Buy {pack.credits} Cr</span>
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Billing & Transactions History Table */}
      {user && (
        <div className="flex flex-col gap-4">
          <h3 className="text-white text-sm font-bold flex items-center gap-2 border-b border-slate-900 pb-2">
            <History className="w-4 h-4 text-purple-400" />
            Billing & Transaction History
          </h3>

          {loadingTransactions ? (
            <div className="w-full py-8 flex justify-center">
              <Loader2 className="w-5 h-5 animate-spin text-purple-500" />
            </div>
          ) : transactions.length === 0 ? (
            <p className="text-slate-500 text-xs italic">No transaction history logs found for this account.</p>
          ) : (
            <div className="overflow-x-auto bg-slate-950/40 border border-slate-900 rounded-2xl">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-[#0c051a] text-slate-400 font-mono text-[10px] uppercase tracking-wider border-b border-slate-900">
                  <tr>
                    <th className="p-4">Date</th>
                    <th className="p-4">Activity / Description</th>
                    <th className="p-4 text-right">Credits Change</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900/50">
                  {transactions.slice(0, 10).map((tx) => (
                    <tr key={tx.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-4 font-mono text-[11px] text-slate-500">
                        {new Date(tx.createdAt).toLocaleDateString()} {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="p-4">
                        <span className="font-semibold text-white">{tx.reason}</span>
                      </td>
                      <td className="p-4 text-right font-bold font-mono">
                        <span className={tx.type === 'credit' ? 'text-emerald-400' : 'text-rose-400'}>
                          {tx.type === 'credit' ? `+${tx.amount}` : `-${tx.amount}`}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
