/*
 * File: src/views/login_page.jsx
 * Description: Ultra-minimalist login page with Poppins and Questrial fonts
 * Version: 4.0.0
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
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4" style={{ fontFamily: "'Poppins', sans-serif" }}>
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img
            src="/img/logo.jpg"
            alt="MotoMart"
            className="h-16 w-16 rounded-xl object-cover"
          />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-semibold text-white text-center mb-8" style={{ fontFamily: "'Questrial', sans-serif" }}>
          MotoMart IMS
        </h1>

        {/* Error */}
        {error && (
          <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-200 text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="Email"
              className="w-full px-4 py-3 rounded-lg bg-zinc-900 border border-zinc-800 text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700"
            />
          </div>

          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Password"
              className="w-full px-4 py-3 rounded-lg bg-zinc-900 border border-zinc-800 text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-400"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <label className="flex items-center gap-2 text-sm text-zinc-400 cursor-pointer">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="rounded border-zinc-700 bg-zinc-900 text-red-500 focus:ring-0 focus:ring-offset-0"
            />
            Remember me
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-red-500 text-white font-medium hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        {/* Footer */}
        <p className="mt-8 text-center text-xs text-zinc-600">
          © 2026 DotOrbit. All rights reserved.
        </p>
      </div>
    </div>
  );
}
