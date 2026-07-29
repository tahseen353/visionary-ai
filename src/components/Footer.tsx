import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full bg-[#020005] border-t border-purple-950/20 py-12 px-6 lg:px-12 mt-auto">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
        {/* Branding Column */}
        <div className="flex flex-col gap-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-gradient-to-tr from-purple-600 to-pink-500 p-1.5 rounded-xl">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-sans font-bold text-lg tracking-tight text-white">
              Lumina AI
            </span>
          </Link>
          <p className="text-slate-400 text-xs leading-relaxed max-w-xs">
            Forge your digital reality with the world's most advanced text-to-image engine. Empowering creators, developers, and visionaries.
          </p>
        </div>

        {/* Navigation */}
        <div>
          <h4 className="text-white text-xs font-bold uppercase tracking-widest mb-4">Application</h4>
          <ul className="flex flex-col gap-2.5 text-xs text-slate-400">
            <li>
              <Link to="/" className="hover:text-purple-400 transition-colors">Home Landing</Link>
            </li>
            <li>
              <Link to="/workspace" className="hover:text-purple-400 transition-colors">Generator Workspace</Link>
            </li>
            <li>
              <Link to="/gallery" className="hover:text-purple-400 transition-colors">Gallery Dashboard</Link>
            </li>
            <li>
              <Link to="/pricing" className="hover:text-purple-400 transition-colors">Pricing & Plans</Link>
            </li>
          </ul>
        </div>

        {/* Technology */}
        <div>
          <h4 className="text-white text-xs font-bold uppercase tracking-widest mb-4">Technology</h4>
          <ul className="flex flex-col gap-2.5 text-xs text-slate-400">
            <li>
              <span className="text-slate-500">Gemini 3.1 Flash Image</span>
            </li>
            <li>
              <span className="text-slate-500">NodeJS / Express Server</span>
            </li>
            <li>
              <span className="text-slate-500">React 19 & Tailwind 4</span>
            </li>
            <li>
              <span className="text-slate-500">Stripe & Razorpay Integrations</span>
            </li>
          </ul>
        </div>

        {/* Disclaimer / Credentials */}
        <div>
          <h4 className="text-white text-xs font-bold uppercase tracking-widest mb-4">Legal</h4>
          <p className="text-[10px] text-slate-500 leading-relaxed mb-3">
            Secure processing by Stripe and Razorpay. All user creations are owned entirely by the generating user. Ensure proper copyright compliance.
          </p>
          <div className="text-xs text-slate-400 font-mono">
            Status: <span className="text-emerald-400">● Core Online</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto border-t border-slate-900/40 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <span>&copy; {new Date().getFullYear()} Lumina AI. All rights reserved.</span>
        <div className="flex gap-4">
          <a href="#" className="hover:text-purple-400 transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-purple-400 transition-colors">Privacy Policy</a>
        </div>
      </div>
    </footer>
  );
}
