import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';
import { Sparkles, Mail, Lock, Loader2, AlertCircle } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      navigate('/workspace');
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-slate-950/60 backdrop-blur-xl border border-purple-950/40 p-8 rounded-3xl shadow-2xl flex flex-col gap-6 relative overflow-hidden">
        {/* Glowing orb behind card */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col items-center gap-2 text-center">
          <div className="bg-gradient-to-tr from-purple-600 to-pink-500 p-2 rounded-2xl shadow-lg">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-white text-xl font-bold tracking-tight mt-1">Welcome Back</h2>
          <p className="text-slate-400 text-xs">Enter your details to access your creative workspace</p>
        </div>

        {error && (
          <div className="flex items-start gap-2 px-3 py-2.5 bg-rose-500/10 border border-rose-500/25 rounded-xl text-xs text-rose-400 font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Email field */}
          <div className="flex flex-col gap-1.5">
            <label className="text-slate-400 text-xs font-semibold">Email Address</label>
            <div className="relative flex items-center">
              <Mail className="absolute left-3 w-4 h-4 text-slate-500" />
              <input
                type="email"
                placeholder="alex@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950/50 border border-purple-950/40 hover:border-purple-800/40 focus:border-purple-500 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white placeholder:text-slate-600 outline-none transition-all"
              />
            </div>
          </div>

          {/* Password field */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-slate-400 text-xs font-semibold">Password</label>
              <a href="#" className="text-purple-400 hover:text-purple-300 text-[10px] font-medium transition-colors">
                Forgot password?
              </a>
            </div>
            <div className="relative flex items-center">
              <Lock className="absolute left-3 w-4 h-4 text-slate-500" />
              <input
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950/50 border border-purple-950/40 hover:border-purple-800/40 focus:border-purple-500 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white placeholder:text-slate-600 outline-none transition-all"
              />
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs py-3 rounded-xl cursor-pointer shadow-lg shadow-purple-500/15 disabled:opacity-50 transition-all mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Logging In...</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>

        <p className="text-slate-400 text-xs text-center">
          Don't have an account?{' '}
          <Link to="/register" className="text-purple-400 hover:text-purple-300 font-semibold transition-colors">
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
}
