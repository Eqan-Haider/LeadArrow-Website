'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE, apiFetch } from '../../lib/api';
import { AnimatedWords, AnimatedChars } from '../../components/AnimatedText';

const PLANS = [
  { id: 'starter',   label: 'Starter',    price: '$750',  period: 'mo', desc: '1-5 reps, basic routing' },
  { id: 'pro',       label: 'Pro',         price: '$1,500',period: 'mo', desc: 'Up to 15 reps, analytics' },
  { id: 'growth',    label: 'Growth',      price: '$3,000',period: 'mo', desc: 'Unlimited reps, CRM sync' },
  { id: 'enterprise',label: 'Enterprise',  price: 'Custom', period: '',  desc: 'Dedicated infra & support' },
];

export default function BillingPage() {
  const router = useRouter();
  const [workspaceId, setWorkspaceId] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('pro');
  const [email, setEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState('plans'); // plans | payment | processing

  useEffect(() => {
    const stored = localStorage.getItem('companyId') || localStorage.getItem('workspaceId') || '';
    setWorkspaceId(stored);
  }, []);

  function luhnCheck(digits) {
    const d = digits.replace(/\D/g, '');
    let sum = 0, alt = false;
    for (let i = d.length - 1; i >= 0; i--) {
      let num = parseInt(d[i], 10);
      if (alt) { num *= 2; if (num > 9) num -= 9; }
      sum += num;
      alt = !alt;
    }
    return sum % 10 === 0;
  }

  function formatCard(v) {
    const n = v.replace(/\D/g, '').slice(0, 16);
    const parts = [];
    for (let i = 0; i < n.length; i += 4) parts.push(n.slice(i, i + 4));
    return parts.join(' ');
  }

  function formatExpiry(v) {
    const n = v.replace(/\D/g, '').slice(0, 4);
    if (n.length >= 3) return n.slice(0, 2) + '/' + n.slice(2);
    return n;
  }

  function detectBrand(num) {
    const n = num.replace(/\s/g, '');
    if (/^4/.test(n)) return 'visa';
    if (/^5[1-5]/.test(n)) return 'mastercard';
    if (/^3[47]/.test(n)) return 'amex';
    return null;
  }

  function validate() {
    const e = {};
    if (!email || !/\S+@\S+\.\S+/.test(email)) e.email = 'Valid email required';
    const clean = cardNumber.replace(/\s/g, '');
    if (clean.length < 13 || clean.length > 19) e.cardNumber = 'Card must be 13-19 digits';
    else if (!luhnCheck(clean)) e.cardNumber = 'Invalid card number';
    const expMatch = expiry.match(/^(\d{2})\/(\d{2})$/);
    if (!expMatch) e.expiry = 'MM/YY required';
    else {
      const m = parseInt(expMatch[1]), y = parseInt(expMatch[2]);
      const now = new Date();
      const curY = now.getFullYear() % 100, curM = now.getMonth() + 1;
      if (m < 1 || m > 12) e.expiry = 'Invalid month';
      else if (y < curY || (y === curY && m < curM)) e.expiry = 'Card expired';
    }
    const c = cvc.replace(/\D/g, '');
    if (c.length < 3 || c.length > 4) e.cvc = 'CVC must be 3-4 digits';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handlePurchase(e) {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    setCheckoutStep('processing');
    try {
      const res = await fetch(`${API_BASE}/purchase/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, plan: selectedPlan, companyName: companyName || email, workspaceId }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setErrors({ server: data.error || 'Checkout failed' });
        setCheckoutStep('payment');
      }
    } catch (err) {
      setErrors({ server: 'Network error' });
      setCheckoutStep('payment');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[50%] h-[50%] bg-violet-600/8 rounded-full blur-[140px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[45%] h-[45%] bg-indigo-600/8 rounded-full blur-[120px]" />
        <div className="absolute inset-0 opacity-[0.012]" style={{backgroundImage:'linear-gradient(rgba(255,255,255,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.12) 1px, transparent 1px)', backgroundSize:'32px 32px'}} />
        <div className="absolute inset-0 opacity-[0.04]" style={{backgroundImage:'radial-gradient(circle at 1px 1px, rgba(139,92,246,0.3) 1px, transparent 0)', backgroundSize:'40px 40px'}} />
      </div>
      <div className="fixed top-4 right-4 z-30 flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/70 backdrop-blur border border-emerald-500/20 shadow-lg">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>
        <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">System Online</span>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <AnimatedWords text="Billing & Subscriptions" className="text-2xl sm:text-3xl font-black text-white tracking-tight" />
            <p className="text-sm text-slate-400 mt-1">Manage your plan and payment methods</p>
          </div>
          <button onClick={() => router.push('/dashboard')} className="text-sm text-slate-400 hover:text-white transition px-4 py-2 rounded-xl border border-white/10 hover:border-white/20">
            Back to Dashboard
          </button>
        </div>

        <AnimatePresence mode="wait">
          {checkoutStep === 'plans' && (
            <motion.div key="plans" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {PLANS.map((plan) => (
                  <motion.button
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan.id)}
                    whileHover={{ scale: 1.02, borderColor: 'rgba(139,92,246,0.4)' }}
                    whileTap={{ scale: 0.98 }}
                    className={`relative text-left rounded-2xl p-5 border transition-all duration-200 ${
                      selectedPlan === plan.id
                        ? 'border-violet-500/50 bg-violet-500/10 shadow-lg shadow-violet-500/10'
                        : 'border-white/8 bg-slate-900/40 hover:bg-slate-800/40'
                    }`}
                  >
                    {plan.id === 'growth' && (
                      <span className="absolute -top-2.5 right-3 text-[10px] font-bold uppercase tracking-wider bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-2.5 py-0.5 rounded-full">Popular</span>
                    )}
                    <p className="text-sm font-semibold text-white">{plan.label}</p>
                    <p className="text-2xl font-black text-white mt-2 tracking-tight">
                      {plan.price}<span className="text-sm font-medium text-slate-500">/{plan.period}</span>
                    </p>
                    <p className="text-xs text-slate-500 mt-2">{plan.desc}</p>
                  </motion.button>
                ))}
              </div>
              <motion.button
                onClick={() => setCheckoutStep('payment')}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold text-sm py-4 px-6 rounded-xl hover:from-violet-500 hover:to-indigo-500 transition-all duration-200 shadow-lg shadow-violet-600/20"
              >
                Continue with {PLANS.find(p => p.id === selectedPlan)?.label} &mdash; {PLANS.find(p => p.id === selectedPlan)?.price}/{PLANS.find(p => p.id === selectedPlan)?.period}
              </motion.button>
            </motion.div>
          )}

          {checkoutStep === 'payment' && (
            <motion.div key="payment" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.3 }}>
              <div className="max-w-lg mx-auto">
                <div className="rounded-2xl border border-white/8 bg-slate-900/60 backdrop-blur-xl shadow-2xl overflow-hidden relative">
                  <div className="absolute top-0 left-[15%] right-[15%] h-px bg-gradient-to-r from-transparent via-violet-500/60 to-transparent" />
                  <div className="p-6 md:p-8">
                    <div className="flex items-center justify-between mb-6">
                      <AnimatedChars text="Payment Details" className="text-lg font-bold text-white" />
                      <span className="text-[11px] font-semibold uppercase tracking-widest text-violet-400 bg-violet-500/10 border border-violet-500/25 rounded-full px-3 py-1">
                        {PLANS.find(p => p.id === selectedPlan)?.label}
                      </span>
                    </div>

                    <div className="rounded-xl border border-white/6 bg-slate-950/50 p-4 mb-6 flex items-center justify-between">
                      <div>
                        <p className="text-xs text-slate-500 font-medium">Plan Total</p>
                        <p className="text-lg font-bold text-white">{PLANS.find(p => p.id === selectedPlan)?.price}<span className="text-sm font-medium text-slate-500">/{PLANS.find(p => p.id === selectedPlan)?.period}</span></p>
                      </div>
                      <div className="w-12 h-8 rounded-lg bg-gradient-to-br from-violet-500/20 to-indigo-500/20 border border-violet-500/20 flex items-center justify-center">
                        <svg className="w-5 h-5 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" ></path></svg>
                      </div>
                    </div>

                    <form onSubmit={handlePurchase} className="space-y-4">
                      <div>
                        <label className="block text-[11px] font-semibold uppercase tracking-widest text-slate-500 mb-1.5">Email Address</label>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" className="w-full rounded-xl px-4 py-3 text-sm font-medium bg-white/4 border border-white/6 text-white placeholder:text-slate-600 focus:border-violet-500/50 focus:bg-white/[0.06] transition outline-none" />
                        {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email}</p>}
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold uppercase tracking-widest text-slate-500 mb-1.5">Company Name</label>
                        <input type="text" value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="Acme Inc." className="w-full rounded-xl px-4 py-3 text-sm font-medium bg-white/4 border border-white/6 text-white placeholder:text-slate-600 focus:border-violet-500/50 transition outline-none" />
                      </div>

                      <div className="pt-2 border-t border-white/6" />

                      <div>
                        <label className="block text-[11px] font-semibold uppercase tracking-widest text-slate-500 mb-1.5">Card Number</label>
                        <div className="relative">
                          <input type="text" inputMode="numeric" value={cardNumber} onChange={e => setCardNumber(formatCard(e.target.value))} placeholder="4000 1234 5678 9010" className="w-full rounded-xl px-4 py-3 text-sm font-medium bg-white/4 border border-white/6 text-white placeholder:text-slate-600 focus:border-violet-500/50 transition outline-none" />
                          {detectBrand(cardNumber) && (
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold uppercase tracking-widest bg-white/10 px-2 py-0.5 rounded border border-white/10 text-white">{detectBrand(cardNumber)}</span>
                          )}
                        </div>
                        {errors.cardNumber && <p className="text-xs text-red-400 mt-1">{errors.cardNumber}</p>}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[11px] font-semibold uppercase tracking-widest text-slate-500 mb-1.5">Expiry</label>
                          <input type="text" value={expiry} onChange={e => setExpiry(formatExpiry(e.target.value))} placeholder="MM/YY" className="w-full rounded-xl px-4 py-3 text-sm font-medium bg-white/4 border border-white/6 text-white placeholder:text-slate-600 focus:border-violet-500/50 transition outline-none" />
                          {errors.expiry && <p className="text-xs text-red-400 mt-1">{errors.expiry}</p>}
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold uppercase tracking-widest text-slate-500 mb-1.5">CVC</label>
                          <input type="text" inputMode="numeric" value={cvc} onChange={e => setCvc(e.target.value.replace(/\D/g, '').slice(0, 4))} placeholder="123" className="w-full rounded-xl px-4 py-3 text-sm font-medium bg-white/4 border border-white/6 text-white placeholder:text-slate-600 focus:border-violet-500/50 transition outline-none" />
                          {errors.cvc && <p className="text-xs text-red-400 mt-1">{errors.cvc}</p>}
                        </div>
                      </div>

                      {errors.server && (
                        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs font-medium text-red-400">{errors.server}</div>
                      )}

                      <button type="submit" className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold text-sm py-4 px-6 rounded-xl hover:from-violet-500 hover:to-indigo-500 transition-all duration-200 shadow-lg shadow-violet-600/20 flex items-center justify-center gap-2">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" ></path></svg>
                        Pay {PLANS.find(p => p.id === selectedPlan)?.price}/{PLANS.find(p => p.id === selectedPlan)?.period}
                      </button>
                    </form>

                    <p className="mt-4 text-[10px] text-center text-slate-600">Secured with 256-bit encryption. Your card details are processed securely.</p>
                  </div>
                </div>
                <button onClick={() => setCheckoutStep('plans')} className="mt-4 text-sm text-slate-500 hover:text-slate-300 transition mx-auto block">
                  &larr; Change plan
                </button>
              </div>
            </motion.div>
          )}

          {checkoutStep === 'processing' && (
            <motion.div key="processing" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center py-20">
              <div className="relative">
                <div className="w-20 h-20 rounded-full border-4 border-violet-500/20 border-t-violet-500 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-violet-500/20 animate-pulse" />
                </div>
              </div>
              <p className="mt-6 text-lg font-semibold text-white">Processing Payment</p>
              <p className="text-sm text-slate-400 mt-1">Please wait while we verify your transaction...</p>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
