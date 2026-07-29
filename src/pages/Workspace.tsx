import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';
import api from '../lib/api.ts';
import {
  Sparkles,
  Download,
  Trash2,
  RefreshCw,
  Loader2,
  Compass,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  Maximize2
} from 'lucide-react';

const STYLE_PRESETS = [
  { name: 'Default', icon: '🎨' },
  { name: 'Cyberpunk', icon: '🏙️' },
  { name: 'Anime', icon: '🌸' },
  { name: '3D Render', icon: '💎' },
  { name: 'Fantasy', icon: '🦄' },
  { name: 'Oil Painting', icon: '🖌️' },
  { name: 'Cinematic', icon: '🎬' },
  { name: 'Pixel Art', icon: '👾' },
];

const ASPECT_RATIOS = [
  { name: '1:1 Square', value: '1:1', ratioClass: 'aspect-square' },
  { name: '16:9 Landscape', value: '16:9', ratioClass: 'aspect-video' },
  { name: '9:16 Portrait', value: '9:16', ratioClass: 'aspect-[9/16]' },
  { name: '4:3 Standard', value: '4:3', ratioClass: 'aspect-[4/3]' },
  { name: '3:4 Mobile', value: '3:4', ratioClass: 'aspect-[3/4]' },
];

const LOADING_TIPS = [
  'Injecting bioluminescent colors...',
  'Polishing refraction and shadow angles...',
  'Whispering directives to the neural mesh...',
  'Refining fine specular details...',
  'Baking ambient cosmic energy...',
];

