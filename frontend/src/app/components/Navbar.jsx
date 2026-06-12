'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, loading, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  // While auth is still checking, you can optionally show nothing to avoid a flash
  // (remove this if you prefer to see the logged‑out state briefly)
  if (loading) return null;

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="mx-auto max-w-7xl px-4 lg:px-8 py-4">
        <div
          className="flex items-center justify-between rounded-2xl border border-white/[0.08] bg-slate-950/80 backdrop-blur-2xl px-5 py-3"
          style={{ boxShadow: '0 1px 0 rgba(255,255,255,0.05), 0 12px 40px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.04)' }}
        >
          {/* ── LOGO ── */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative flex-shrink-0">
              <div
                className="absolute -inset-3 rounded-2xl opacity-70 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background: 'radial-gradient(circle at 50% 50%, rgba(37,99,235,0.35), transparent 70%)', filter: 'blur(12px)' }}
              />
              <div className="absolute -inset-1 rounded-xl border border-blue-500/20 animate-pulse" />
              <div
                className="relative rounded-xl border border-white/10 p-1.5 z-10"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)',
                  backdropFilter: 'blur(20px)',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.12), 0 4px 20px rgba(59,130,246,0.3)',
                }}
              >
                <img src="/leadarrow-logo.png" alt="LeadArrow" className="h-8 w-auto object-contain" />
              </div>
              <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5 z-20">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-60" />
                <span
                  className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"
                  style={{ boxShadow: '0 0 15px rgba(59,130,246,0.8)' }}
                />
              </span>
            </div>
            <span className="text-[15px] font-black tracking-tight text-white">LeadArrow</span>
          </Link>

          {/* ── NAV LINKS ── */}
          <nav className="hidden md:flex items-center gap-0.5">
            {[
              ['How It Works', '#how-it-works'],
              ['Features', '#features'],
              ['Integrations', '#integrations'],
              ['Pricing', '#pricing'],
              ['FAQ', '#faq'],
              ['About', '/about'],
            ].map(([label, href]) => (
              <Link
                key={label}
                href={href}
                className="px-3.5 py-2 rounded-lg text-[13px] font-medium text-slate-400 hover:text-white hover:bg-white/[0.07] transition-all duration-150"
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* ── CTA (DYNAMIC) ── */}
          <div className="flex items-center gap-2.5">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="px-3.5 py-2 text-[13px] font-medium text-slate-400 hover:text-white transition-colors duration-200"
                >
                  Dashboard
                </Link>
                <button
                  onClick={logout}
                  className="px-3.5 py-2 text-[13px] font-medium text-slate-400 hover:text-white transition-colors duration-200"
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-3.5 py-2 text-[13px] font-medium text-slate-400 hover:text-white transition-colors duration-200"
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  className="relative group overflow-hidden rounded-xl px-5 py-2.5 text-[13px] font-bold text-white transition-all duration-300 hover:scale-[1.03] active:scale-[0.97]"
                  style={{ boxShadow: '0 4px 20px rgba(37,99,235,0.5)' }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-white/10" />
                  <div className="absolute inset-x-0 top-0 h-px bg-white/25" />
                  <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12" />
                  <span className="relative">Start Free Trial</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}