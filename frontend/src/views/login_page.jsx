/*
 * File: src/views/login_page.jsx
 * Description: Clean modern login page with subtle animations
 * Version: 4.1.0
 */

import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Lock, Mail, AlertCircle } from 'lucide-react';
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
    link.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&family=Questrial&display=swap';
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
      setError('Enter a valid email address.');
      return;
    }

    if (!form.password || form.password.length < 6) {
      setError('Password must be at least 6 characters.');
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
        err?.message ||
        'Authentication failed.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div 
      className="min-h-screen bg-zinc-950 flex items-center justify-center p-4 relative overflow-hidden"
      style={{ fontFamily: "'Poppins', sans-serif" }}
    >
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-red-500/5 rounded-full blur-3xl" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Card */}
        <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800/50 rounded-2xl p-8 shadow-2xl">
          {/* Logo & Title */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-red-500/20 rounded-2xl blur-xl" />
                <img
                  src="/img/logo.jpg"
                  alt="MotoMart"
                  className="h-20 w-20 rounded-2xl object-cover relative z-10 border border-zinc-800"
                />
              </div>
            </div>
            <h1 
              className="text-3xl font-semibold text-white mb-2" 
              style={{ fontFamily: "'Questrial', sans-serif" }}
            >
              MotoMart IMS
            </h1>
            <p className="text-zinc-500 text-sm">Sign in to your account</p>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3"
            >
              <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
              <p className="text-red-200 text-sm">{error}</p>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="name@company.com"
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-zinc-800/50 border border-zinc-700/50 text-white placeholder:text-zinc-600 focus:outline-none focus:border-red-500/50 focus:ring-2 focus:ring-red-500/20 transition"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Enter your password"
                  className="w-full pl-12 pr-12 py-3.5 rounded-xl bg-zinc-800/50 border border-zinc-700/50 text-white placeholder:text-zinc-600 focus:outline-none focus:border-red-500/50 focus:ring-2 focus:ring-red-500/20 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center">
              <label className="flex items-center gap-2 text-sm text-zinc-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="w-4 h-4 rounded border-zinc-700 bg-zinc-800 text-red-500 focus:ring-2 focus:ring-red-500/20 focus:ring-offset-0"
                />
                Remember me for 7 days
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg shadow-red-500/20"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-zinc-800/50 text-center">
            <p className="text-xs text-zinc-600">
              Developed by <span className="text-zinc-500 font-medium">DotOrbit</span>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
