'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import Link from 'next/link';
import NeonGridBackground from '../../components/NeonGridBackground';
import { DashboardSkeleton } from '../../components/SkeletonCard';
import { PageTransition, FadeUpItem } from '../../components/PageTransition';
import UsageMonitor from '../../components/UsageMonitor';
import { AnimatedWords } from '../../components/AnimatedText';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL + '/api' : 'http://localhost:5001/api';

const INITIAL_SPEED = { firstAlertDelay: '—', timeToFirstAnswer: '—', timeToAcceptance: '—', avgResponseTime: '—', under1Min: 0, oneTo5Min: 0, over5Min: 0 };
const INITIAL_VOLUME = { total: 0, accepted: 0, missed: 0, declined: 0, timedOut: 0, skipped: 0, connectionRate: 0 };
const INITIAL_ROUTING = { deadEndRate: 0, routingLagEvents: 0, crmSyncErrors: 0 };

function AccessDenied() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-8 relative overflow-hidden">
      <NeonGridBackground />
      <div className="max-w-md w-full bg-slate-900/60 backdrop-blur-xl border border-red-500/30 rounded-2xl p-8 text-center relative z-10">
        <div className="w-20 h-20 mx-auto rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mb-6">
          <svg className="w-10 h-10 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H10m9-4a9 9 0 11-18 0 9 9 0 0118 0z" ></path></svg>
        </div>
        <h2 className="text-2xl font-bold text-white mb-3">Access Denied</h2>
        <p className="text-slate-400 mb-6">Only Admins and Managers can access analytics.</p>
        <Link href="/dashboard" className="inline-block rounded-xl bg-slate-800/80 border border-white/10 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-700 transition">← Back</Link>
      </div>
    </div>
  );
}

function MetricCard({ label, value, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: 'easeOut' }}
      className="bg-slate-900/40 backdrop-blur-sm border border-white/10 rounded-xl p-5 hover:border-white/20 hover:bg-slate-900/60 transition-all duration-300"
    >
      <p className="text-sm font-medium text-slate-400">{label}</p>
      <motion.p
        className="text-3xl font-bold text-white mt-1"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: delay + 0.2, duration: 0.3, type: 'spring', stiffness: 100 }}
      >
        {value ?? '—'}
      </motion.p>
    </motion.div>
  );
}

function OutcomeBar({ label, value, total, color, delay = 0 }) {
  const pct = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.35 }}
    >
      <div className="flex justify-between text-xs text-slate-400 mb-1"><span>{label}</span><span>{value} ({pct}%)</span></div>
      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
        <motion.div
          className={`h-full ${color} rounded-full`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ delay: delay + 0.15, duration: 0.7, ease: 'easeOut' }}
        />
      </div>
    </motion.div>
  );
}

