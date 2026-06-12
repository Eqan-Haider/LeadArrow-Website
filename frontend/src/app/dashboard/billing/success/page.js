'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { API_BASE } from '../../../lib/api';
import { AnimatedWords, AnimatedChars } from '../../../components/AnimatedText';

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id') || 'sandbox_' + Date.now();
  const wsId = searchParams.get('workspaceId') || localStorage.getItem('companyId') || '';
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const [verified, setVerified] = useState(false);
  const [licenseKey, setLicenseKey] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/purchase/success?session_id=${sessionId}&workspaceId=${wsId}`);
        const data = await res.json();
        setVerified(data.verified);
        setLicenseKey(data.key || '');
      } catch {
        setVerified(true);
      }
    })();
  }, [sessionId, wsId]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w = canvas.width = window.innerWidth;
    let h = canvas.height = window.innerHeight;
    const particles = [];
    const colors = ['#7c3aed', '#4f46e5', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

    for (let i = 0; i < 300; i++) {
      particles.push({
        x: Math.random() * w, y: Math.random() * h - h,
        vx: (Math.random() - 0.5) * 8, vy: Math.random() * 5 + 2,
        size: Math.random() * 8 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360, rotSpeed: (Math.random() - 0.5) * 12,
        shape: Math.random() > 0.5 ? 'rect' : 'circle',
        gravity: 0.03 + Math.random() * 0.02,
      });
    }

    let frame;
    function draw() {
      ctx.clearRect(0, 0, w, h);
      let alive = false;
      for (const p of particles) {
        p.x += p.vx; p.y += p.vy; p.vy += p.gravity;
        p.rotation += p.rotSpeed;
        if (p.y > h + 30) continue;
        alive = true;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = Math.max(0, 1 - (p.y / h));
        ctx.fillStyle = p.color;
        if (p.shape === 'rect') ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        else { ctx.beginPath(); ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2); ctx.fill(); }
        ctx.restore();
      }
      if (alive) frame = requestAnimationFrame(draw);
    }
    draw();
    animRef.current = frame;

    const onResize = () => { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; };
    window.addEventListener('resize', onResize);
    setTimeout(() => { if (animRef.current) cancelAnimationFrame(animRef.current); }, 10000);

    return () => {
      window.removeEventListener('resize', onResize);
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => router.push('/dashboard'), 12000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden flex items-center justify-center">
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-10" />
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-violet-600/5 via-transparent to-indigo-600/5" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-violet-600/4 rounded-full blur-[150px]" />
        <div className="absolute inset-0 opacity-[0.012]" style={{backgroundImage:'linear-gradient(rgba(255,255,255,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.12) 1px, transparent 1px)', backgroundSize:'32px 32px'}} />
        <div className="absolute inset-0 opacity-[0.03]" style={{backgroundImage:'radial-gradient(circle at 1px 1px, rgba(139,92,246,0.25) 1px, transparent 0)', backgroundSize:'40px 40px'}} />
      </div>
      <div className="fixed top-4 right-4 z-30 flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/70 backdrop-blur border border-emerald-500/20 shadow-lg">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>
        <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">System Online</span>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-20 text-center px-6 max-w-lg"
      >
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 150, damping: 12, delay: 0.2 }}
          className="w-32 h-32 mx-auto rounded-full bg-emerald-500/15 border-2 border-emerald-500/40 flex items-center justify-center mb-8 shadow-[0_0_80px_rgba(16,185,129,0.2)]"
        >
          <motion.svg className="w-16 h-16 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" ></path>
          </motion.svg>
        </motion.div>

        <AnimatedWords text="Welcome to Premium!" className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-4" />

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="text-base text-slate-400 mb-6"
        >
          Your workspace has been upgraded. All premium features are now unlocked.
        </motion.p>

        {licenseKey && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.8, duration: 0.5 }}
            className="rounded-xl bg-violet-500/10 border border-violet-500/20 p-4 mb-6 text-left"
          >
            <p className="text-[10px] font-bold uppercase tracking-widest text-violet-400 mb-1.5">Activation Token</p>
            <code className="text-sm font-mono font-bold text-violet-300 break-all select-all">{licenseKey}</code>
          </motion.div>
        )}

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.2, duration: 0.6 }}
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={() => router.push('/dashboard')}
          className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold text-sm py-4 px-8 rounded-xl shadow-lg shadow-violet-600/20 hover:from-violet-500 hover:to-indigo-500 transition-all duration-200"
        >
          Enter Dashboard
        </motion.button>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3, duration: 1 }}
          className="text-xs text-slate-600 mt-4"
        >
          Redirecting automatically in a few seconds...
        </motion.p>
      </motion.div>
    </div>
  );
}

import { Suspense } from 'react';

export default function BillingSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Loading...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
