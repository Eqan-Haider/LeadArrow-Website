'use client';
import { useEffect, useRef, useState, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE } from '../lib/api';
import { useAuth } from '../context/AuthContext';

function generateLicenseKey() {
  const segments = [];
  for (let i = 0; i < 4; i++) {
    let seg = '';
    for (let j = 0; j < 4; j++) {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      seg += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    segments.push(seg);
  }
  return 'LA-PREM-' + segments.join('-');
}

function WelcomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { activatePremium, isPremium } = useAuth();
  const origin = searchParams.get('origin') || 'landing';
  const licenseKeyParam = searchParams.get('key') || '';
  const sessionId = searchParams.get('session_id') || '';
  const wsId = searchParams.get('workspaceId') || (typeof window !== 'undefined' ? localStorage.getItem('companyId') : '') || '';
  const emailParam = searchParams.get('email') || (typeof window !== 'undefined' ? localStorage.getItem('premiumEmail') : '') || '';

  const canvasRef = useRef(null);
  const [licenseKey, setLicenseKey] = useState(licenseKeyParam || generateLicenseKey());
  const [activationState, setActivationState] = useState(sessionId ? 'verifying' : 'idle');
  const [countdown, setCountdown] = useState(12);

  const isLanding = origin === 'landing';

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w = canvas.width = window.innerWidth;
    let h = canvas.height = window.innerHeight;
    const particles = [];
    const colors = ['#7c3aed', '#4f46e5', '#06b6d4', '#10b981'];

    for (let i = 0; i < 200; i++) {
      particles.push({
        x: Math.random() * w, y: Math.random() * h - h,
        vx: (Math.random() - 0.5) * 6, vy: Math.random() * 3 + 1,
        size: Math.random() * 5 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360, rotSpeed: (Math.random() - 0.5) * 8,
        shape: Math.random() > 0.5 ? 'rect' : 'circle',
        gravity: 0.02 + Math.random() * 0.015,
      });
    }

    let frame;
    function draw() {
      const ctx2 = canvas.getContext('2d');
      if (!ctx2) return;
      ctx2.clearRect(0, 0, w, h);
      let alive = false;
      for (const p of particles) {
        p.x += p.vx; p.y += p.vy; p.vy += p.gravity;
        p.rotation += p.rotSpeed;
        if (p.y > h + 30) continue;
        alive = true;
        ctx2.save();
        ctx2.translate(p.x, p.y);
        ctx2.rotate((p.rotation * Math.PI) / 180);
        ctx2.globalAlpha = Math.max(0, 1 - (p.y / h));
        ctx2.fillStyle = p.color;
        if (p.shape === 'rect') ctx2.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        else { ctx2.beginPath(); ctx2.arc(0, 0, p.size / 2, 0, Math.PI * 2); ctx2.fill(); }
        ctx2.restore();
      }
      if (alive) frame = requestAnimationFrame(draw);
    }
    draw();

    const onResize = () => { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; };
    window.addEventListener('resize', onResize);
    setTimeout(() => { if (frame) cancelAnimationFrame(frame); }, 12000);

    return () => {
      window.removeEventListener('resize', onResize);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    if (activationState === 'activated') {
      if (countdown > 0) {
        const t = setTimeout(() => setCountdown(c => c - 1), 1000);
        return () => clearTimeout(t);
      } else {
        router.push('/dashboard/premium-core');
      }
    }
  }, [activationState, countdown, router]);

  useEffect(() => {
    if (sessionId && activationState === 'verifying') {
      (async () => {
        try {
          const res = await fetch(`${API_BASE}/purchase/success?session_id=${sessionId}&workspaceId=${wsId}`);
          const data = await res.json();
          if (data.verified && data.key) {
            setLicenseKey(data.key);
            await activatePremium({ licenseKey: data.key, email: data.email || emailParam, tier: data.plan || 'GROWTH' });
            setActivationState('activated');
          } else {
            setActivationState('idle');
          }
        } catch {
          setActivationState('idle');
        }
      })();
    }
  }, [sessionId, wsId, activationState, activatePremium, emailParam]);

  const handleActivatePremium = useCallback(async () => {
    setActivationState('activating');
    const email = emailParam || localStorage.getItem('premiumEmail') || 'user@leadarrow.com';
    await activatePremium({ licenseKey, email, tier: 'GROWTH' });
    const companyId = localStorage.getItem('companyId') || '';
    if (companyId && licenseKey) {
      try {
        await fetch(`${API_BASE}/purchase/redeem/${licenseKey}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });
      } catch {}
    }
    await new Promise(r => setTimeout(r, 1000));
    setActivationState('activated');
  }, [activatePremium, licenseKey, emailParam]);

  const handleGoToPremiumDashboard = useCallback(() => {
    router.push('/dashboard/premium-core');
  }, [router]);

  const handleGoToBasicDashboard = useCallback(() => {
    router.push('/dashboard');
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden flex items-center justify-center">
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-10" />
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-violet-600/6 via-transparent to-indigo-600/6" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-violet-600/5 rounded-full blur-[180px]" />
      </div>

      <div className="fixed top-4 right-4 z-30 flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/70 backdrop-blur border border-emerald-500/20 shadow-lg">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>
        <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">Premium Activation</span>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-20 text-center px-6 max-w-xl"
      >
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 150, damping: 12, delay: 0.2 }}
          className="w-36 h-36 mx-auto rounded-full bg-emerald-500/15 border-2 border-emerald-500/40 flex items-center justify-center mb-8 shadow-[0_0_80px_rgba(16,185,129,0.2)]"
        >
          <motion.svg className="w-16 h-16 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" ></path>
          </motion.svg>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-4"
        >
          {activationState === 'activated' ? 'Welcome to Premium!' : isLanding ? 'Payment Confirmed!' : 'Activate Your Premium License'}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="text-base text-slate-400 mb-8"
        >
          {activationState === 'verifying'
            ? 'Verifying your payment with Stripe...'
            : activationState === 'activated'
              ? 'Your workspace has been upgraded to PREMIUM_SUBSCRIBER. All premium features are unlocked.'
              : isLanding
                ? 'Your payment was successful. Click below to enter the Premium Enterprise Command Desk.'
                : 'Use the generated license key below to activate and unlock the Premium Command Desk.'}
        </motion.p>

        <AnimatePresence mode="wait">
          {activationState === 'verifying' ? (
            <motion.div key="verifying" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-4 py-6">
              <div className="w-16 h-16 rounded-full border-4 border-violet-500/20 border-t-violet-500 animate-spin" />
              <p className="text-sm text-violet-300 font-medium">Verifying payment with Stripe...</p>
            </motion.div>
          ) : activationState === 'activating' ? (
            <motion.div key="activating" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-4 py-6">
              <div className="w-16 h-16 rounded-full border-4 border-violet-500/20 border-t-violet-500 animate-spin" />
              <p className="text-sm text-violet-300 font-medium">Activating premium workspace & upgrading role...</p>
            </motion.div>
          ) : activationState === 'activated' ? (
            <motion.div key="activated" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4"
              >
                <p className="text-sm font-semibold text-emerald-300">Premium Active · Role upgraded to PREMIUM_SUBSCRIBER</p>
                <p className="text-xs text-emerald-400/60 mt-1">All premium features are now unlocked. Redirecting to Premium Command Desk...</p>
              </motion.div>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={handleGoToPremiumDashboard}
                className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold text-sm py-4 px-8 rounded-xl shadow-lg shadow-violet-600/20 hover:from-violet-500 hover:to-indigo-500 transition-all duration-200"
              >Enter Premium Dashboard</motion.button>
            </motion.div>
          ) : (
            <motion.div key="idle" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.8 }} className="space-y-6">
              {isLanding && (
                <div className="space-y-4">
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }}
                    className="text-base text-slate-300"
                  >Your PREMIUM_SUBSCRIBER upgrade is ready. Click below to enter the Enterprise Command Desk.</motion.p>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={handleGoToPremiumDashboard}
                    className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold text-sm py-4 px-8 rounded-xl shadow-lg shadow-violet-600/20 hover:from-violet-500 hover:to-indigo-500 transition-all duration-200"
                  >Enter Premium Dashboard</motion.button>
                </div>
              )}
              {!isLanding && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 2, duration: 0.5 }}
                  className="rounded-2xl bg-gradient-to-br from-violet-500/10 via-transparent to-indigo-500/5 border border-violet-500/25 p-6 text-left relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 to-transparent pointer-events-none" />
                  <p className="text-[10px] font-bold uppercase tracking-widest text-violet-400 mb-2 flex items-center gap-2">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" ></path></svg>
                    Premium License Activation Token
                  </p>
                  <code className="text-sm sm:text-base font-mono font-bold text-violet-300 break-all select-all bg-violet-950/30 border border-violet-500/10 rounded-lg px-3 py-2 inline-block w-full text-center tracking-wider">
                    {licenseKey}
                  </code>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={handleActivatePremium}
                    className="mt-4 w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-sm py-3 px-6 rounded-xl hover:from-emerald-500 hover:to-teal-500 transition-all duration-200 shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" ></path></svg>
                    Autofill & Securely Activate
                  </motion.button>
                  <p className="text-[10px] text-slate-600 mt-3 text-center">This will upgrade your role to PREMIUM_SUBSCRIBER and unlock the Enterprise Command Desk</p>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {activationState === 'activated' && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            className="text-xs text-slate-600 mt-6"
          >Redirecting to Premium Command Desk in {countdown}s...</motion.p>
        )}

        {activationState === 'idle' && !isLanding && (
          <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 3 }}
            onClick={handleGoToBasicDashboard}
            className="text-xs text-slate-500 hover:text-slate-300 mt-6 underline underline-offset-2"
          >Skip, go to basic dashboard</motion.button>
        )}
      </motion.div>
    </div>
  );
}

export default function WelcomePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Loading...</div>}>
      <WelcomeContent />
    </Suspense>
  );
}