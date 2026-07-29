import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, Zap, Image, Compass, Download, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

// Mock stunning community items
const COMMUNITY_GALLERY = [
  {
    title: 'Cosmic Jellyfish',
    prompt: 'A bioluminescent cosmic jellyfish floating through a neon-lit cybernetic city, 8k, cyberpunk style',
    style: 'Cyberpunk',
    url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=600&auto=format&fit=crop',
  },
  {
    title: 'Cyber Samurai',
    prompt: 'Cyberpunk warrior in high-tech reflective armor standing in rain, neon glowing streets',
    style: 'Anime',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop',
  },
  {
    title: 'Surreal Clockwork',
    prompt: 'Mechanical watch floating inside a spiral water portal, gold filigree, surrealism',
    style: '3D Render',
    url: 'https://images.unsplash.com/photo-1514306191717-452ec28c7814?q=80&w=600&auto=format&fit=crop',
  },
  {
    title: 'Mystic Forest',
    prompt: 'Ethereal forest with glowing flora, a silver deer walking across a crystal stream',
    style: 'Fantasy',
    url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=600&auto=format&fit=crop',
  },
  {
    title: 'Golden Astronaut',
    prompt: 'Astronaut fishing on a golden cloud in deep space, hyper-detailed, synthwave color palette',
    style: 'Default',
    url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=600&auto=format&fit=crop',
  },
  {
    title: 'Gothic Palace',
    prompt: 'Ancient gothic palace carved entirely out of dark volcanic glass under a crimson moon',
    style: 'Oil Painting',
    url: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=600&auto=format&fit=crop',
  },
];