export default function AnalyticsPage() {
  const { user, loading } = useAuth();

  const [speed, setSpeed] = useState(INITIAL_SPEED);
  const [volume, setVolume] = useState(INITIAL_VOLUME);
  const [reps, setReps] = useState([]);
  const [routing, setRouting] = useState(INITIAL_ROUTING);
  const [dataLoading, setDataLoading] = useState(true);

  const companyId = user?.companyId || (typeof window !== 'undefined' ? localStorage.getItem('companyId') : null);

  const loadAnalytics = useCallback(async () => {
    if (!companyId) { setDataLoading(false); return; }
    try {
      const [overviewRes, speedRes] = await Promise.all([
        fetch(`${API_BASE}/analytics/overview?companyId=${companyId}`),
        fetch(`${API_BASE}/analytics/speed?companyId=${companyId}`),
      ]);
      if (overviewRes.ok) {
        const d = await overviewRes.json();
        setVolume({
          total: d.totalLeads ?? 0,
          accepted: d.accepted ?? 0,
          missed: d.missed ?? 0,
          declined: d.declined ?? 0,
          timedOut: d.timedOut ?? 0,
          skipped: d.skipped ?? 0,
          connectionRate: d.totalLeads > 0 ? Math.round((d.accepted / d.totalLeads) * 100) : 0,
        });
      }
      if (speedRes.ok) {
        const s = await speedRes.json();
        setSpeed({
          firstAlertDelay: s.firstAlertDelay || '—',
          timeToFirstAnswer: s.timeToFirstAnswer || '—',
          timeToAcceptance: s.timeToAcceptance || '—',
          avgResponseTime: s.avgResponseTime || '—',
          under1Min: s.under1Min ?? 0,
          oneTo5Min: s.oneTo5Min ?? 0,
          over5Min: s.over5Min ?? 0,
        });
      }
      const repsRes = await fetch(`${API_BASE}/analytics/reps?companyId=${companyId}`);
      if (repsRes.ok) {
        const r = await repsRes.json();
        setReps(Array.isArray(r) ? r : []);
      }
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setDataLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    if (!loading && user) loadAnalytics();
    else if (!loading) setDataLoading(false);
  }, [loading, user, loadAnalytics]);

  if (loading || dataLoading) return <DashboardSkeleton />;
  if (!user) { if (typeof window !== 'undefined') window.location.href = '/login'; return null; }
  if (!['SUPER_ADMIN', 'ADMIN', 'MANAGER'].includes(user.role)) return <AccessDenied />;

  return (
    <PageTransition className="min-h-screen bg-slate-950 relative overflow-hidden">
      <NeonGridBackground />

      <div className="fixed top-4 right-4 z-30 flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/70 backdrop-blur border border-emerald-500/20 shadow-lg">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>
        <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">System Online</span>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <AnimatedWords text="Advanced Analytics" className="text-3xl font-black text-white tracking-tight" />
            <p className="text-slate-400 mt-1">Real-time performance metrics for your sales team</p>
          </div>
          <div className="flex items-center gap-3">
            {companyId && <UsageMonitor workspaceId={companyId} />}
            <Link href="/dashboard" className="rounded-xl bg-slate-800/80 border border-white/10 px-4 py-2.5 text-sm font-medium text-slate-300 hover:text-white transition-all">← Back</Link>
          </div>
        </div>

        <FadeUpItem>
          <section className="mb-10">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" ></path></svg>
              Speed Metrics
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <MetricCard label="First Alert Delay" value={speed.firstAlertDelay} delay={0.1} />
              <MetricCard label="Time to First Answer" value={speed.timeToFirstAnswer} delay={0.18} />
              <MetricCard label="Time to Acceptance" value={speed.timeToAcceptance} delay={0.26} />
              <MetricCard label="Avg Response Time" value={speed.avgResponseTime || '—'} delay={0.34} />
            </div>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.4 }}
              className="bg-slate-900/40 backdrop-blur-sm border border-white/10 rounded-xl p-5 hover:border-white/20 transition-all"
            >
              <h3 className="text-sm font-semibold text-slate-300 mb-3">Response Windows</h3>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Under 1 Minute', value: speed.under1Min, color: 'text-green-400', bar: 'bg-green-500' },
                  { label: '1 - 5 Minutes', value: speed.oneTo5Min, color: 'text-yellow-400', bar: 'bg-yellow-500' },
                  { label: 'Over 5 Minutes', value: speed.over5Min, color: 'text-red-400', bar: 'bg-red-500' },
                ].map((w) => (
                  <div key={w.label} className="text-center">
                    <p className={`text-2xl font-bold ${w.color}`}>{w.value}%</p>
                    <p className="text-xs text-slate-400">{w.label}</p>
                    <div className="mt-2 h-2 bg-slate-800 rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full ${w.bar} rounded-full`}
                        initial={{ width: 0 }}
                        animate={{ width: `${w.value}%` }}
                        transition={{ delay: 0.6, duration: 0.8, ease: 'easeOut' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </section>
        </FadeUpItem>

        <FadeUpItem>
          <section className="mb-10">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" ></path></svg>
              Volume Metrics
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <MetricCard label="Total Leads" value={volume.total.toLocaleString()} delay={0.5} />
              <MetricCard label="Accepted" value={volume.accepted.toLocaleString()} delay={0.58} />
              <MetricCard label="Connection Rate" value={`${volume.connectionRate}%`} delay={0.66} />
              <MetricCard label="Skipped" value={volume.skipped.toLocaleString()} delay={0.74} />
            </div>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.4 }}
              className="bg-slate-900/40 backdrop-blur-sm border border-white/10 rounded-xl p-5 hover:border-white/20 transition-all"
            >
              <h3 className="text-sm font-semibold text-slate-300 mb-4">Lead Outcomes</h3>
              <div className="space-y-3">
                <OutcomeBar label="Accepted" value={volume.accepted} total={volume.total} color="bg-green-500" delay={0.9} />
                <OutcomeBar label="Missed" value={volume.missed} total={volume.total} color="bg-red-500" delay={1.0} />
                <OutcomeBar label="Declined" value={volume.declined} total={volume.total} color="bg-yellow-500" delay={1.1} />
                <OutcomeBar label="Timed Out" value={volume.timedOut} total={volume.total} color="bg-orange-500" delay={1.2} />
                <OutcomeBar label="Skipped" value={volume.skipped} total={volume.total} color="bg-gray-500" delay={1.3} />
              </div>
            </motion.div>
          </section>
        </FadeUpItem>

        <FadeUpItem>
          <section className="mb-10">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" ></path></svg>
              Rep Performance
            </h2>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4, duration: 0.4 }}
              className="bg-slate-900/40 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden hover:border-white/20 transition-all"
            >
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-800/50">
                  <tr>
                    <th className="px-6 py-3 font-semibold text-slate-300">Rep</th>
                    <th className="px-6 py-3 font-semibold text-slate-300">Connection Rate</th>
                    <th className="px-6 py-3 font-semibold text-slate-300">Accepted</th>
                    <th className="px-6 py-3 font-semibold text-slate-300">Declined</th>
                    <th className="px-6 py-3 font-semibold text-slate-300">Total</th>
                    <th className="px-6 py-3 font-semibold text-slate-300">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {reps.length === 0 ? (
                    <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-500">No rep data available yet.</td></tr>
                  ) : (
                    reps.map((rep, idx) => (
                      <motion.tr
                        key={rep.id || rep.userId}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1.5 + idx * 0.08, duration: 0.3 }}
                        className="border-t border-white/5 hover:bg-slate-800/30 transition-colors"
                      >
                        <td className="px-6 py-3 font-medium text-white">{rep.fullName || rep.name || 'Unknown'}</td>
                        <td className="px-6 py-3"><span className="text-emerald-400 font-medium">{rep.connectionRate ?? rep.pickupRate ?? 0}%</span></td>
                        <td className="px-6 py-3 text-slate-300">{rep.accepted ?? 0}</td>
                        <td className="px-6 py-3 text-slate-400">{rep.declined ?? 0}</td>
                        <td className="px-6 py-3 text-slate-400">{rep.total ?? 0}</td>
                        <td className="px-6 py-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${rep.isAvailable ? 'bg-emerald-500/10 text-emerald-300' : 'bg-amber-500/10 text-amber-300'}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${rep.isAvailable ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                            {rep.isAvailable ? 'Available' : 'Away'}
                          </span>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </motion.div>
          </section>
        </FadeUpItem>

        <FadeUpItem>
          <section className="mb-10">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" ></path></svg>
              Routing & System Health
            </h2>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.6, duration: 0.4 }}
              className="grid grid-cols-2 md:grid-cols-3 gap-4"
            >
              <MetricCard label="Dead-End Lead Rate" value={`${routing.deadEndRate}%`} delay={1.7} />
              <MetricCard label="Routing Lag Events" value={routing.routingLagEvents.toString()} delay={1.8} />
              <MetricCard label="CRM Sync Errors" value={routing.crmSyncErrors.toString()} delay={1.9} />
            </motion.div>
          </section>
        </FadeUpItem>
      </div>
    </PageTransition>
  );
}
