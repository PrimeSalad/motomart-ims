/*
 * File: src/views/login_page.jsx
 * Version: 5.0.0
 */

import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createApiClient } from '../lib/api_client';
import { useAuth } from '../state/auth_context';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function useLoginFonts() {
  useEffect(() => {
    if (document.getElementById('login-fonts')) return;
    
    const link = document.createElement('link');
    link.id = 'login-fonts';
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=Questrial&display=swap';
    document.head.appendChild(link);
  }, []);
}

export function LoginPage() {
  useLoginFonts();
  
  const { setAuth, token } = useAuth();
  const navigate = useNavigate();
  const api = useMemo(() => createApiClient({ token: null }), []);

  const [form, setForm] = useState({
    email: localStorage.getItem('cc_ims_remembered_email') || '',
    password: ''
  });
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      navigate('/', { replace: true });
    }
  }, [token, navigate]);

  async function handleLogin(e) {
    e.preventDefault();
    setError(null);

    if (!form.email || !EMAIL_RE.test(form.email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (!form.password || form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/auth/login', { ...form });
      
      if (remember) {
        localStorage.setItem('cc_ims_remembered_email', form.email);
      } else {
        localStorage.removeItem('cc_ims_remembered_email');
      }

      setAuth(response.data.data, { remember });
      navigate('/', { replace: true });
    } catch (err) {
      setError(
        err?.response?.data?.error?.message ||
        'Invalid email or password'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div 
      className="min-h-screen bg-black flex"
      style={{ fontFamily: "'Poppins', sans-serif" }}
    >
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-red-600 to-red-800 p-12 flex-col justify-between relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }} />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <img
              src="/img/logo.jpg"
              alt="MotoMart"
              className="h-14 w-14 rounded-xl object-cover border-2 border-white/20"
            />
            <div>
              <div className="text-white text-2xl font-bold" style={{ fontFamily: "'Questrial', sans-serif" }}>
                MotoMart
              </div>
              <div className="text-red-100 text-sm">Inventory Management</div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-5xl font-bold text-white mb-6 leading-tight" style={{ fontFamily: "'Questrial', sans-serif" }}>
              Manage your<br />inventory with ease
            </h1>
            <p className="text-red-50 text-lg leading-relaxed max-w-md">
              Streamline your motorcycle parts inventory with our powerful management system.
            </p>
          </motion.div>
        </div>

        <div className="relative z-10 text-red-50 text-sm">
          © 2026 DotOrbit. All rights reserved.
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <img
              src="/img/logo.jpg"
              alt="MotoMart"
              className="h-16 w-16 rounded-xl object-cover"
            />
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: "'Questrial', sans-serif" }}>
              Welcome back
            </h2>
            <p className="text-zinc-400">Sign in to access your dashboard</p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Email address
              </label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@company.com"
                className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-white placeholder:text-zinc-600 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-white placeholder:text-zinc-600 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-zinc-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-red-600 focus:ring-red-500 focus:ring-offset-0"
                />
                Remember me
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 py-3.5 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 group"
            >
              {loading ? (
                'Signing in...'
              ) : (
                <>
                  Sign in
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center lg:hidden">
            <p className="text-xs text-zinc-600">
              © 2026 DotOrbit. All rights reserved.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
