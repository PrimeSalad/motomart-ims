/*
 * File: src/views/login_page.jsx
 * Description: Minimalist dark-mode login page with red-accent theme,
 * Poppins and Questrial typography, preserved authentication flow,
 * and simplified premium UI.
 * Version: 3.0.0
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ShieldAlert,
  X,
  CheckCircle2,
  ArrowRight,
  Fingerprint
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createApiClient } from '../lib/api_client';
import { useAuth } from '../state/auth_context';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const FONT_LINK_ID = 'login-page-fonts-v3';
const FONT_PRECONNECT_ONE_ID = 'login-page-preconnect-1';
const FONT_PRECONNECT_TWO_ID = 'login-page-preconnect-2';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.08
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: 'easeOut' }
  }
};

/**
 * Append link element only once.
 * @param {{ id: string, rel: string, href: string, crossOrigin?: string }} options
 * @returns {void}
 */
function appendLinkTag(options) {
  if (typeof document === 'undefined') {
    return;
  }

  if (document.getElementById(options.id)) {
    return;
  }

  const linkElement = document.createElement('link');
  linkElement.id = options.id;
  linkElement.rel = options.rel;
  linkElement.href = options.href;

  if (options.crossOrigin) {
    linkElement.crossOrigin = options.crossOrigin;
  }

  document.head.appendChild(linkElement);
}

/**
 * Load Google Fonts dynamically for this page.
 * @returns {void}
 */
function useLoginFonts() {
  useEffect(() => {
    appendLinkTag({
      id: FONT_PRECONNECT_ONE_ID,
      rel: 'preconnect',
      href: 'https://fonts.googleapis.com'
    });

    appendLinkTag({
      id: FONT_PRECONNECT_TWO_ID,
      rel: 'preconnect',
      href: 'https://fonts.gstatic.com',
      crossOrigin: 'anonymous'
    });

    appendLinkTag({
      id: FONT_LINK_ID,
      rel: 'stylesheet',
      href:
        'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=Questrial&display=swap'
    });
  }, []);
}

/**
 * Combine class names safely.
 * @param  {...string} values
 * @returns {string}
 */
function classNames(...values) {
  return values.filter(Boolean).join(' ');
}

