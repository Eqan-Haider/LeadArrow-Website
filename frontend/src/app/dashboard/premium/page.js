'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { io } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import PremiumRouteGuard from '../../components/PremiumRouteGuard';
import confetti from 'canvas-confetti';
import {
  Zap, Users, PhoneCall, BarChart3, Download, Plus, UserPlus,
  MessageSquare, LogOut, CreditCard, ArrowLeft, X, Check,
  AlertTriangle, Clock, Activity, Phone, TrendingUp, RefreshCw,
  Globe, Shield, Star, Bell, Settings, ChevronRight, Lock,
  Calendar, DollarSign, HelpCircle, Sparkles, Gem, Target,
  LineChart, PieChart, Radio, Sliders, Webhook, Database,
} from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL
  ? process.env.NEXT_PUBLIC_API_URL + '/api'
  : 'http://localhost:5001/api';

const ROLE_LABEL = {
  SUPER_ADMIN: 'Admin', ADMIN: 'Admin', OWNER: 'Owner',
  MANAGER: 'Manager', REP: 'Sales Rep', USER: 'User',
};

function cn(...classes) { return classes.filter(Boolean).join(' '); }

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 80, damping: 16 } },
};

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.08 } },
};

function GlassCard({ children, className, hover = false }) {
  return (
    <div className={cn(
      'bg-[#0A0B0E]/50 backdrop-blur-xl border border-white/[0.04] rounded-xl shadow-[0_12px_40px_rgba(0,0,0,0.6)]',
      hover && 'hover:border-violet-500/20 transition-colors duration-300',
      className
    )}>
      {children}
    </div>
  );
}

function AnimatedStat({ value, className }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (typeof value !== 'number') return;
    const duration = 500;
    const start = performance.now();
    const raf = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(eased * value));
      if (p < 1) requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
  }, [value]);
  return <span className={className}>{typeof value === 'number' ? display : value}</span>;
}

function fireConfetti() {
  confetti({ particleCount: 120, spread: 90, origin: { y: 0.6 }, colors: ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#F1C40F'], ticks: 120 });
  setTimeout(() => confetti({ particleCount: 60, spread: 50, origin: { y: 0.6, x: 0.2 }, colors: ['#f59e0b', '#ef4444', '#1A5CFF'], ticks: 80 }), 150);
}

function BackgroundOrbs() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      <motion.div animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
        className="absolute top-[-15%] left-[-8%] w-[55%] h-[55%] rounded-full bg-violet-600/5 blur-[150px]" />
      <motion.div animate={{ scale: [1, 1.12, 1] }} transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
        className="absolute bottom-[-15%] right-[-8%] w-[45%] h-[45%] rounded-full bg-blue-600/5 blur-[150px]" />
      <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
        className="absolute top-[40%] left-[40%] w-[30%] h-[30%] rounded-full bg-emerald-600/3 blur-[120px]" />
    </div>
  );
}

