'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

/* Spinning 3D perspective cube */
function Cube3D() {
  return (
    <div
      className="absolute pointer-events-none select-none"
      style={{ top: '18%', right: '8%', width: '80px', height: '80px', perspective: '300px', opacity: 0.25 }}
    >
      <div
        style={{
          width: '100%', height: '100%',
          transformStyle: 'preserve-3d',
          animation: 'cubeRotate 12s linear infinite',
          position: 'relative',
        }}
      >
        {['rotateY(0deg) translateZ(40px)', 'rotateY(90deg) translateZ(40px)',
          'rotateY(180deg) translateZ(40px)', 'rotateY(270deg) translateZ(40px)',
          'rotateX(90deg) translateZ(40px)', 'rotateX(-90deg) translateZ(40px)'].map((t, i) => (
          <div
            key={i}
            style={{
              position: 'absolute', width: '80px', height: '80px',
              border: '1px solid rgba(59,130,246,0.6)',
              background: 'rgba(37,99,235,0.05)',
              backdropFilter: 'blur(2px)',
              transform: t,
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default function HeroSection() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center px-6 pt-36 pb-28 text-center z-10 overflow-hidden">
      <Cube3D />

      {/* Small geometric diamond */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: '65%', left: '6%', width: '36px', height: '36px',
          border: '1px solid rgba(99,102,241,0.4)',
          transform: 'rotate(45deg)',
          animation: 'spinSlow 18s linear infinite',
          opacity: 0.4,
        }}
      />
      {/* Floating line accent */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: '28%', left: '4%', width: '180px', height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(59,130,246,0.5), transparent)',
          animation: 'lineSlide 4s ease-in-out infinite',
        }}
      />

      {/* ── BADGE ── */}
      <div
        className={`inline-flex items-center gap-2 rounded-full border border-blue-500/25 bg-blue-500/[0.08] px-4 py-1.5 text-xs font-semibold text-blue-300 backdrop-blur-sm mb-8 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}
      >
        <span className="relative flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-blue-400" />
        </span>
        Speed-to-Lead Platform — Trusted by 500+ Teams
      </div>

      {/* ── HEADLINE ── */}
      <h1
        className={`max-w-5xl font-black leading-[1.03] tracking-[-0.04em] transition-all duration-700 delay-100 text-5xl sm:text-7xl lg:text-[85px] ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}
      >
        <span
          style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #e2e8f0 40%, #93c5fd 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          Turn CRM leads into
        </span>
        <br />
        <span className="relative inline-block">
          <span
            style={{
              background: 'linear-gradient(90deg, #60a5fa, #818cf8, #a78bfa)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            instant calls &amp; alerts
          </span>
          {/* Glowing underline */}
          <span
            className="absolute -bottom-3 left-0 right-0 h-px"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.7), transparent)' }}
          />
          <span
            className="absolute -bottom-3 left-[20%] right-[20%] h-[2px] rounded-full blur-sm"
            style={{ background: 'rgba(99,102,241,0.5)' }}
          />
        </span>
      </h1>

      {/* ── SUBTEXT ── */}
      <p
  className={`mt-10 max-w-xl text-[17px] text-slate-400 leading-[1.8] tracking-wide transition-all duration-700 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}
>
  LeadArrow watches your CRM platform 24/7. The moment a new lead appears, it rings your
  sales rep&apos;s phone and Chrome extension simultaneously — at the same instant.
</p>
      {/* ── CTAs ── */}
      <div
        className={`mt-10 flex flex-wrap justify-center gap-3 transition-all duration-700 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}
      >
        <Link
          href="/signup"
          className="group relative overflow-hidden rounded-2xl px-8 py-4 text-[15px] font-bold text-white transition-all duration-300 hover:scale-[1.03] active:scale-[0.96]"
          style={{ boxShadow: '0 8px 40px rgba(37,99,235,0.5), 0 0 0 1px rgba(255,255,255,0.06)' }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-white/10" />
          <div className="absolute inset-x-0 top-0 h-px bg-white/25" />
          <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 bg-gradient-to-r from-transparent via-white/12 to-transparent skew-x-12" />
          <span className="relative flex items-center gap-2">
            Start Free Trial
            <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </span>
        </Link>
        <Link
          href="#how-it-works"
          className="rounded-2xl border border-white/10 bg-white/[0.04] px-8 py-4 text-[15px] font-medium text-slate-300 backdrop-blur hover:border-white/20 hover:bg-white/[0.08] hover:text-white transition-all duration-200"
        >
          See How It Works
        </Link>
      </div>

      {/* ── 3D FLOATING ALERT CARD ── */}
      <div
        className={`mt-20 w-full max-w-sm relative transition-all duration-700 delay-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
      >
        {/* Glow under card */}
        <div
          className="absolute inset-0 rounded-3xl pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(37,99,235,0.2), transparent 70%)', filter: 'blur(30px)', transform: 'translateY(20px) scaleX(0.8)' }}
        />

        {/* 3D tilt wrapper */}
        <div
          style={{
            transform: 'rotateY(-8deg) rotateX(5deg) rotateZ(-1.5deg)',
            transformStyle: 'preserve-3d',
            animation: 'cardFloat 6s ease-in-out infinite',
          }}
        >
          <div
            className="relative rounded-2xl overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(15,23,42,0.9) 0%, rgba(15,23,42,0.7) 100%)',
              border: '1px solid rgba(255,255,255,0.1)',
              backdropFilter: 'blur(24px)',
              boxShadow: '0 30px_60px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.05), inset 0 1px 0 rgba(255,255,255,0.1)',
            }}
          >
            {/* Top shimmer line */}
            <div className="absolute inset-x-0 top-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(99,130,246,0.8), transparent)' }} />
            {/* Top blue glow */}
            <div className="absolute inset-x-0 top-0 h-20 pointer-events-none" style={{ background: 'linear-gradient(180deg, rgba(37,99,235,0.08), transparent)' }} />

            {/* macOS dots */}
            <div className="flex items-center gap-1.5 px-5 pt-4 pb-3 border-b border-white/[0.06]">
              <div className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" style={{ boxShadow: '0 0 6px rgba(255,95,87,0.7)' }} />
              <div className="h-2.5 w-2.5 rounded-full bg-[#FFBD2E]" style={{ boxShadow: '0 0 6px rgba(255,189,46,0.7)' }} />
              <div className="h-2.5 w-2.5 rounded-full bg-[#28C840]" style={{ boxShadow: '0 0 6px rgba(40,200,64,0.7)' }} />
              <span className="ml-auto text-[11px] text-slate-600 font-mono">leadarrow.io</span>
            </div>

            <div className="p-5 space-y-4">
              {/* Status */}
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">Incoming Lead</span>
                <span
                  className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold text-emerald-400"
                  style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)' }}
                >
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
                  </span>
                  Ringing
                </span>
              </div>

              {/* Lead info */}
              <div className="flex items-center gap-3">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center text-sm font-black text-blue-300 flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, rgba(37,99,235,0.3), rgba(99,102,241,0.2))', border: '1px solid rgba(255,255,255,0.1)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1)' }}
                >
                  SJ
                </div>
                <div className="flex-1">
                  <p className="text-[16px] font-black text-white leading-tight">Sarah Johnson</p>
                  <p className="text-[12px] text-slate-500 mt-0.5">Source: Facebook Ads</p>
                </div>
                <span className="text-[11px] text-slate-600 flex-shrink-0">2s ago</span>
              </div>

              {/* Progress */}
              <div className="h-1 w-full rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <div
                  className="h-full w-3/4 rounded-full"
                  style={{
                    background: 'linear-gradient(90deg, #3b82f6, #818cf8)',
                    boxShadow: '0 0 10px rgba(99,102,241,0.7)',
                    animation: 'pulseBar 2s ease-in-out infinite',
                  }}
                />
              </div>

              {/* Buttons */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  className="relative overflow-hidden rounded-xl py-3 text-[13px] font-black text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.96]"
                  style={{ boxShadow: '0 4px 20px rgba(16,185,129,0.4)' }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-green-600" />
                  <div className="absolute inset-x-0 top-0 h-px bg-white/25" />
                  <span className="relative">Accept (1)</span>
                </button>
                <button className="rounded-xl border border-white/10 bg-white/[0.05] py-3 text-[13px] font-semibold text-slate-400 hover:border-white/20 hover:bg-white/[0.09] hover:text-white transition-all duration-200">
                  Decline (2)
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-25">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.25em]">Scroll</span>
        <div className="w-px h-10 bg-gradient-to-b from-slate-500 to-transparent" />
      </div>
    </section>
  );
}
