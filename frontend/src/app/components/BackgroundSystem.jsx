'use client';
import { useEffect, useRef } from 'react';

/* ── PARTICLE CANVAS ── */
function ParticleCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const DOTS = 90;
    const dots = Array.from({ length: DOTS }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      r: Math.random() * 1.8 + 0.4,
      alpha: Math.random() * 0.45 + 0.08,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw connection lines
      for (let i = 0; i < dots.length; i++) {
        for (let j = i + 1; j < dots.length; j++) {
          const dx = dots[i].x - dots[j].x;
          const dy = dots[i].y - dots[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 130) {
            ctx.beginPath();
            ctx.moveTo(dots[i].x, dots[i].y);
            ctx.lineTo(dots[j].x, dots[j].y);
            ctx.strokeStyle = `rgba(99,179,237,${0.07 * (1 - dist / 130)})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }

      // Draw dots
      dots.forEach((d) => {
        d.x += d.vx;
        d.y += d.vy;
        if (d.x < 0) d.x = canvas.width;
        if (d.x > canvas.width) d.x = 0;
        if (d.y < 0) d.y = canvas.height;
        if (d.y > canvas.height) d.y = 0;

        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(147,197,253,${d.alpha})`;
        ctx.fill();
      });

      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />;
}

/* ── AMBIENT ORBS ── */
function AmbientOrbs() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Primary blue bloom */}
      <div
        style={{
          position: 'absolute', top: '-20%', left: '-10%',
          width: '700px', height: '700px', borderRadius: '50%',
          background: 'radial-gradient(circle at 40% 40%, rgba(37,99,235,0.22), transparent 70%)',
          filter: 'blur(80px)',
          animation: 'orbFloatA 14s ease-in-out infinite',
        }}
      />
      {/* Indigo right */}
      <div
        style={{
          position: 'absolute', top: '30%', right: '-15%',
          width: '600px', height: '600px', borderRadius: '50%',
          background: 'radial-gradient(circle at 60% 40%, rgba(99,102,241,0.18), transparent 70%)',
          filter: 'blur(90px)',
          animation: 'orbFloatB 17s ease-in-out infinite',
        }}
      />
      {/* Cyan bottom */}
      <div
        style={{
          position: 'absolute', bottom: '-15%', left: '20%',
          width: '500px', height: '500px', borderRadius: '50%',
          background: 'radial-gradient(circle at 50% 50%, rgba(6,182,212,0.13), transparent 70%)',
          filter: 'blur(100px)',
          animation: 'orbFloatC 20s ease-in-out infinite',
        }}
      />
      {/* Violet accent */}
      <div
        style={{
          position: 'absolute', top: '55%', left: '5%',
          width: '350px', height: '350px', borderRadius: '50%',
          background: 'radial-gradient(circle at 50% 50%, rgba(139,92,246,0.12), transparent 70%)',
          filter: 'blur(70px)',
          animation: 'orbFloatA 22s ease-in-out infinite reverse',
        }}
      />
      {/* Neon morphing orb — hero center */}
      <div
        style={{
          position: 'absolute', top: '15%', left: '50%', transform: 'translateX(-50%)',
          width: '400px', height: '400px', borderRadius: '50%',
          background: 'radial-gradient(circle at 50% 50%, rgba(59,130,246,0.15), rgba(99,102,241,0.08), transparent 70%)',
          filter: 'blur(140px)',
          animation: 'neonPulse 8s ease-in-out infinite',
        }}
      />
    </div>
  );
}

/* ── FULL BACKGROUND SYSTEM ── */
export default function BackgroundSystem() {
  return (
    <>
      {/* Base dark */}
      <div className="fixed inset-0 bg-[#030711] -z-10" />

      {/* Deep radial base */}
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(37,99,235,0.12) 0%, transparent 70%)',
        }}
      />

      {/* Grid overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: `linear-gradient(rgba(148,163,184,0.03) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(148,163,184,0.03) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Noise grain texture */}
      <div
        className="fixed inset-0 pointer-events-none z-0 opacity-[0.018]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: '256px 256px',
        }}
      />

      {/* Spinning decorative rings */}
      <div className="fixed inset-0 pointer-events-none z-0 flex items-center justify-center overflow-hidden">
        <div
          style={{
            width: '800px', height: '800px', borderRadius: '50%',
            border: '1px solid rgba(37,99,235,0.04)',
            animation: 'spinSlow 25s linear infinite',
            flexShrink: 0,
          }}
        />
      </div>
      <div className="fixed inset-0 pointer-events-none z-0 flex items-center justify-center overflow-hidden">
        <div
          style={{
            width: '580px', height: '580px', borderRadius: '50%',
            border: '1px solid rgba(99,102,241,0.05)',
            animation: 'spinSlow 35s linear infinite reverse',
            flexShrink: 0,
          }}
        />
      </div>

      <AmbientOrbs />
      <ParticleCanvas />
    </>
  );
}
