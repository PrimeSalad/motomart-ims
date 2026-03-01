/*
 * MotoMart IMS
 * File: src/views/reset_password_page.jsx
 * Version: 1.0.0
 * Purpose: Password reset screen (token from email link).
 */

import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, ShieldCheck } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { createApiClient } from '../lib/api_client';

export function ResetPasswordPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const api = useMemo(() => createApiClient({ token: null }), []);

  const token = params.get('token') || '';

  const [pw1, setPw1] = useState('');
  const [pw2, setPw2] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);
  const [err, setErr] = useState(null);

  const canSubmit = token && pw1.length >= 8 && pw1 === pw2 && !loading;

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr(null);
    setMsg(null);

    if (!token) {
      setErr('Missing reset token. Please open the link from your email.');
      return;
    }
    if (pw1.length < 8) {
      setErr('Password must be at least 8 characters.');
      return;
    }
    if (pw1 !== pw2) {
      setErr('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, new_password: pw1 });
      setMsg('Password reset successful. You can now sign in.');
      setTimeout(() => navigate('/login', { replace: true }), 900);
    } catch (e2) {
      const m = e2?.response?.data?.error?.message || e2?.message || 'Reset failed.';
      setErr(m);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#06060a] text-white relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 -left-40 h-[420px] w-[420px] rounded-full bg-red-500/20 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-[520px] w-[520px] rounded-full bg-rose-500/15 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.05),transparent_55%)]" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[900px] items-center justify-center px-4 py-10">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="w-full max-w-md rounded-[28px] border border-white/10 bg-white/[0.03] p-6 sm:p-8 backdrop-blur-xl shadow-[0_18px_60px_rgba(0,0,0,0.55)]"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-2xl font-black tracking-tight">Set new password</div>
              <div className="mt-1 text-sm text-white/60">
                Choose a strong password (min 8 characters).
              </div>
            </div>
            <div className="h-11 w-11 rounded-2xl border border-white/10 bg-white/[0.02] grid place-items-center">
              <ShieldCheck className="h-5 w-5 text-red-300" />
            </div>
          </div>

          {err ? (
            <div className="mt-5 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-white/80">
              {err}
            </div>
          ) : null}
          {msg ? (
            <div className="mt-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-white/80">
              {msg}
            </div>
          ) : null}

          <form className="mt-6 space-y-4" onSubmit={onSubmit}>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-[0.18em] text-white/60">
                New password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/35" />
                <input
                  type="password"
                  value={pw1}
                  onChange={(e) => setPw1(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.02] px-12 py-3 text-sm outline-none transition focus:border-white/20 focus:bg-white/[0.03]"
                  placeholder="••••••••"
                  autoComplete="new-password"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-[0.18em] text-white/60">
                Confirm password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/35" />
                <input
                  type="password"
                  value={pw2}
                  onChange={(e) => setPw2(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.02] px-12 py-3 text-sm outline-none transition focus:border-white/20 focus:bg-white/[0.03]"
                  placeholder="••••••••"
                  autoComplete="new-password"
                />
              </div>
              {pw2 && pw1 !== pw2 ? (
                <div className="text-[12px] text-red-300/90">Passwords do not match.</div>
              ) : null}
            </div>

            <button
              type="submit"
              disabled={!canSubmit}
              className="group mt-2 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-red-500 to-rose-500 px-4 py-3 text-sm font-black tracking-wide text-black shadow-[0_18px_40px_rgba(244,63,94,0.25)] transition hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/30 border-t-black" />
                  Saving…
                </>
              ) : (
                'Save password'
              )}
            </button>

            <button
              type="button"
              onClick={() => navigate('/login')}
              className="w-full rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm font-bold text-white/80 hover:bg-white/[0.05] transition"
            >
              Back to login
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
