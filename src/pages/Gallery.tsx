import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';
import api from '../lib/api.ts';
import {
  Image as ImageIcon,
  Coins,
  Shield,
  Search,
  Filter,
  Download,
  RefreshCw,
  Trash2,
  Loader2,
  Compass,
  LayoutGrid,
  List
} from 'lucide-react';

const STYLE_FILTERS = ['All', 'Default', 'Cyberpunk', 'Anime', '3D Render', 'Fantasy', 'Oil Painting', 'Cinematic', 'Pixel Art'];

export default function Gallery() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const fetchGallery = async () => {
    if (!user) return;
    try {
      const response = await api.get(`/api/images?userId=${user.id}`);
      setImages(response.data);
    } catch (err) {
      console.error('Error fetching gallery images:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchGallery();
    } else {
      setLoading(false);
    }
  }, [user]);

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
      window.open(imageUrl, '_blank');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this generation? This action cannot be undone.')) {
      return;
    }
    try {
      await api.delete(`/api/images/${id}`);
      setImages((prev) => prev.filter((img) => img.id !== id));
    } catch (err) {
      console.error('Error deleting image:', err);
    }
  };

  const handleRegenerate = (promptText: string, style: string, ratio: string) => {
    navigate('/workspace', {
      state: { initialPrompt: promptText },
    });
  };

  // Filter logic
  const filteredImages = images.filter((img) => {
    const matchesSearch = img.prompt.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (img.enhancedPrompt && img.enhancedPrompt.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStyle = selectedStyle === 'All' || img.style === selectedStyle;
    return matchesSearch && matchesStyle;
  });

  if (!user) {
    return (
      <div className="w-full min-h-[70vh] flex flex-col items-center justify-center text-center p-8 gap-4">
        <div className="w-14 h-14 bg-purple-500/10 border border-purple-500/25 rounded-2xl flex items-center justify-center text-purple-400">
          <ImageIcon className="w-7 h-7" />
        </div>
        <h2 className="text-white text-xl font-bold tracking-tight">Your Personal Gallery</h2>
        <p className="text-slate-400 text-xs max-w-sm leading-relaxed">
          Unlock your personal gallery dashboard to track your history, download previous renders, and manage credits.
        </p>
        <Link
          to="/login"
          className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-purple-500/20 active:scale-[0.98] transition-all"
        >
          Sign In to Get Started
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 lg:px-8 py-8 flex flex-col gap-8">
      {/* 1. Header & Quick Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-purple-950/20 pb-6">
        <div>
          <h1 className="text-white text-xl sm:text-2xl font-extrabold tracking-tight">Welcome Back, {user.name}</h1>
          <p className="text-slate-500 text-[10px] sm:text-xs mt-0.5">Review, manage, and download all your visual creations in one place.</p>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-2 bg-[#070311]/40 border border-purple-950/25 p-2 rounded-2xl shadow-inner backdrop-blur-sm self-start">
          <div className="flex flex-col gap-0.5 px-3 py-1 bg-slate-950/30 border border-slate-900 rounded-xl min-w-[90px]">
            <span className="text-[9px] uppercase tracking-wider text-slate-500 font-mono">Total Images</span>
            <span className="text-sm font-bold text-white font-mono">{images.length}</span>
          </div>
          <div className="flex flex-col gap-0.5 px-3 py-1 bg-slate-950/30 border border-slate-900 rounded-xl min-w-[90px]">
            <span className="text-[9px] uppercase tracking-wider text-slate-500 font-mono">Credits</span>
            <span className="text-sm font-bold text-purple-300 font-mono flex items-center gap-1">
              <Coins className="w-3.5 h-3.5 text-purple-400" />
              {user.credits}
            </span>
          </div>
          <div className="flex flex-col gap-0.5 px-3 py-1 bg-slate-950/30 border border-slate-900 rounded-xl min-w-[90px]">
            <span className="text-[9px] uppercase tracking-wider text-slate-500 font-mono">Active Plan</span>
            <span className="text-sm font-bold text-indigo-400 font-mono uppercase tracking-wide">{user.plan}</span>
          </div>
        </div>
      </div>

      {/* 2. Search and Filtering bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-[#070311]/30 border border-purple-950/15 p-4 rounded-2xl backdrop-blur-md">
        
        {/* Search */}
        <div className="w-full md:w-80 relative flex items-center">
          <Search className="absolute left-3 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search prompt keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950/40 border border-purple-950/20 hover:border-purple-900/50 focus:border-purple-500 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white placeholder:text-slate-600 outline-none transition-all"
          />
        </div>

        {/* Style Filters scrollbar */}
        <div className="flex items-center gap-2 max-w-full overflow-x-auto pb-1.5 md:pb-0 pr-1 select-none">
          {STYLE_FILTERS.map((style) => (
            <button
              key={style}
              type="button"
              onClick={() => setSelectedStyle(style)}
              className={`px-3 py-1.5 rounded-lg border text-[11px] font-semibold tracking-wide cursor-pointer transition-all ${
                selectedStyle === style
                  ? 'bg-purple-600/20 border-purple-500 text-white shadow-md'
                  : 'bg-slate-950/40 border-slate-900/40 text-slate-400 hover:text-white hover:border-slate-800'
              }`}
            >
              {style}
            </button>
          ))}
        </div>

        {/* View Mode Grid/List toggle */}
        <div className="hidden md:flex bg-slate-950/40 border border-slate-900/50 p-1 rounded-xl">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-lg cursor-pointer transition-colors ${
              viewMode === 'grid' ? 'bg-purple-500/15 text-purple-400' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded-lg cursor-pointer transition-colors ${
              viewMode === 'list' ? 'bg-purple-500/15 text-purple-400' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* 3. Generations Display */}
      {loading ? (
        <div className="w-full h-48 flex flex-col items-center justify-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
          <p className="text-xs text-slate-500">Retrieving your digital reality database...</p>
        </div>
      ) : filteredImages.length === 0 ? (
        <div className="w-full bg-[#070311]/20 border border-purple-950/10 p-12 rounded-3xl text-center flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/5 border border-purple-500/15 flex items-center justify-center text-purple-400">
            <Compass className="w-5 h-5 animate-pulse" />
          </div>
          <h3 className="text-white text-sm font-bold">No Generations Found</h3>
          <p className="text-slate-500 text-xs max-w-sm leading-relaxed">
            {images.length === 0
              ? "You haven't generated any images yet! Visit the Workspace and spark your creativity."
              : 'Try relaxing your filter criteria or search keyword to find matching generations.'}
          </p>
          {images.length === 0 && (
            <Link
              to="/workspace"
              className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold px-4 py-2 rounded-xl mt-1.5 shadow-lg shadow-purple-500/10"
            >
              Start Generating
            </Link>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid Layout */
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredImages.map((img) => (
            <div
              key={img.id}
              className="bg-[#070311]/50 border border-purple-950/20 rounded-2xl overflow-hidden group shadow-lg hover:-translate-y-1 transition-all duration-300 backdrop-blur-sm"
            >
              {/* Aspect Ratio Box Wrapper */}
              <div className="relative aspect-square overflow-hidden bg-slate-900">
                <img
                  src={img.imageUrl}
                  alt={img.prompt}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                
                {/* Hover Action Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4 gap-2.5 backdrop-blur-[1px]">
                  <p className="text-[10px] text-slate-300 font-medium line-clamp-2 italic">"{img.prompt}"</p>
                  
                  <div className="flex items-center justify-between border-t border-slate-900/60 pt-2 mt-0.5">
                    <span className="text-[8px] tracking-wider uppercase px-1.5 py-0.5 bg-purple-500/20 border border-purple-500/30 rounded text-purple-200 font-bold">
                      {img.style}
                    </span>
                    
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => handleRegenerate(img.prompt, img.style, img.aspectRatio)}
                        className="p-1.5 bg-slate-900 hover:bg-slate-800 text-purple-400 rounded-md border border-slate-800 cursor-pointer"
                        title="Regenerate Prompt"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDownload(img.imageUrl, img.prompt)}
                        className="p-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-md shadow-lg cursor-pointer"
                        title="Download PNG"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(img.id)}
                        className="p-1.5 bg-rose-950/50 border border-rose-900/40 hover:bg-rose-900/50 text-rose-400 rounded-md cursor-pointer"
                        title="Delete Card"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List Layout */
        <div className="flex flex-col gap-4">
          {filteredImages.map((img) => (
            <div
              key={img.id}
              className="bg-[#070311]/50 border border-purple-950/20 p-4 rounded-2xl flex flex-col sm:flex-row gap-4 items-center shadow-md backdrop-blur-sm group"
            >
              {/* Image box */}
              <div className="w-24 h-24 shrink-0 rounded-xl overflow-hidden bg-slate-900 border border-slate-800">
                <img
                  src={img.imageUrl}
                  alt={img.prompt}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Text info */}
              <div className="flex-1 min-w-0 flex flex-col gap-1.5 text-center sm:text-left">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <span className="text-[9px] uppercase font-bold tracking-wider text-purple-400 font-mono">Style: {img.style}</span>
                  <span className="text-[9px] uppercase font-bold tracking-wider text-pink-400 font-mono">Ratio: {img.aspectRatio}</span>
                  <span className="text-[9px] text-slate-500 font-mono">{new Date(img.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="text-white text-xs font-semibold leading-relaxed line-clamp-2">"{img.prompt}"</p>
                {img.enhancedPrompt && (
                  <p className="text-slate-400 text-[10px] leading-relaxed line-clamp-1 italic">
                    Enhanced: "{img.enhancedPrompt}"
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => handleRegenerate(img.prompt, img.style, img.aspectRatio)}
                  className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-purple-400 rounded-xl cursor-pointer"
                  title="Regenerate"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDownload(img.imageUrl, img.prompt)}
                  className="p-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl shadow-lg cursor-pointer"
                  title="Download"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(img.id)}
                  className="p-2.5 bg-rose-950/40 border border-rose-900/40 hover:bg-rose-900/50 text-rose-400 rounded-xl cursor-pointer"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
