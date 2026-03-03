/*
 * Carbon & Crimson IMS
 * File: src/views/login_page.jsx
 * Version: 2.0.0 "Obsidian"
 * Refactor: God Mode - Ultra-premium UX, enhanced security, and fluid animations.
 */


import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Lock, Mail, LogIn, Eye, EyeOff, 
  ShieldAlert, X, CheckCircle2, 
  ArrowRight, Fingerprint, Activity 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createApiClient } from '../lib/api_client';
import { useAuth } from '../state/auth_context';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

export function LoginPage() {
  const { setAuth, token } = useAuth();
  const navigate = useNavigate();
  const api = useMemo(() => createApiClient({ token: null }), []);

  
  const [form, setForm] = useState({ email: 'admin@ims.local', password: 'Admin#1234' });
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState(null);
  const [capsLockOn, setCapsLockOn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [forgotModal, setForgotModal] = useState({ open: false, email: '', sent: false, loading: false });

  const emailRef = useRef(null);

  useEffect(() => {
    if (token) navigate('/', { replace: true });
    emailRef.current?.focus?.();
  }, [token, navigate]);

  const validate = () => {
    if (!form.email || !EMAIL_RE.test(form.email)) return 'Enter a valid corporate email.';
    if (!form.password || form.password.length < 6) return 'Password security threshold not met (min 6 chars).';
    return null;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    const vError = validate();
    if (vError) return setError(vError);

    setLoading(true);
    try {
      const res = await api.post('/auth/login', { ...form });
      setAuth(res.data.data, { remember });
      navigate('/', { replace: true });
    } catch (err) {
      setError(err?.response?.data?.error?.message || err?.message || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    if (!EMAIL_RE.test(forgotModal.email)) return;
    
    setForgotModal(prev => ({ ...prev, loading: true }));
    try {
      await api.post('/auth/forgot-password', { email: forgotModal.email });
      setForgotModal(prev => ({ ...prev, sent: true, loading: false }));
    } catch {
      // Intentional silent failure/success mask for security
      setForgotModal(prev => ({ ...prev, sent: true, loading: false }));
    }
  };

  return (
    <div className="selection:bg-red-500/30 min-h-screen w-full bg-[#030305] text-slate-200 relative overflow-hidden font-sans">
      
      {/* --- ELITE BACKGROUND ARCHITECTURE --- */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] h-[600px] w-[600px] rounded-full bg-red-600/10 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] h-[600px] w-[600px] rounded-full bg-rose-600/10 blur-[120px]" />
        
        {/* Grid Overlay */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)]" />
      </div>

      <main className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl items-center justify-center px-6 py-12">
        <div className="grid w-full grid-cols-1 gap-16 lg:grid-cols-2 items-center">
          
          {/* --- LEFT SIDE: BRAND EVANGELISM --- */}
<motion.div 
  variants={containerVariants}
  initial="hidden"
  animate="visible"
  className="hidden lg:flex flex-col space-y-8"
>
  <motion.div variants={itemVariants} className="flex items-center gap-3">
    {/* Container for the Logo */}
    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg shadow-red-500/20 overflow-hidden">
      <img 
        src="/img/logo.jpg" 
        alt="MotoMart Logo" 
        className="h-full w-full object-cover" 
      />
    </div>
    
    {/* Text Label */}
    <span className="text-sm font-black tracking-[0.3em] uppercase bg-clip-text text-transparent bg-gradient-to-r from-white to-white/40">
      MotoMart
    </span>
  </motion.div>

            <motion.h1 variants={itemVariants} className="text-6xl font-black tracking-tight leading-[0.95] text-white">
              Control the <br /> 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-rose-400 to-orange-400">
                Inventory Flow.
              </span>
            </motion.h1>

            <motion.p variants={itemVariants} className="text-lg text-slate-400 max-w-md leading-relaxed">
              Experience a high-fidelity management interface designed for speed, precision, and absolute data integrity.
            </motion.p>

            <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4">
              {[
                { label: 'Real-time Sync', icon: CheckCircle2 },
                { label: 'End-to-End Encryption', icon: Lock },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
                  <item.icon className="h-4 w-4 text-red-500" />
                  {item.label}
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* --- RIGHT SIDE: THE TERMINAL --- */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="relative"
          >
            {/* Decorative Glow */}
            <div className="absolute -inset-1 bg-gradient-to-r from-red-500/20 to-rose-500/20 rounded-[32px] blur-xl opacity-50" />
            
            <div className="relative w-full max-w-md mx-auto rounded-[32px] border border-white/10 bg-white/[0.02] backdrop-blur-2xl p-8 shadow-2xl">
              
              <header className="flex justify-between items-end mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-white tracking-tight">Login</h2>
                  <p className="text-slate-400 text-sm mt-1">Access the IMS Command Center</p>
                </div>
                <Fingerprint className="h-10 w-10 text-red-500/50" />
              </header>

              <AnimatePresence mode="wait">
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-6 overflow-hidden"
                  >
                    <div className="flex items-center gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
                      <ShieldAlert className="h-5 w-5 shrink-0" />
                      {error}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleLogin} className="space-y-5">
                {/* Email Input */}
                <div className="group space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 group-focus-within:text-red-400 transition-colors">
                    Work Identity
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-red-400 transition-colors" />
                    <input
                      ref={emailRef}
                      type="email"
                      required
                      value={form.email}
                      onChange={e => setForm({...form, email: e.target.value})}
                      className="w-full rounded-2xl border border-white/5 bg-white/[0.03] px-12 py-4 text-sm outline-none ring-2 ring-transparent focus:ring-red-500/20 focus:border-red-500/40 transition-all placeholder:text-slate-600"
                      placeholder="name@company.com"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div className="group space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 group-focus-within:text-red-400 transition-colors">
                      Secret Key
                    </label>
                    {capsLockOn && <span className="text-[10px] text-orange-400 animate-pulse font-bold uppercase">Caps Lock Active</span>}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-red-400 transition-colors" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={form.password}
                      onChange={e => setForm({...form, password: e.target.value})}
                      onKeyUp={e => setCapsLockOn(e.getModifierState('CapsLock'))}
                      className="w-full rounded-2xl border border-white/5 bg-white/[0.03] px-12 py-4 text-sm outline-none ring-2 ring-transparent focus:ring-red-500/20 focus:border-red-500/40 transition-all placeholder:text-slate-600"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between py-2">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className={`h-5 w-5 rounded border-2 flex items-center justify-center transition-all ${remember ? 'bg-red-500 border-red-500' : 'border-white/10 group-hover:border-white/30'}`}>
                      {remember && <CheckCircle2 className="h-3.5 w-3.5 text-black stroke-[4]" />}
                    </div>
                    <input type="checkbox" className="hidden" checked={remember} onChange={e => setRemember(e.target.checked)} />
                    <span className="text-xs font-medium text-slate-400">Keep session active</span>
                  </label>
                  <button 
                    type="button" 
                    onClick={() => setForgotModal({ ...forgotModal, open: true })}
                    className="text-xs font-bold text-red-400 hover:text-red-300 transition-colors uppercase tracking-widest"
                  >
                    Lost Access?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="relative overflow-hidden w-full group rounded-2xl bg-white px-8 py-4 text-sm font-black uppercase tracking-widest text-black transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {loading ? 'Authenticating...' : (
                      <>
                        Initiate Login <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </>
                    )}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-rose-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              </form>

              <footer className="mt-8 pt-6 border-t border-white/5 text-center">
                <p className="text-[10px] text-slate-600 uppercase tracking-widest">
                  Powered by: DotOrbit Software
                </p>
              </footer>
            </div>
          </motion.div>
        </div>
      </main>

      {/* --- FORGOT PASSWORD MODAL --- */}
      <AnimatePresence>
        {forgotModal.open && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-md" 
              onClick={() => setForgotModal(f => ({ ...f, open: false }))} 
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md rounded-[32px] border border-white/10 bg-[#0a0a0f] p-8 shadow-3xl"
            >
              <button 
                onClick={() => setForgotModal(f => ({ ...f, open: false }))}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/5 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>

              <h3 className="text-2xl font-bold text-white mb-2">Recovery Service</h3>
              <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                Provide your registered email. If validated, a temporal reset token will be dispatched.
              </p>

              {!forgotModal.sent ? (
                <form onSubmit={handleForgotSubmit} className="space-y-4">
                  <input
                    type="email"
                    required
                    value={forgotModal.email}
                    onChange={e => setForgotModal({...forgotModal, email: e.target.value})}
                    placeholder="name@company.com"
                    className="w-full rounded-2xl border border-white/5 bg-white/[0.03] px-6 py-4 text-sm outline-none focus:border-red-500/50 transition-all"
                  />
                  <button 
                    disabled={forgotModal.loading}
                    className="w-full rounded-2xl bg-red-500 py-4 text-sm font-black uppercase text-black hover:bg-red-400 transition-colors disabled:opacity-50"
                  >
                    {forgotModal.loading ? 'Processing...' : 'Request Token'}
                  </button>
                </form>
              ) : (
                <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-6 text-center">
                  <CheckCircle2 className="h-12 w-12 text-emerald-400 mx-auto mb-4" />
                  <p className="text-emerald-100 font-bold mb-1">Transmission Successful</p>
                  <p className="text-emerald-100/60 text-xs">Check your secure inbox for the 30-minute recovery link.</p>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}