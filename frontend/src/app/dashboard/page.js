'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import BasicDashboard from './BasicDashboard';

export default function DashboardSwapper() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#030407] flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-violet-500/20 border-t-violet-500 animate-spin" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <BasicDashboard />
    </motion.div>
  );
}