export default function Landing() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [prompt, setPrompt] = useState('');

  const handleStartGenerating = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      navigate('/workspace', { state: { initialPrompt: prompt } });
    } else {
      navigate('/workspace');
    }
  };

  return (
    <div className="w-full relative py-12 lg:py-24 px-4 sm:px-6 lg:px-8">
      {/* 1. Hero Section */}
      <div className="max-w-4xl mx-auto text-center flex flex-col items-center gap-6">
        {/* Glow badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-950/20 border border-purple-500/20 rounded-full text-[11px] font-bold tracking-widest uppercase text-purple-300 shadow-md">
          <Zap className="w-3 h-3 text-purple-400 animate-pulse" />
          <span>Forge Your Digital Reality</span>
        </div>

        <h1 className="font-sans font-extrabold text-4xl sm:text-6xl tracking-tight text-white leading-[1.1]">
          Turn Your Imagination <br />
          Into <span className="bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-400 bg-clip-text text-transparent">Stunning AI Art</span>
        </h1>

        <p className="text-slate-400 text-sm sm:text-base max-w-2xl leading-relaxed">
          Transform text descriptions into high-fidelity, visually rich image assets in seconds. Powered by modern Gemini models with real-time style modifications and automated prompt enhancement.
        </p>

        {/* Floating Prompt Bar */}
        <form
          onSubmit={handleStartGenerating}
          className="w-full max-w-2xl mt-4 flex flex-col sm:flex-row items-center gap-2 p-1.5 bg-[#0a0515]/90 border border-purple-900/30 rounded-2xl shadow-2xl focus-within:border-purple-500/50 transition-all backdrop-blur-xl"
        >
          <input
            type="text"
            placeholder="Describe your masterpiece (e.g., A celestial fox running through nebulae...)"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="flex-1 w-full bg-transparent border-0 outline-none ring-0 py-2.5 px-3.5 text-xs text-white placeholder:text-slate-500"
          />
          <button
            type="submit"
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-500 hover:to-pink-400 text-white font-semibold text-xs px-5 py-2.5 rounded-xl cursor-pointer shadow-lg shadow-purple-500/20 active:scale-[0.98] transition-all"
          >
            <span>Generate Now</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>

      {/* 2. How It Works */}
      <div className="max-w-6xl mx-auto mt-24 lg:mt-36">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-white text-2xl sm:text-3xl font-extrabold tracking-tight">
            Seamless Three-Step Creation
          </h2>
          <p className="text-slate-500 text-xs mt-2">
            The professional mechanics fueling your creative workspace
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {/* Step 1 */}
          <div className="bg-[#090514]/40 border border-purple-950/20 p-6 rounded-2xl flex flex-col gap-4 shadow-xl backdrop-blur-sm">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold font-mono">
              01
            </div>
            <h3 className="text-white text-sm font-bold">Describe Your Concept</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Input any sentence. Toggle the optional **AI Prompt Enhancer** to automatically expand simple concepts into rich, visually descriptive rendering commands.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-[#090514]/40 border border-purple-950/20 p-6 rounded-2xl flex flex-col gap-4 shadow-xl backdrop-blur-sm">
            <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-pink-400 font-bold font-mono">
              02
            </div>
            <h3 className="text-white text-sm font-bold">Style and Aspect Ratio</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Select visual presets including Anime, Oil Painting, Cyberpunk, or 3D Render. Customize output dimensions via 1:1, 16:9, or 9:16 aspect ratios.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-[#090514]/40 border border-purple-950/20 p-6 rounded-2xl flex flex-col gap-4 shadow-xl backdrop-blur-sm">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold font-mono">
              03
            </div>
            <h3 className="text-white text-sm font-bold">Export and Regenerate</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Review generated outputs, download high-quality assets instantly, and review histories inside your personal Gallery Dashboard.
            </p>
          </div>
        </div>
      </div>

      {/* 3. Community Showcase */}
      <div className="max-w-6xl mx-auto mt-24 lg:mt-36">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-white text-2xl sm:text-3xl font-extrabold tracking-tight">
            Community Showcase
          </h2>
          <p className="text-slate-500 text-xs mt-2">
            Explore masterpieces crafted by developers and digital artists globally
          </p>
        </div>

        {/* Masonry-like grid */}
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
          {COMMUNITY_GALLERY.map((item, idx) => (
            <div
              key={idx}
              className="break-inside-avoid bg-[#0a0515]/80 border border-purple-950/30 rounded-2xl overflow-hidden group shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              {/* Image Container */}
              <div className="relative overflow-hidden aspect-[4/3] sm:aspect-auto">
                <img
                  src={item.url}
                  alt={item.title}
                  referrerPolicy="no-referrer"
                  className="w-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4 gap-1.5 backdrop-blur-[1px]">
                  <p className="text-xs font-bold text-white">{item.title}</p>
                  <p className="text-[10px] text-slate-300 line-clamp-2">{item.prompt}</p>
                  <span className="text-[9px] uppercase px-1.5 py-0.5 bg-purple-500/20 border border-purple-500/30 rounded text-purple-200 self-start font-bold">
                    {item.style}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Call to Action */}
      <div className="max-w-4xl mx-auto mt-24 lg:mt-36 bg-gradient-to-br from-[#0c051a] to-[#120525] border border-purple-950/40 rounded-3xl p-8 sm:p-12 text-center flex flex-col items-center gap-6 shadow-2xl relative overflow-hidden">
        {/* Subtle background flare */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-pink-600/10 rounded-full blur-3xl pointer-events-none" />

        <h2 className="text-white text-2xl sm:text-4xl font-extrabold tracking-tight">
          Ready to Redefine What's Possible?
        </h2>
        <p className="text-slate-400 text-xs sm:text-sm max-w-xl">
          Join thousands of visionaries turning simple prompts into breathtaking physical and digital reality. Create your first piece today with 50 free credits!
        </p>
        <button
          onClick={() => navigate('/workspace')}
          className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs px-6 py-3.5 rounded-xl cursor-pointer shadow-xl shadow-purple-500/20 active:scale-[0.98] transition-all"
        >
          <span>Forge Your Digital Reality</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