function PremiumDashboardContent() {
  const { user, logout } = useAuth();
  const socketRef = useRef(null);
  const ringTimerRef = useRef(null);

  const [activeTab, setActiveTab] = useState('dashboard');
  const [leads, setLeads] = useState([]);
  const [reps, setReps] = useState([]);
  const [callLog, setCallLog] = useState([]);
  const [routingMethod, setRoutingMethod] = useState('ROUND_ROBIN');
  const [ringTimeout, setRingTimeout] = useState(20);
  const [activeCall, setActiveCall] = useState(null);
  const [callStatus, setCallStatus] = useState('');
  const [isCrmDrawerOpen, setIsCrmDrawerOpen] = useState(false);
  const [isSlackModalOpen, setIsSlackModalOpen] = useState(false);
  const [isAddRepModalOpen, setIsAddRepModalOpen] = useState(false);
  const [pageLoaded, setPageLoaded] = useState(false);
  const [selectedView, setSelectedView] = useState('all');
  const [streamLeads, setStreamLeads] = useState([]);
  const [streamLoading, setStreamLoading] = useState(false);
  const [leadFilter, setLeadFilter] = useState('all');

  const mockLeads = [
    { id: 1, prospectName: 'John Doe', leadSource: 'Close CRM', status: 'NEW', email: 'john@test.com', phone: '+1 (555) 123-4567', time: '2m ago', company: 'Acme Corp' },
    { id: 2, prospectName: 'Sarah Smith', leadSource: 'LinkedIn', status: 'CLAIMED', email: 'sarah@test.com', phone: '+1 (555) 234-5678', time: '5m ago', company: 'Beta Inc' },
    { id: 3, prospectName: 'Mike Johnson', leadSource: 'Slack Webhook', status: 'MISSED', email: 'mike@test.com', phone: '+1 (555) 345-6789', time: '12m ago', company: 'Gamma LLC' },
    { id: 4, prospectName: 'Emily Davis', leadSource: 'Close CRM', status: 'NEW', email: 'emily@test.com', phone: '+1 (555) 456-7890', time: '18m ago', company: 'Delta Co' },
    { id: 5, prospectName: 'Chris Wilson', leadSource: 'Website', status: 'CLAIMED', email: 'chris@test.com', phone: '+1 (555) 567-8901', time: '25m ago', company: 'Echo Group' },
    { id: 6, prospectName: 'Lisa Brown', leadSource: 'LinkedIn', status: 'NEW', email: 'lisa@test.com', phone: '+1 (555) 678-9012', time: '32m ago', company: 'Foxtrot Solutions' },
    { id: 7, prospectName: 'Tom Garcia', leadSource: 'Slack Webhook', status: 'MISSED', email: 'tom@test.com', phone: '+1 (555) 789-0123', time: '40m ago', company: 'Global Tech' },
    { id: 8, prospectName: 'Anna Martinez', leadSource: 'Close CRM', status: 'CLAIMED', email: 'anna@test.com', phone: '+1 (555) 890-1234', time: '55m ago', company: 'Hyperion Systems' },
  ];

  const companyId = user?.companyId || (typeof window !== 'undefined' ? localStorage.getItem('companyId') : null);
  const userId = user?.id || (typeof window !== 'undefined' ? localStorage.getItem('userId') : null);
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const roleLabel = ROLE_LABEL[user?.role] || 'Premium';

  const totalLeadsToday = leads.length;
  const totalAccepted = leads.filter(l => l.status === 'CLAIMED').length;
  const totalMissed = leads.filter(l => l.status === 'MISSED').length;
  const conversionRate = totalLeadsToday > 0 ? Math.round((totalAccepted / totalLeadsToday) * 100) : 0;

  useEffect(() => { setPageLoaded(true); }, []);

  useEffect(() => {
    if (!companyId || !token) return;
    fetch(`${API_BASE}/users/team/${companyId}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(data => { if (data.users) setReps(data.users); }).catch(() => {});
  }, [companyId, token]);

  useEffect(() => {
    if (!userId) return;
    const socket = io(API_BASE.replace('/api', ''), { transports: ['websocket', 'polling'] });
    socketRef.current = socket;
    socket.on('connect', () => socket.emit('REGISTER', { userId, companyId, role: user?.role || 'REP' }));
    socket.on('LEAD_ALERT', data => setLeads(prev => [{ ...data, id: data.leadId || 'lead-' + Date.now(), time: new Date().toLocaleTimeString() }, ...prev].slice(0, 100)));
    socket.on('LEAD_UPDATE', data => setLeads(prev => prev.map(l => l.id === data.leadId ? { ...l, ...data } : l)));
    socket.on('REP_UPDATE', data => setReps(prev => { const e = prev.find(r => r.id === data.id); return e ? prev.map(r => r.id === data.id ? { ...r, ...data } : r) : [...prev, data]; }));
    socket.on('CALL_RESULT', data => {
      if (data.status === 'answered') { setCallStatus('connected'); setCallLog(prev => [{ type: 'connected', rep: data.repName, lead: data.leadName, time: new Date().toLocaleTimeString() }, ...prev].slice(0, 100)); if (ringTimerRef.current) { clearTimeout(ringTimerRef.current); ringTimerRef.current = null; } }
      if (['no-answer','busy','timeout','declined'].includes(data.status)) { setCallLog(prev => [{ type: 'missed', rep: data.repName, lead: data.leadName, reason: data.status, time: new Date().toLocaleTimeString() }, ...prev].slice(0, 100)); if (activeCall) cascadeToNextRep(activeCall.lead, activeCall.currentIndex); }
    });
    return () => { socket.disconnect(); if (ringTimerRef.current) clearTimeout(ringTimerRef.current); };
  }, [userId, companyId, user?.role]);

  const fetchStreamLeads = useCallback(() => {
    setStreamLoading(true);
    fetch(`${API_BASE}/leads?companyId=${companyId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => {
        if (data.leads && data.leads.length > 0) setStreamLeads(data.leads);
        else setStreamLeads(mockLeads);
      })
      .catch(() => {
        console.log('[LeadArrow] Lead API offline. Using mock data.');
        setStreamLeads(mockLeads);
      })
      .finally(() => setStreamLoading(false));
  }, [companyId, token]);

  useEffect(() => { if (activeTab === 'lead_stream') fetchStreamLeads(); }, [activeTab, fetchStreamLeads]);

  const cascadeToNextRep = useCallback((lead, failedIndex) => {
    if (reps.length === 0) { setActiveCall(null); setCallStatus(''); return; }
    const nextIndex = (failedIndex + 1) % reps.length;
    const nextRep = reps[nextIndex];
    setCallLog(prev => [{ type: 'cascade', rep: nextRep?.name || 'Unknown', lead: lead?.name || 'Lead', reason: 'Auto-fallback', time: new Date().toLocaleTimeString() }, ...prev].slice(0, 100));
    if (ringTimerRef.current) clearTimeout(ringTimerRef.current);
    setActiveCall({ repId: nextRep?.id, lead, currentIndex: nextIndex });
    setCallStatus('ringing');
    fetch(`${API_BASE}/calls/initiate`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ to: nextRep?.phoneNumber || nextRep?.phone, prospectName: lead?.name || 'Prospect', companyId, repName: nextRep?.name, repId: nextRep?.id, routingMethod, ringTimeout, cascade: true, fromRep: reps[failedIndex]?.name }),
    }).catch(() => {});
    ringTimerRef.current = setTimeout(() => { setCallStatus('cascading'); cascadeToNextRep(lead, nextIndex); }, ringTimeout * 1000);
  }, [reps, companyId, token, routingMethod, ringTimeout]);

  const initiateCall = useCallback((rep, leadOverride) => {
    if (!rep) return;
    const lead = leadOverride || { name: 'Test Prospect', id: 'lead-' + Date.now() };
    const repIndex = reps.findIndex(r => r.id === rep.id);
    setActiveCall({ repId: rep.id, lead, currentIndex: repIndex });
    setCallStatus('ringing');
    setCallLog(prev => [{ type: 'calling', rep: rep?.name || 'Unknown', lead: lead?.name || 'Prospect', time: new Date().toLocaleTimeString() }, ...prev].slice(0, 100));
    fetch(`${API_BASE}/calls/initiate`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ to: rep.phoneNumber || rep.phone, prospectName: lead?.name || 'Prospect', companyId, repName: rep.name, repId: rep.id, routingMethod, ringTimeout }),
    }).catch(() => {});
    ringTimerRef.current = setTimeout(() => {
      setCallStatus('cascading');
      setCallLog(prev => [{ type: 'timeout', rep: rep?.name || 'Unknown', lead: lead?.name || 'Prospect', reason: `Ring timeout (${ringTimeout}s)`, time: new Date().toLocaleTimeString() }, ...prev].slice(0, 100));
      cascadeToNextRep(lead, repIndex);
    }, ringTimeout * 1000);
  }, [reps, companyId, token, routingMethod, ringTimeout, cascadeToNextRep]);

  const metrics = [
    { icon: TrendingUp, label: 'Total Leads Today', value: totalLeadsToday, iconCls: 'text-red-400', accent: 'border-l-red-500' },
    { icon: Check, label: 'Accepted', value: totalAccepted, iconCls: 'text-emerald-400', accent: 'border-l-emerald-500' },
    { icon: Clock, label: 'Missed', value: totalMissed, iconCls: 'text-amber-400', accent: 'border-l-amber-500' },
    { icon: Activity, label: 'Conversion Rate', value: conversionRate + '%', iconCls: 'text-violet-400', accent: 'border-l-violet-500' },
    { icon: Phone, label: 'Active Reps', value: reps.length, iconCls: 'text-blue-400', accent: 'border-l-blue-500' },
    { icon: Zap, label: 'Avg Response', value: activeCall ? 'Live' : '\u2014', iconCls: 'text-amber-400', accent: 'border-l-amber-500' },
  ];

  const userName = user?.fullName || user?.email?.split('@')[0] || 'User';

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}
      className="min-h-screen bg-[#030407] text-slate-200 flex flex-col relative">
      <BackgroundOrbs />

      <div className="relative z-30">
        <div className="w-full bg-gradient-to-r from-violet-600/10 via-transparent to-emerald-600/5 border-b border-violet-500/10 px-6 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="w-4 h-4 text-violet-400" />
            <span className="text-[11px] font-medium text-violet-300 tracking-wide">Premium Active — Unlimited Features Unlocked</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-[10px] text-emerald-400 font-medium">Live</span>
          </div>
        </div>

        <div className="w-full flex items-center justify-between px-8 py-4 border-b border-white/[0.02]">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-11 h-11 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center shadow-[0_0_20px_rgba(99,68,227,0.3)]">
                <img src="/leadarrow-logo.png" alt="LeadArrow" className="w-7 h-7 object-contain"/>
              </div>
              <span className="text-sm font-extrabold text-white tracking-[0.18em]">LEADARROW</span>
              <motion.span animate={{ scale: [1, 1.08, 1], opacity: [1, 0.7, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
                className="w-2 h-2 rounded-full bg-violet-500 shadow-[0_0_20px_rgba(99,68,227,0.8)]" />
            </div>
            <div className="h-6 w-px bg-white/[0.06]" />
            <span className="text-xs text-slate-500">Command Desk / {userName}</span>
          </div>
          <div className="flex items-center gap-2.5">
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={logout}
              className="border border-white/[0.05] hover:bg-red-500/10 hover:text-red-400 text-white/60 px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-all">
              Log out <LogOut className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </div>

      <div className="relative z-20 flex-1 overflow-y-auto">
        <div className="w-full flex items-center gap-3 px-8 py-4">
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={() => setIsCrmDrawerOpen(true)}
            className="border border-emerald-500/20 bg-emerald-500/[0.02] text-emerald-400 hover:bg-emerald-500/[0.08] px-4 py-2.5 rounded-lg flex items-center gap-2 text-sm font-medium transition-all">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Close CRM
          </motion.button>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={() => setIsSlackModalOpen(true)}
            className="border border-purple-500/20 bg-purple-500/[0.02] text-purple-400 hover:bg-purple-500/[0.08] px-4 py-2.5 rounded-lg flex items-center gap-2 text-sm font-medium transition-all">
            <MessageSquare className="w-4 h-4" /> Slack Trigger
          </motion.button>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            className="border border-white/[0.08] bg-white/[0.01] text-white/70 hover:bg-white/[0.05] px-4 py-2.5 rounded-lg flex items-center gap-2 text-sm font-medium transition-all">
            <BarChart3 className="w-4 h-4" /> Analytics Suite
          </motion.button>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            className="border border-teal-500/20 bg-teal-500/[0.02] text-teal-400 hover:bg-teal-500/[0.08] px-4 py-2.5 rounded-lg flex items-center gap-2 text-sm font-medium transition-all">
            <Download className="w-4 h-4" /> Export
          </motion.button>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={(e) => { e.preventDefault(); setActiveTab(activeTab === 'lead_stream' ? 'dashboard' : 'lead_stream'); }}
            className={cn('px-4 py-2.5 rounded-lg flex items-center gap-2 text-sm font-medium transition-all border',
              activeTab === 'lead_stream'
                ? 'text-white border-b-2 border-[#1A5CFF] bg-white/[0.02]'
                : 'border-cyan-500/20 bg-cyan-500/[0.02] text-cyan-400 hover:bg-cyan-500/[0.08]')}>
            <Database className="w-4 h-4" /> Lead Stream
          </motion.button>
          <div className="flex-1" />
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => setIsAddRepModalOpen(true)}
            className="bg-gradient-to-r from-violet-500 to-indigo-600 hover:from-violet-600 hover:to-indigo-700 text-white font-medium px-4 py-2.5 rounded-lg text-sm transition-all duration-200 flex items-center gap-2 shadow-[0_4px_20px_rgba(99,68,227,0.3)]">
            <Plus className="w-4 h-4" /> Add Rep
          </motion.button>
        </div>

        {activeTab === 'dashboard' && (
          <>
            <motion.div variants={stagger} initial="hidden" animate={pageLoaded ? 'show' : 'hidden'}
              className="grid grid-cols-6 gap-4 px-8 py-2">
              {metrics.map(card => (
                <motion.div key={card.label} variants={fadeUp}
                  className={cn('bg-[#0A0B0E]/50 backdrop-blur-xl border border-white/[0.04] rounded-xl shadow-[0_12px_40px_rgba(0,0,0,0.6)] px-4 py-3.5 border-l-2', card.accent)}>
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-[0.1em]">{card.label}</p>
                    <div className={cn('w-8 h-8 rounded-lg bg-white/[0.02] border border-white/[0.04] flex items-center justify-center', card.iconCls)}>
                      <card.icon className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <p className="text-xl font-bold text-white tracking-tight"><AnimatedStat value={card.value} /></p>
                </motion.div>
              ))}
            </motion.div>

            <AnimatePresence>
              {activeCall && ['ringing','cascading','connecting'].includes(callStatus) && (
                <motion.div initial={{ opacity: 0, y: -10, height: 0 }} animate={{ opacity: 1, y: 0, height: 'auto' }} exit={{ opacity: 0, y: -10, height: 0 }}
                  className="mx-8 mb-2 bg-violet-500/[0.05] border border-violet-500/[0.15] rounded-xl px-5 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <motion.span animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 1, repeat: Infinity }} className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-violet-500" /></motion.span>
                    <div>
                      <p className="text-xs font-semibold text-violet-200">
                        {callStatus === 'ringing' ? 'Call Ringing' : callStatus === 'cascading' ? 'Cascading...' : 'Connecting...'}
                      </p>
                      <p className="text-[10px] text-violet-400/60 mt-0.5">{activeCall?.lead?.name || 'Prospect'} &middot; Rep #{activeCall?.currentIndex + 1} &middot; {ringTimeout}s timeout</p>
                    </div>
                  </div>
                  <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    onClick={() => { if (ringTimerRef.current) clearTimeout(ringTimerRef.current); setActiveCall(null); setCallStatus(''); }}
                    className="text-[10px] font-medium text-slate-400 hover:text-slate-200 bg-white/[0.04] border border-white/[0.06] px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                    <X className="w-3 h-3" /> Cancel
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="grid grid-cols-2 gap-4 px-8 py-4">
              <GlassCard className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-violet-500/20 flex items-center justify-center"><Users className="w-3.5 h-3.5 text-violet-400" /></div>
                    <h2 className="text-sm font-bold text-white">Team &amp; Routing</h2>
                  </div>
                  <select value={routingMethod} onChange={e => setRoutingMethod(e.target.value)}
                    className="text-[10px] bg-white/[0.04] border border-white/[0.06] rounded-lg px-2.5 py-1.5 text-slate-300 focus:outline-none focus:border-violet-500/50">
                    <option value="ROUND_ROBIN">Round Robin</option>
                    <option value="PERCENTAGE">Percentage</option>
                    <option value="SKILL_BASED">Skill Based</option>
                  </select>
                </div>
                {reps.length === 0 ? (
                  <div className="py-10 text-center text-slate-500 text-sm">No reps onboarded yet</div>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {reps.map((rep, i) => (
                      <div key={rep.id} className="flex items-center justify-between bg-white/[0.02] border border-white/[0.04] rounded-lg px-3.5 py-2.5">
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500/20 to-indigo-500/20 border border-violet-500/30 flex items-center justify-center text-[10px] font-bold text-violet-300">
                            {(rep.fullName || rep.name || '?').charAt(0)}</div>
                          <div>
                            <p className="text-sm font-medium text-white">{rep.fullName || rep.name}</p>
                            <p className="text-[10px] text-slate-500">{rep.phoneNumber || rep.phone || 'No phone'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">{rep.status || 'AVAILABLE'}</span>
                          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                            onClick={() => initiateCall(rep)} disabled={activeCall?.repId === rep.id}
                            className="text-[10px] px-2.5 py-1.5 rounded-lg bg-violet-500/10 border border-violet-500/25 text-violet-300 hover:bg-violet-500/20 disabled:opacity-50">
                            <Phone className="w-3 h-3" />
                          </motion.button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </GlassCard>

              <GlassCard className="p-5">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center"><Activity className="w-3.5 h-3.5 text-emerald-400" /></div>
                  <h2 className="text-sm font-bold text-white">Live Call Log</h2>
                </div>
                {callLog.length === 0 ? (
                  <div className="py-10 text-center text-slate-500 text-sm">No call activity yet</div>
                ) : (
                  <div className="space-y-1.5 max-h-64 overflow-y-auto">
                    {callLog.slice(0, 15).map((entry, i) => (
                      <div key={i} className="flex items-center gap-3 text-xs bg-white/[0.02] border border-white/[0.03] rounded-lg px-3 py-2">
                        <span className={cn('w-1.5 h-1.5 rounded-full shrink-0',
                          entry.type === 'connected' ? 'bg-emerald-400' : entry.type === 'cascade' ? 'bg-violet-400' : entry.type === 'timeout' ? 'bg-amber-400' : 'bg-red-400')} />
                        <span className="text-slate-400 min-w-[50px]">{entry.time}</span>
                        <span className="text-white font-medium">{entry.rep || 'Unknown'}</span>
                        <span className="text-slate-500">&rarr;</span>
                        <span className="text-slate-300">{entry.lead || 'Lead'}</span>
                        {entry.reason && <span className="text-slate-500 ml-auto">({entry.reason})</span>}
                      </div>
                    ))}
                  </div>
                )}
              </GlassCard>
            </div>

            <div className="px-8 pb-8">
              <GlassCard className="p-5">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/20 flex items-center justify-center"><Radio className="w-3.5 h-3.5 text-amber-400" /></div>
                  <h2 className="text-sm font-bold text-white">Lead Stream &amp; Analytics</h2>
                  <span className="text-[10px] text-slate-500 ml-auto">{leads.length} leads today</span>
                </div>
                {leads.length === 0 ? (
                  <div className="py-8 text-center text-slate-500 text-sm">Waiting for incoming leads...</div>
                ) : (
                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {leads.slice(0, 20).map((lead, i) => (
                      <div key={lead.id || i} className="flex items-center justify-between text-xs bg-white/[0.02] border border-white/[0.03] rounded-lg px-3.5 py-2">
                        <div className="flex items-center gap-3">
                          <span className={cn('w-2 h-2 rounded-full', lead.status === 'CLAIMED' ? 'bg-emerald-400' : lead.status === 'MISSED' ? 'bg-red-400' : 'bg-amber-400')} />
                          <span className="text-white">{lead.prospectName || lead.name || 'Unknown'}</span>
                          <span className="text-slate-500">{lead.leadSource || '\u2014'}</span>
                        </div>
                        <span className="text-slate-500">{lead.time || ''}</span>
                      </div>
                    ))}
                  </div>
                )}
              </GlassCard>
            </div>
          </>
        )}

        {activeTab === 'lead_stream' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
            className="px-8 py-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center"><Database className="w-4 h-4 text-cyan-400" /></div>
                <h2 className="text-lg font-bold text-white">Live Lead Stream</h2>
                <span className="text-[10px] text-slate-500">({streamLeads.length} leads)</span>
              </div>
              <div className="flex items-center gap-2.5">
                <select value={leadFilter} onChange={e => setLeadFilter(e.target.value)}
                  className="text-[10px] bg-white/[0.04] border border-white/[0.06] rounded-lg px-2.5 py-1.5 text-slate-300 focus:outline-none focus:border-cyan-500/50">
                  <option value="all">All Sources</option>
                  <option value="Close CRM">Close CRM</option>
                  <option value="LinkedIn">LinkedIn</option>
                  <option value="Slack Webhook">Slack Webhook</option>
                  <option value="Website">Website</option>
                </select>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  onClick={() => fetchStreamLeads()}
                  className="text-[10px] bg-white/[0.04] border border-white/[0.06] text-slate-300 hover:text-white px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all">
                  <RefreshCw className={cn('w-3 h-3', streamLoading && 'animate-spin')} /> Refresh
                </motion.button>
              </div>
            </div>

            <GlassCard className="overflow-hidden">
              {streamLoading ? (
                <div className="py-16 flex items-center justify-center">
                  <RefreshCw className="w-6 h-6 animate-spin text-cyan-400" />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-white/[0.04] bg-white/[0.01]">
                        {['Name', 'Source', 'Status', 'Company', 'Contact', 'Time'].map(h => (
                          <th key={h} className="px-5 py-3.5 font-semibold text-slate-500 text-[10px] uppercase tracking-[0.12em]">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.03]">
                      {(streamLeads.length > 0 ? streamLeads : mockLeads)
                        .filter(l => leadFilter === 'all' || l.leadSource === leadFilter)
                        .map((lead, i) => (
                          <motion.tr key={lead.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                            className="hover:bg-white/[0.015] transition-colors">
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center text-[11px] font-bold text-cyan-300">
                                  {(lead.prospectName || lead.name || '?').charAt(0)}</div>
                                <span className="font-medium text-white text-sm">{lead.prospectName || lead.name}</span>
                              </div>
                            </td>
                            <td className="px-5 py-4">
                              <span className="text-[10px] px-2 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/25">{lead.leadSource || '—'}</span>
                            </td>
                            <td className="px-5 py-4">
                              <span className={cn('text-[10px] px-2 py-1 rounded-full font-medium border',
                                lead.status === 'CLAIMED' ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25' :
                                lead.status === 'MISSED' ? 'bg-red-500/10 text-red-300 border-red-500/25' :
                                'bg-amber-500/10 text-amber-300 border-amber-500/25')}>{lead.status || 'NEW'}</span>
                            </td>
                            <td className="px-5 py-4 text-sm text-slate-400">{lead.company || '—'}</td>
                            <td className="px-5 py-4">
                              <div className="text-sm text-slate-400">{lead.email || '—'}</div>
                              <div className="text-[10px] text-slate-600 font-mono">{lead.phone || '—'}</div>
                            </td>
                            <td className="px-5 py-4 text-sm text-slate-500">{lead.time || ''}</td>
                          </motion.tr>
                        ))}
                    </tbody>
                  </table>
                  {streamLeads.length === 0 && mockLeads.filter(l => leadFilter === 'all' || l.leadSource === leadFilter).length === 0 && (
                    <div className="py-12 text-center text-slate-500 text-sm">No leads match the selected filter.</div>
                  )}
                </div>
              )}
            </GlassCard>
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {isCrmDrawerOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex justify-end" onClick={() => setIsCrmDrawerOpen(false)}>
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 28, stiffness: 220 }} onClick={e => e.stopPropagation()}
              className="w-full max-w-md bg-[#0A0B0E] border-l border-white/[0.06] shadow-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-bold text-white">CRM Sync</h3>
                <motion.button whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9 }} onClick={() => setIsCrmDrawerOpen(false)}
                  className="text-slate-500 hover:text-slate-300 transition"><X className="w-5 h-5" /></motion.button>
              </div>
              <p className="text-xs text-slate-500">Premium CRM connectors active. Real-time sync enabled.</p>
            </motion.div>
          </motion.div>
        )}
        {isSlackModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4" onClick={() => setIsSlackModalOpen(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 30 }} animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 30 }} transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              onClick={e => e.stopPropagation()}
              className="bg-[#0A0B0E] border border-white/[0.06] rounded-xl shadow-[0_12px_40px_rgba(0,0,0,0.6)] p-8 max-w-lg w-full">
              <h3 className="text-sm font-bold text-white mb-4">Slack Integration</h3>
              <p className="text-xs text-slate-500">Premium Slack webhook active. Routing leads in real-time.</p>
            </motion.div>
          </motion.div>
        )}
        {isAddRepModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4" onClick={() => setIsAddRepModalOpen(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 30 }} animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 30 }} transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              onClick={e => e.stopPropagation()}
              className="bg-[#0A0B0E] border border-white/[0.06] rounded-xl shadow-[0_12px_40px_rgba(0,0,0,0.6)] p-6 w-full max-w-sm">
              <p className="text-sm text-slate-400 text-center py-8">Premium rep onboarding &mdash; coming soon.</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300, delay: 1 }}
        className="fixed bottom-4 right-4 z-40">
        <div className="px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/25 text-[9px] font-semibold text-violet-400 tracking-[0.15em] uppercase shadow-lg flex items-center gap-1.5">
          <Sparkles className="w-2.5 h-2.5" />PREMIUM
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function PremiumDashboard() {
  return (
    <PremiumRouteGuard fallback="/dashboard">
      <PremiumDashboardContent />
    </PremiumRouteGuard>
  );
}
