'use client';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const ROLES = ['REP', 'SUPER_ADMIN'];

const ROLE_BADGES = {
  REP:                  { label: 'REP',   color: 'bg-blue-500/20 text-blue-300 border-blue-500/30', glow: 'shadow-blue-500/20' },
  SUPER_ADMIN:          { label: 'ADMIN', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', glow: 'shadow-emerald-500/20' },
  PREMIUM_SUBSCRIBER:   { label: 'ADMIN', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', glow: 'shadow-emerald-500/20' },
};

export default function RoleSwitcher() {
  const { user, switchRole } = useAuth();
  const [open, setOpen] = useState(false);
  const [localRole, setLocalRole] = useState('REP');
  const ref = useRef(null);
  const hydrated = useRef(false);

  useEffect(() => {
    hydrated.current = true;
    const stored = localStorage.getItem('dev_role_override');
    if (stored) setLocalRole(stored);
  }, []);

  useEffect(() => {
    if (!open) return;
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const effectiveRole = user?.role || localRole;
  const current = ROLE_BADGES[effectiveRole] || ROLE_BADGES.REP;

  function handleSwitch(role) {
    switchRole(role);
    setLocalRole(role);
    setOpen(false);
  }

  return (
    <div ref={ref} className="fixed bottom-6 right-6 z-[9999]">
      <button suppressHydrationWarning
        onClick={() => setOpen(!open)}
        className={`px-3 py-1.5 rounded-full text-xs font-bold border shadow-lg backdrop-blur-md cursor-pointer hover:scale-105 transition-all ${current.color} ${current.glow}`}
      >
        {current.label}
      </button>

      {open && (
        <div className="absolute bottom-full right-0 mb-2 w-44 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden">
          <div className="px-3 py-2 text-[10px] uppercase tracking-widest text-white/40 border-b border-white/5">
            Role Switcher
          </div>
          {ROLES.map((role) => {
            const badge = ROLE_BADGES[role];
            const active = effectiveRole === role;
            return (
              <button
                key={role}
                onClick={() => handleSwitch(role)}
                className={`w-full text-left px-3 py-2.5 text-xs flex items-center gap-2 transition-all cursor-pointer ${
                  active ? 'bg-white/10 text-white' : 'text-white/60 hover:bg-white/5 hover:text-white'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${active ? 'bg-white' : 'bg-white/20'}`} />
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${badge.color}`}>
                  {badge.label}
                </span>
                <span className="text-white/40">{role}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
