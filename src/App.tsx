import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.tsx';
import Navbar from './components/Navbar.tsx';
import Footer from './components/Footer.tsx';
import ShaderBackground from './components/ShaderBackground.tsx';
import Landing from './pages/Landing.tsx';
import Workspace from './pages/Workspace.tsx';
import Gallery from './pages/Gallery.tsx';
import Pricing from './pages/Pricing.tsx';
import Login from './pages/Login.tsx';
import Register from './pages/Register.tsx';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="relative min-h-screen text-slate-100 flex flex-col selection:bg-purple-500/35 selection:text-white">
          {/* Pulses slowly in the background behind all contents */}
          <ShaderBackground />

          {/* Core App Layout Header */}
          <Navbar />

          {/* Main content routing stage */}
          <main className="flex-1 flex flex-col">
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/workspace" element={<Workspace />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          {/* Layout Footer */}
          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