export default function Workspace() {
  const { user, refreshUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Route state
  const statePrompt = location.state?.initialPrompt || '';

  // Core generation states
  const [prompt, setPrompt] = useState(statePrompt);
  const [selectedStyle, setSelectedStyle] = useState('Default');
  const [selectedRatio, setSelectedRatio] = useState('1:1');
  const [enhancePrompt, setEnhancePrompt] = useState(false);

  // Status states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingTip, setLoadingTip] = useState(LOADING_TIPS[0]);
  
  // Current active result
  const [activeResult, setActiveResult] = useState<any | null>(null);
  
  // Previous generations of current session/user
  const [recentGenerations, setRecentGenerations] = useState<any[]>([]);

  // Rotate tips during loading
  useEffect(() => {
    let intervalId: any;
    if (loading) {
      let idx = 0;
      intervalId = setInterval(() => {
        idx = (idx + 1) % LOADING_TIPS.length;
        setLoadingTip(LOADING_TIPS[idx]);
      }, 3000);
    }
    return () => clearInterval(intervalId);
  }, [loading]);

  // Load recent generations
  const fetchRecentGenerations = async () => {
    if (!user) return;
    try {
      const response = await api.get(`/api/images?userId=${user.id}&limit=6`);
      setRecentGenerations(response.data);
    } catch (err) {
      console.error('Error fetching recent generations:', err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchRecentGenerations();
    }
  }, [user]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!user) {
      navigate('/login');
      return;
    }

    if (!prompt.trim()) {
      setError('Please describe what you want to generate.');
      return;
    }

    if (user.credits < 1) {
      setError('Insufficient credits. Please purchase more credits or upgrade your plan.');
      return;
    }

    setLoading(true);
    setActiveResult(null);

    try {
      const response = await api.post('/api/images/generate', {
        prompt,
        style: selectedStyle,
        aspectRatio: selectedRatio,
        enhancePrompt,
      });

      const { image, userCredits } = response.data;
      setActiveResult(image);
      
      // Sync state
      await refreshUser();
      await fetchRecentGenerations();
    } catch (err: any) {
      console.error('Generation error:', err);
      setError(err.response?.data?.error || err.message || 'Image generation failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/api/images/${id}`);
      setRecentGenerations((prev) => prev.filter((img) => img.id !== id));
      if (activeResult?.id === id) {
        setActiveResult(null);
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const handleDownload = async (imageUrl: string, promptText: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `lumina_ai_${promptText.slice(0, 20).replace(/\s+/g, '_')}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      // Direct open fallback if blob download fails due to sandbox
      window.open(imageUrl, '_blank');
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 lg:px-8 py-8 flex flex-col lg:flex-row gap-8">
      {/* 1. Sidebar Control Panel */}
      <div className="w-full lg:w-80 bg-[#070311]/50 border border-purple-950/20 p-5 rounded-2xl flex flex-col gap-6 shadow-xl backdrop-blur-md">
        <div>
          <h2 className="text-white text-sm font-bold tracking-tight">Sidebar Controls</h2>
          <p className="text-slate-500 text-[10px] mt-0.5">Customize your generative rendering engine</p>
        </div>

        {/* Style Preset Selector */}
        <div className="flex flex-col gap-2">
          <label className="text-slate-400 text-xs font-semibold">Style Preset</label>
          <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
            {STYLE_PRESETS.map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => setSelectedStyle(preset.name)}
                className={`flex items-center gap-2 p-2 rounded-xl border text-xs font-medium cursor-pointer transition-all ${
                  selectedStyle === preset.name
                    ? 'bg-purple-600/20 border-purple-500 text-white shadow-lg'
                    : 'bg-slate-950/30 border-slate-900/40 text-slate-400 hover:text-white hover:border-slate-800'
                }`}
              >
                <span>{preset.icon}</span>
                <span className="truncate">{preset.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Aspect Ratio Selector */}
        <div className="flex flex-col gap-2">
          <label className="text-slate-400 text-xs font-semibold">Aspect Ratio</label>
          <div className="flex flex-col gap-1.5">
            {ASPECT_RATIOS.map((ratio) => (
              <button
                key={ratio.value}
                type="button"
                onClick={() => setSelectedRatio(ratio.value)}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-xs font-medium cursor-pointer transition-all ${
                  selectedRatio === ratio.value
                    ? 'bg-purple-600/10 border-purple-500/70 text-white'
                    : 'bg-slate-950/30 border-slate-900/40 text-slate-400 hover:text-white hover:border-slate-800'
                }`}
              >
                <span>{ratio.name}</span>
                <span className="text-[10px] opacity-60 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                  {ratio.value}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* AI Prompt Enhancer Toggle */}
        <div className="flex items-center justify-between bg-purple-950/10 border border-purple-500/15 p-3 rounded-xl">
          <div className="flex flex-col gap-0.5">
            <span className="text-purple-200 text-xs font-bold flex items-center gap-1">
              <Compass className="w-3.5 h-3.5 text-purple-400" />
              Prompt Enhancer
            </span>
            <span className="text-slate-500 text-[9px]">Expands short text into high-fidelity scene prompts</span>
          </div>
          <button
            type="button"
            onClick={() => setEnhancePrompt(!enhancePrompt)}
            className="text-purple-400 hover:text-purple-300 transition-colors cursor-pointer"
          >
            {enhancePrompt ? (
              <ToggleRight className="w-8 h-8 text-purple-500" />
            ) : (
              <ToggleLeft className="w-8 h-8 text-slate-600" />
            )}
          </button>
        </div>

        {/* Model Identifier */}
        <div className="border-t border-slate-900 pt-4 flex flex-col gap-1 text-[10px] text-slate-500 font-mono">
          <div>Model: <span className="text-purple-400">gemini-3.1-flash-lite-image</span></div>
          <div>Deduction: <span className="text-pink-400">1 Credit / Image</span></div>
        </div>
      </div>

      {/* 2. Main Workspace & Console */}
      <div className="flex-1 flex flex-col gap-8">
        
        {/* Error Alert */}
        {error && (
          <div className="flex items-start gap-2 px-4 py-3 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-xs text-rose-400 font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold">Generation Failed</p>
              <p className="opacity-90 mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* Prompt Input Form */}
        <form
          onSubmit={handleGenerate}
          className="bg-[#070311]/50 border border-purple-950/20 p-5 rounded-3xl flex flex-col gap-4 shadow-xl backdrop-blur-md"
        >
          <div className="flex flex-col gap-1.5">
            <label className="text-slate-400 text-xs font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              Master Prompt
            </label>
            <textarea
              placeholder="What do you want to generate? Describe the objects, background, camera angle, and atmosphere in detail..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={3}
              className="w-full bg-slate-950/40 border border-purple-950/30 focus:border-purple-500 hover:border-purple-900/50 rounded-2xl p-3 text-xs text-white placeholder:text-slate-600 outline-none resize-none transition-all"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-[10px] text-slate-500">
              * By generating, you agree that creation ownership belongs entirely to you.
            </p>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-500 hover:to-pink-400 disabled:opacity-50 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-lg shadow-purple-500/20 cursor-pointer active:scale-[0.98] transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Generate (1 Credit)</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Results Visualizer Area */}
        <div className="bg-[#070311]/40 border border-purple-950/20 p-5 rounded-3xl min-h-[400px] flex items-center justify-center relative overflow-hidden backdrop-blur-md">
          
          {/* Loading Overlay */}
          {loading && (
            <div className="absolute inset-0 bg-[#030008]/90 z-10 flex flex-col items-center justify-center gap-4 text-center p-6 animate-fade-in">
              <div className="relative flex items-center justify-center w-16 h-16">
                <div className="absolute inset-0 border-4 border-purple-500/10 rounded-full" />
                <div className="absolute inset-0 border-4 border-t-purple-500 border-r-pink-500 rounded-full animate-spin" />
                <Sparkles className="w-6 h-6 text-purple-400 animate-pulse" />
              </div>
              <div className="flex flex-col gap-1 mt-2">
                <h3 className="text-white text-sm font-bold tracking-tight">Creating your masterpiece...</h3>
                <p className="text-purple-300 text-[10px] font-mono tracking-wider animate-pulse">{loadingTip}</p>
              </div>
            </div>
          )}

          {/* Active Generated Result */}
          {activeResult ? (
            <div className="w-full flex flex-col md:flex-row gap-6">
              {/* Image box */}
              <div className="flex-1 flex items-center justify-center bg-slate-950/40 rounded-2xl border border-slate-900 p-2 overflow-hidden">
                <div className={`relative w-full max-w-md ${
                  activeResult.aspectRatio === '16:9' ? 'aspect-video' :
                  activeResult.aspectRatio === '9:16' ? 'aspect-[9/16]' :
                  activeResult.aspectRatio === '4:3' ? 'aspect-[4/3]' :
                  activeResult.aspectRatio === '3:4' ? 'aspect-[3/4]' : 'aspect-square'
                } overflow-hidden rounded-xl border border-slate-900 group shadow-2xl`}>
                  <img
                    src={activeResult.imageUrl}
                    alt={activeResult.prompt}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  {/* Action Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end justify-between p-4">
                    <span className="text-[10px] text-slate-300 font-medium font-mono">{activeResult.aspectRatio}</span>
                    <button
                      onClick={() => handleDownload(activeResult.imageUrl, activeResult.prompt)}
                      className="p-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg shadow-lg cursor-pointer transition-colors"
                      title="Download Image"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Information box */}
              <div className="w-full md:w-80 flex flex-col gap-4">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-purple-400 font-mono">Completed</span>
                  <h3 className="text-white text-sm font-bold">Generation Details</h3>
                </div>

                <div className="bg-slate-950/50 border border-slate-900/50 p-4 rounded-xl flex flex-col gap-3 text-xs">
                  <div>
                    <span className="text-slate-500 font-semibold">User Prompt:</span>
                    <p className="text-slate-300 mt-0.5 text-xs italic leading-relaxed">"{activeResult.prompt}"</p>
                  </div>

                  {activeResult.enhancedPrompt && (
                    <div className="border-t border-slate-900/60 pt-3">
                      <span className="text-purple-300 font-bold flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-purple-400" />
                        AI Enhanced Prompt:
                      </span>
                      <p className="text-slate-300 mt-1 text-xs italic leading-relaxed bg-purple-950/10 border border-purple-500/10 p-2.5 rounded-lg text-[11px]">
                        "{activeResult.enhancedPrompt}"
                      </p>
                    </div>
                  )}

                  <div className="border-t border-slate-900/60 pt-3 grid grid-cols-2 gap-2 text-[10px] font-mono">
                    <div>Style: <span className="text-purple-400 font-bold">{activeResult.style}</span></div>
                    <div>Aspect Ratio: <span className="text-pink-400 font-bold">{activeResult.aspectRatio}</span></div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleDownload(activeResult.imageUrl, activeResult.prompt)}
                  className="w-full flex items-center justify-center gap-2 bg-purple-950/40 hover:bg-purple-900/40 text-purple-300 border border-purple-500/20 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download High-Res PNG</span>
                </button>
              </div>
            </div>
          ) : (
            /* Empty State */
            <div className="text-center flex flex-col items-center gap-3 p-8">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/25 flex items-center justify-center text-purple-400 shadow-md">
                <Compass className="w-6 h-6 animate-spin-slow" />
              </div>
              <h3 className="text-white text-sm font-bold">Unleash Your Imagination</h3>
              <p className="text-slate-500 text-xs max-w-sm leading-relaxed">
                Describe a scene, click the **Generate** button, and watch as Gemini renders a spectacular, high-fidelity masterpiece.
              </p>
            </div>
          )}

        </div>

        {/* Previous Generations Section */}
        {recentGenerations.length > 0 && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-900/60 pb-2">
              <h3 className="text-white text-sm font-bold flex items-center gap-2">
                <Compass className="w-4 h-4 text-purple-400" />
                Recent Generations
              </h3>
              <Link to="/gallery" className="text-purple-400 hover:text-purple-300 text-xs font-semibold flex items-center gap-1">
                <span>View Dashboard</span>
                <span>&rarr;</span>
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {recentGenerations.map((img) => (
                <div
                  key={img.id}
                  className="bg-slate-950/40 border border-slate-900/50 rounded-xl overflow-hidden group shadow-md hover:-translate-y-0.5 transition-all"
                >
                  <div className="relative aspect-square overflow-hidden bg-slate-900">
                    <img
                      src={img.imageUrl}
                      alt={img.prompt}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-2">
                      <button
                        onClick={() => setActiveResult(img)}
                        className="p-1.5 bg-slate-900 hover:bg-slate-800 text-purple-400 rounded-md border border-slate-800 shadow-lg cursor-pointer"
                        title="Display Details"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                      </button>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => handleDownload(img.imageUrl, img.prompt)}
                          className="p-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-md shadow-lg cursor-pointer"
                          title="Download"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(img.id)}
                          className="p-1.5 bg-rose-950/50 border border-rose-900/40 hover:bg-rose-900/50 text-rose-400 rounded-md shadow-lg cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
