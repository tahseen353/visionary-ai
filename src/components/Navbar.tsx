import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';
import { Sparkles, Coins, User, LogOut, Menu, X, Image } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout();
    setUserDropdownOpen(false);
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-[#030008]/80 backdrop-blur-md border-b border-purple-950/30 px-4 lg:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="bg-gradient-to-tr from-purple-600 to-pink-500 p-1.5 rounded-xl shadow-lg shadow-purple-500/20 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="font-sans font-bold text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-purple-400 bg-clip-text text-transparent">
            Lumina AI
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-1">
          <Link
            to="/"
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              isActive('/')
                ? 'text-white bg-white/5'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Home
          </Link>
          <Link
            to="/workspace"
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              isActive('/workspace')
                ? 'text-white bg-white/5'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Workspace
          </Link>
          <Link
            to="/gallery"
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              isActive('/gallery')
                ? 'text-white bg-white/5'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Gallery
          </Link>
          <Link
            to="/pricing"
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              isActive('/pricing')
                ? 'text-white bg-white/5'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Pricing
          </Link>
        </div>

        {/* Right Section: Auth State & CTA */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              {/* Credits Pill */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-950/30 border border-purple-500/30 rounded-full text-xs font-semibold text-purple-200 shadow-inner">
                <Coins className="w-3.5 h-3.5 text-purple-400" />
                <span>{user.credits} Credits</span>
              </div>

              {/* Plan Badge */}
              <span className="text-[10px] tracking-wider uppercase px-2 py-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-md font-bold text-white shadow-md">
                {user.plan}
              </span>

              {/* Profile Avatar with Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 text-white font-bold text-sm shadow-md border border-purple-400/40 hover:scale-105 transition-all cursor-pointer"
                >
                  {user.name.charAt(0).toUpperCase()}
                </button>

                {userDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setUserDropdownOpen(false)}
                    />
                    <div className="absolute right-0 mt-2.5 w-52 bg-slate-950/95 backdrop-blur-xl border border-slate-800/80 rounded-xl shadow-2xl p-2 z-20">
                      <div className="px-3 py-2 border-b border-slate-900">
                        <p className="text-xs text-slate-500">Logged in as</p>
                        <p className="text-sm font-semibold text-slate-200 truncate">{user.name}</p>
                        <p className="text-xs text-slate-400 truncate mt-0.5">{user.email}</p>
                      </div>
                      <Link
                        to="/gallery"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors mt-1"
                      >
                        <Image className="w-3.5 h-3.5 text-slate-400" />
                        My Generations
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors mt-1 cursor-pointer text-left"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Log Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="text-slate-400 hover:text-white text-sm font-semibold px-4 py-2 transition-colors"
              >
                Log In
              </Link>
              <Link
                to="/register"
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-sm font-semibold px-4.5 py-2 rounded-xl shadow-lg shadow-purple-500/25 hover:shadow-purple-500/35 hover:-translate-y-0.5 active:translate-y-0 transition-all"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center gap-3">
          {user && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-purple-950/20 border border-purple-500/20 rounded-full text-xs font-semibold text-purple-200">
              <Coins className="w-3.5 h-3.5 text-purple-400" />
              <span>{user.credits}</span>
            </div>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-slate-300 hover:text-white p-1 rounded-lg"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-[65px] bg-[#030008]/95 backdrop-blur-xl border-b border-purple-950/30 p-4 flex flex-col gap-3 shadow-2xl z-40">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="text-slate-300 hover:text-white py-2 text-sm font-medium"
          >
            Home
          </Link>
          <Link
            to="/workspace"
            onClick={() => setMobileMenuOpen(false)}
            className="text-slate-300 hover:text-white py-2 text-sm font-medium"
          >
            Workspace
          </Link>
          <Link
            to="/gallery"
            onClick={() => setMobileMenuOpen(false)}
            className="text-slate-300 hover:text-white py-2 text-sm font-medium"
          >
            Gallery
          </Link>
          <Link
            to="/pricing"
            onClick={() => setMobileMenuOpen(false)}
            className="text-slate-300 hover:text-white py-2 text-sm font-medium"
          >
            Pricing
          </Link>

          <hr className="border-slate-900 my-1" />

          {user ? (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">{user.name} ({user.plan})</span>
                <span className="text-xs text-purple-300 font-semibold">{user.credits} Credits</span>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 bg-rose-950/30 hover:bg-rose-900/30 text-rose-400 border border-rose-900/40 rounded-xl py-2 text-sm font-semibold transition-colors mt-1 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                Log Out
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5 mt-1">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center text-slate-300 hover:text-white py-2 text-sm font-semibold border border-slate-800 rounded-xl"
              >
                Log In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-2 text-sm font-semibold rounded-xl"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
