/*
 * File: src/views/login_page.jsx
 * Version: 4.2.0
 */

import React, { useEffect, useMemo, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
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
      setError('Please enter a valid email');
      return;
    }

    if (!form.password || form.password.length < 6) {
      setError('Password too short');
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
        'Login failed. Check your credentials.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div 
      className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6"
      style={{ fontFamily: "'Poppins', sans-serif" }}
    >
      <div className="w-full max-w-[420px]">
        {/* Logo */}
        <div className="mb-10 text-center">
          <img
            src="/img/logo.jpg"
            alt="MotoMart"
            className="h-16 w-16 rounded-lg object-cover mx-auto mb-4"
          />
          <h1 
            className="text-[28px] text-white tracking-tight" 
            style={{ fontFamily: "'Questrial', sans-serif" }}
          >
            MotoMart IMS
          </h1>
        </div>

        {/* Card */}
        <div className="bg-zinc-900 rounded-lg border border-zinc-800 p-8">
          <h2 className="text-xl text-white mb-6">Sign in</h2>

          {error && (
            <div className="mb-5 p-3 rounded bg-red-950/50 border border-red-900/50 text-red-200 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm text-zinc-400 mb-1.5">Email</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@company.com"
                className="w-full px-3 py-2.5 rounded bg-zinc-800 border border-zinc-700 text-white text-[15px] placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600"
              />
            </div>

            <div>
              <label className="block text-sm text-zinc-400 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-3 py-2.5 rounded bg-zinc-800 border border-zinc-700 text-white text-[15px] placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-400"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm text-zinc-400 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="w-4 h-4 rounded border-zinc-700 bg-zinc-800 text-red-600"
              />
              Keep me signed in
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 py-2.5 rounded bg-red-600 text-white font-medium hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-zinc-600">
          © 2026 DotOrbit
        </p>
      </div>
    </div>
  );
}