export function LoginPage() {
  useLoginFonts();

  const { setAuth, token } = useAuth();
  const navigate = useNavigate();
  const api = useMemo(() => createApiClient({ token: null }), []);

  const savedEmail = localStorage.getItem('cc_ims_remembered_email') || '';

  const [form, setForm] = useState({
    email: savedEmail,
    password: ''
  });
  const [remember, setRemember] = useState(!!savedEmail || true);
  const [error, setError] = useState(null);
  const [capsLockOn, setCapsLockOn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [forgotModal, setForgotModal] = useState({
    open: false,
    email: '',
    sent: false,
    loading: false
  });

  const emailRef = useRef(null);

  useEffect(() => {
    if (token) {
      navigate('/', { replace: true });
    }

    if (!savedEmail) {
      emailRef.current?.focus?.();
    }
  }, [token, navigate, savedEmail]);

  /**
   * Validate login form.
   * @returns {string | null}
   */
  function validate() {
    if (!form.email || !EMAIL_RE.test(form.email)) {
      return 'Enter a valid email address.';
    }

    if (!form.password || form.password.length < 6) {
      return 'Password must be at least 6 characters.';
    }

    return null;
  }

  /**
   * Handle login submit.
   * @param {React.FormEvent<HTMLFormElement>} event
   * @returns {Promise<void>}
   */
  async function handleLogin(event) {
    event.preventDefault();
    setError(null);

    const validationError = validate();

    if (validationError) {
      setError(validationError);
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
    } catch (requestError) {
      setError(
        requestError?.response?.data?.error?.message ||
        requestError?.message ||
        'Authentication failed.'
      );
    } finally {
      setLoading(false);
    }
  }

  /**
   * Handle forgot password request.
   * @param {React.FormEvent<HTMLFormElement>} event
   * @returns {Promise<void>}
   */
  async function handleForgotSubmit(event) {
    event.preventDefault();

    if (!EMAIL_RE.test(forgotModal.email)) {
      return;
    }

    setForgotModal((previousState) => ({
      ...previousState,
      loading: true
    }));

    try {
      await api.post('/auth/forgot-password', { email: forgotModal.email });
      setForgotModal((previousState) => ({
        ...previousState,
        sent: true,
        loading: false
      }));
    } catch {
      setForgotModal((previousState) => ({
        ...previousState,
        sent: true,
        loading: false
      }));
    }
  }

  return (
    <div
      className="relative min-h-screen overflow-hidden bg-[#070707] text-white"
      style={{ fontFamily: "'Poppins', sans-serif" }}
    >
      {/* Background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-12%] top-[-12%] h-[28rem] w-[28rem] rounded-full bg-red-700/18 blur-[130px]" />
        <div className="absolute bottom-[-12%] right-[-12%] h-[26rem] w-[26rem] rounded-full bg-red-500/10 blur-[140px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.05),transparent_35%)]" />
        <div className="absolute inset-0 opacity-[0.05] [background-image:linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] [background-size:36px_36px]" />
      </div>

      <main className="relative z-10 mx-auto flex min-h-screen max-w-7xl items-center px-5 py-8 sm:px-8 lg:px-10">
        <div className="grid w-full grid-cols-1 gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
          {/* Left Content - HIDDEN ON MOBILE */}
          <motion.section
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="hidden lg:flex flex-col justify-center"
          >
            <motion.div variants={itemVariants} className="mb-8 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                <img
                  src="/img/logo.jpg"
                  alt="MotoMart Logo"
                  className="h-full w-full object-cover"
                />
              </div>

              <div>
                <div className="text-[11px] uppercase tracking-[0.32em] text-red-400">
                  MotoMart
                </div>
                <div className="text-sm text-zinc-400">Inventory Management System</div>
              </div>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="max-w-2xl text-4xl leading-[0.95] text-white sm:text-5xl lg:text-6xl"
              style={{ fontFamily: "'Questrial', sans-serif" }}
            >
              Minimal access,
              <br />
              maximum control.
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="mt-6 max-w-xl text-sm leading-7 text-zinc-400 sm:text-base"
            >
              A cleaner login experience for your inventory operations, built with a
              focused dark interface and sharp red accents for a modern command-center feel.
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3"
            >
              {[
                'Secure authentication',
                'Fast session access',
                'Minimal visual noise'
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 text-sm text-zinc-300 backdrop-blur-xl"
                >
                  {item}
                </div>
              ))}
            </motion.div>
          </motion.section>

          {/* Right Card */}
          <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className="flex items-center justify-center"
          >
            <div className="relative w-full max-w-md">
              <div className="absolute -inset-[1px] rounded-[32px] bg-gradient-to-b from-red-500/25 via-white/5 to-transparent blur-xl" />

              <div className="relative rounded-[32px] border border-white/10 bg-black/40 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-2xl sm:p-8">
                <div className="mb-8 flex items-start justify-between gap-4">
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.28em] text-zinc-500">
                      Welcome Back
                    </div>
                    <h2
                      className="mt-2 text-3xl text-white"
                      style={{ fontFamily: "'Questrial', sans-serif" }}
                    >
                      Login
                    </h2>
                    <p className="mt-2 text-sm text-zinc-400">
                      Sign in to access the dashboard.
                    </p>
                  </div>

                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10">
                    <Fingerprint className="h-5 w-5 text-red-400" />
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  {error ? (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      className="mb-5 rounded-2xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-200"
                    >
                      <div className="flex items-start gap-3">
                        <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
                        <span>{error}</span>
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>

                <form onSubmit={handleLogin} className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-[11px] font-medium uppercase tracking-[0.22em] text-zinc-500">
                      Email
                    </label>

                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                      <input
                        ref={emailRef}
                        type="email"
                        required
                        value={form.email}
                        onChange={(event) =>
                          setForm((previousState) => ({
                            ...previousState,
                            email: event.target.value
                          }))
                        }
                        placeholder="name@company.com"
                        className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-11 py-3.5 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-red-500/35 focus:bg-white/[0.04] focus:ring-2 focus:ring-red-500/10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <label className="text-[11px] font-medium uppercase tracking-[0.22em] text-zinc-500">
                        Password
                      </label>

                      {capsLockOn ? (
                        <span className="text-[10px] uppercase tracking-[0.16em] text-amber-400">
                          Caps Lock On
                        </span>
                      ) : null}
                    </div>

                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={form.password}
                        onChange={(event) =>
                          setForm((previousState) => ({
                            ...previousState,
                            password: event.target.value
                          }))
                        }
                        onKeyUp={(event) =>
                          setCapsLockOn(event.getModifierState('CapsLock'))
                        }
                        placeholder="••••••••"
                        className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-11 py-3.5 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-red-500/35 focus:bg-white/[0.04] focus:ring-2 focus:ring-red-500/10"
                      />

                      <button
                        type="button"
                        onClick={() => setShowPassword((previousState) => !previousState)}
                        className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl text-zinc-500 transition hover:bg-white/5 hover:text-white"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 pt-1">
                    <label className="flex cursor-pointer items-center gap-3">
                      <input
                        type="checkbox"
                        className="hidden"
                        checked={remember}
                        onChange={(event) => setRemember(event.target.checked)}
                      />

                      <span
                        className={classNames(
                          'flex h-5 w-5 items-center justify-center rounded-md border transition',
                          remember
                            ? 'border-red-500 bg-red-500 text-black'
                            : 'border-white/15 bg-white/[0.02] text-transparent'
                        )}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      </span>

                      <span className="text-sm text-zinc-400">Remember me</span>
                    </label>

                    <button
                      type="button"
                      onClick={() =>
                        setForgotModal((previousState) => ({
                          ...previousState,
                          open: true
                        }))
                      }
                      className="text-xs uppercase tracking-[0.18em] text-red-400 transition hover:text-red-300"
                    >
                      Forgot?
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="group relative w-full overflow-hidden rounded-2xl bg-red-500 px-5 py-3.5 text-sm font-semibold text-black transition hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <span className="flex items-center justify-center gap-2">
                      {loading ? 'Authenticating...' : 'Login'}
                      {!loading ? (
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      ) : null}
                    </span>
                  </button>
                </form>

                <div className="mt-6 border-t border-white/10 pt-5 text-center">
                  <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-600">
                    Developed by DotOrbit
                  </p>
                </div>
              </div>
            </div>
          </motion.section>
        </div>
      </main>

      {/* Forgot Password Modal */}
      <AnimatePresence>
        {forgotModal.open ? (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-5 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() =>
                setForgotModal((previousState) => ({
                  ...previousState,
                  open: false
                }))
              }
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 14 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 14 }}
              transition={{ duration: 0.2 }}
              className="relative z-10 w-full max-w-md rounded-[30px] border border-white/10 bg-[#0c0c0d] p-6 shadow-[0_20px_70px_rgba(0,0,0,0.55)] sm:p-7"
            >
              <button
                type="button"
                onClick={() =>
                  setForgotModal((previousState) => ({
                    ...previousState,
                    open: false
                  }))
                }
                className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-xl text-zinc-500 transition hover:bg-white/5 hover:text-white"
                aria-label="Close forgot password modal"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="pr-10">
                <div className="text-[11px] uppercase tracking-[0.22em] text-red-400">
                  Account Recovery
                </div>
                <h3
                  className="mt-2 text-2xl text-white"
                  style={{ fontFamily: "'Questrial', sans-serif" }}
                >
                  Reset access
                </h3>
                <p className="mt-2 text-sm leading-6 text-zinc-400">
                  Enter your registered email. If valid, you’ll receive a recovery link.
                </p>
              </div>

              {!forgotModal.sent ? (
                <form onSubmit={handleForgotSubmit} className="mt-6 space-y-4">
                  <input
                    type="email"
                    required
                    value={forgotModal.email}
                    onChange={(event) =>
                      setForgotModal((previousState) => ({
                        ...previousState,
                        email: event.target.value
                      }))
                    }
                    placeholder="name@company.com"
                    className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-red-500/35 focus:ring-2 focus:ring-red-500/10"
                  />

                  <button
                    type="submit"
                    disabled={forgotModal.loading}
                    className="w-full rounded-2xl bg-red-500 px-5 py-3.5 text-sm font-semibold text-black transition hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {forgotModal.loading ? 'Processing...' : 'Send recovery link'}
                  </button>
                </form>
              ) : (
                <div className="mt-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-5 py-5 text-center">
                  <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-400" />
                  <p className="mt-3 text-sm font-semibold text-emerald-100">
                    Recovery request received
                  </p>
                  <p className="mt-1 text-xs leading-5 text-emerald-200/70">
                    Check your email for the reset instructions.
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}