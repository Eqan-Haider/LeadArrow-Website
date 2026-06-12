'use client';
import { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function NeonGridBackground({ opacity = 0.03 }) {
  const ref = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onMove = (e) => {
      const rect = el.getBoundingClientRect();
      setMousePos({ x: (e.clientX - rect.left) / rect.width, y: (e.clientY - rect.top) / rect.height });
    };
    el.addEventListener('mousemove', onMove);
    return () => el.removeEventListener('mousemove', onMove);
  }, []);

  return (
    <div ref={ref} className="fixed inset-0 pointer-events-none overflow-hidden">
      <motion.div
        className="absolute w-[60%] h-[60%] rounded-full bg-violet-600/8 blur-[180px]"
        animate={{ left: `${mousePos.x * 20}%`, top: `${mousePos.y * 20}%` }}
        transition={{ type: 'spring', stiffness: 20, damping: 15 }}
      />
      <motion.div
        className="absolute w-[50%] h-[50%] rounded-full bg-indigo-600/6 blur-[160px]"
        animate={{ right: `${(1 - mousePos.x) * 20}%`, bottom: `${(1 - mousePos.y) * 20}%` }}
        transition={{ type: 'spring', stiffness: 20, damping: 15 }}
      />
      <div className="absolute inset-0 opacity-[0.015]" style={{backgroundImage:'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize:'48px 48px'}} />
      <div className="absolute inset-0" style={{opacity, backgroundImage:'radial-gradient(circle at 1px 1px, rgba(139,92,246,0.3) 1px, transparent 0)', backgroundSize:'40px 40px'}} />
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-0.5 h-12 bg-gradient-to-t from-transparent via-violet-500/8 to-transparent"
          style={{ left: `${10 + i * 11}%`, top: `${20 + (i % 3) * 20}%` }}
          animate={{ opacity: [0, 0.5, 0], y: [0, -30, 0] }}
          transition={{ duration: 4 + i, repeat: Infinity, delay: i * 0.8, ease: 'linear' }}
        />
      ))}
    </div>
  );
}
