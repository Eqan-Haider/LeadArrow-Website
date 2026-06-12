'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE } from '../lib/api';
import Link from 'next/link';

export default function UsageMonitor({ workspaceId, plan: overridePlan }) {
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState({});

  const loadUsage = useCallback(async () => {
    if (!workspaceId) { setLoading(false); return; }
    try {
      const res = await fetch(`${API_BASE}/usage/limits?workspaceId=${workspaceId}`);
      if (res.ok) {
        const data = await res.json();
        setUsage(data);
      }
    } catch (_) {} finally {
      setLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    if (workspaceId) loadUsage();
    else setLoading(false);
  }, [workspaceId, loadUsage]);

  const pct = (cur, max) => max === Infinity ? 0 : Math.min(100, Math.round((cur / max) * 100));

  if (loading || !usage) return null;

  const alerts = [];
  const leadPct = pct(usage.usage.leads.current, usage.usage.leads.max);
  const crmPct = pct(usage.usage.crmIntegrations.current, usage.usage.crmIntegrations.max);
  const repPct = pct(usage.usage.reps.current, usage.usage.reps.max);

  const showBanner = !dismissed.leads && (leadPct >= 80 || crmPct >= 80 || repPct >= 80);

  return (
    <>
      <AnimatePresence>
        {showBanner && (
          <motion.div
            initial={{ opacity: 0, y: -20, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -20, height: 0 }}
            className="mb-4 rounded-2xl border border-amber-500/20 bg-amber-500/8 backdrop-blur-sm overflow-hidden"
          >
            <div className="px-5 py-4 flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" ></path></svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-amber-200">Usage Limit Approaching</p>
                  <div className="mt-2 space-y-1.5">
                    {leadPct >= 80 && (
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-slate-400 w-24">Leads</span>
                        <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${leadPct >= 95 ? 'bg-red-500' : 'bg-amber-500'}`} style={{ width: `${leadPct}%` }} />
                        </div>
                        <span className="text-slate-500 w-16 text-right">{usage.usage.leads.current}/{usage.usage.leads.max}</span>
                      </div>
                    )}
                    {crmPct >= 80 && (
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-slate-400 w-24">CRM</span>
                        <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${crmPct >= 95 ? 'bg-red-500' : 'bg-amber-500'}`} style={{ width: `${crmPct}%` }} />
                        </div>
                        <span className="text-slate-500 w-16 text-right">{usage.usage.crmIntegrations.current}/{usage.usage.crmIntegrations.max}</span>
                      </div>
                    )}
                    {repPct >= 80 && (
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-slate-400 w-24">Reps</span>
                        <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${repPct >= 95 ? 'bg-red-500' : 'bg-amber-500'}`} style={{ width: `${repPct}%` }} />
                        </div>
                        <span className="text-slate-500 w-16 text-right">{usage.usage.reps.current}/{usage.usage.reps.max}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Link
                  href="/checkout?plan=upgrade"
                  className="text-xs font-bold bg-amber-500 hover:bg-amber-400 text-black px-3 py-1.5 rounded-lg transition"
                >
                  Upgrade
                </Link>
                <button onClick={() => setDismissed(d => ({ ...d, leads: true }))} className="text-slate-600 hover:text-slate-400 transition">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" ></path></svg>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-slate-900/40 border border-white/5 text-xs text-slate-500">
        <span className={`w-1.5 h-1.5 rounded-full ${leadPct >= 90 ? 'bg-red-400 animate-pulse' : leadPct >= 70 ? 'bg-amber-400' : 'bg-emerald-400'}`} />
        <span className="font-medium text-slate-400">{usage.plan}</span>
        <span className="text-slate-600">|</span>
        <span>{usage.usage.leads.current}/{usage.usage.leads.max} leads</span>
        <span className="text-slate-600">|</span>
        <span>{usage.usage.crmIntegrations.current}/{usage.usage.crmIntegrations.max} CRM</span>
      </div>
    </>
  );
}
