'use client';
import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { API_BASE } from '../lib/api';
import BackgroundSystem from '../components/BackgroundSystem.jsx';

const PLANS = [
  { id: 'starter', label: 'Starter', price: '$750', period: 'mo', desc: '1-5 reps, basic routing', maxLeads: '1,000 leads/mo', crm: '1 CRM', pop: false },
  { id: 'pro', label: 'Pro', price: '$1,500', period: 'mo', desc: 'Up to 15 reps, analytics', maxLeads: '5,000 leads/mo', crm: '3 CRMs', pop: true },
  { id: 'growth', label: 'Growth', price: '$3,000', period: 'mo', desc: 'Unlimited reps, CRM sync', maxLeads: '25,000 leads/mo', crm: '10 CRMs', pop: false },
  { id: 'enterprise', label: 'Enterprise', price: 'Custom', period: '', desc: 'Dedicated infra & support', maxLeads: 'Unlimited', crm: 'Unlimited', pop: false },
];

function PaymentForm() {
  const searchParams = useSearchParams();
  const origin = searchParams.get('origin') || 'landing';
  const preSelectedPlan = searchParams.get('plan') || 'pro';
  const canvasRef = useRef(null);

  var [selectedPlan, setSelectedPlan] = useState(preSelectedPlan);
  var [email, setEmail] = useState('');
  var [companyName, setCompanyName] = useState('');
  var [fullName, setFullName] = useState('');
  var [cardNumber, setCardNumber] = useState('');
  var [expiry, setExpiry] = useState('');
  var [cvc, setCvc] = useState('');
  var [errors, setErrors] = useState({});
  var [isSubmitting, setIsSubmitting] = useState(false);
  var [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  var [focusedField, setFocusedField] = useState(null);
  var [processingStep, setProcessingStep] = useState('');

  useEffect(() => {
    const onMove = (e) => setMousePos({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w = canvas.width = window.innerWidth;
    let h = canvas.height = window.innerHeight;
    const cubes = [];

    for (let i = 0; i < 40; i++) {
      cubes.push({
        x: Math.random() * w, y: Math.random() * h,
        z: Math.random() * 3 + 0.5,
        size: Math.random() * 18 + 6,
        dx: (Math.random() - 0.5) * 0.6,
        dy: (Math.random() - 0.5) * 0.6,
        rot: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.02,
        alpha: Math.random() * 0.15 + 0.04,
        pulse: Math.random() * Math.PI * 2,
      });
    }

    let frame;
    function draw() {
      ctx.clearRect(0, 0, w, h);
      for (const c of cubes) {
        c.x += c.dx; c.y += c.dy;
        c.rot += c.rotSpeed;
        c.pulse += 0.02;
        if (c.x < -20 || c.x > w + 20) c.dx *= -1;
        if (c.y < -20 || c.y > h + 20) c.dy *= -1;
        ctx.save();
        ctx.translate(c.x, c.y);
        ctx.rotate(c.rot);
        const pulseA = c.alpha + Math.sin(c.pulse) * 0.05;
        ctx.strokeStyle = `rgba(139,92,246,${pulseA})`;
        ctx.lineWidth = 1;
        ctx.strokeRect(-c.size / 2, -c.size / 2, c.size, c.size);
        ctx.fillStyle = `rgba(139,92,246,${pulseA * 0.15})`;
        ctx.fillRect(-c.size / 2, -c.size / 2, c.size, c.size);
        ctx.restore();
      }
      const grad = ctx.createRadialGradient(w * mousePos.x, h * mousePos.y, 0, w * mousePos.x, h * mousePos.y, 250);
      grad.addColorStop(0, 'rgba(139,92,246,0.04)');
      grad.addColorStop(1, 'rgba(139,92,246,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
      frame = requestAnimationFrame(draw);
    }
    draw();
    const onResize = () => { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; };
    window.addEventListener('resize', onResize);
    return () => { window.removeEventListener('resize', onResize); if (frame) cancelAnimationFrame(frame); };
  }, [mousePos]);

  function luhnCheck(digits) {
    const d = digits.replace(/\D/g, '');
    let sum = 0, alt = false;
    for (let i = d.length - 1; i >= 0; i--) {
      let num = parseInt(d[i], 10);
      if (alt) { num *= 2; if (num > 9) num -= 9; }
      sum += num; alt = !alt;
    }
    return sum % 10 === 0;
  }

  function formatCard(v) { return v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim(); }
  function formatExpiry(v) { const n = v.replace(/\D/g, '').slice(0, 4); if (n.length >= 3) return n.slice(0, 2) + '/' + n.slice(2); return n; }

  function detectBrand(num) {
    const n = num.replace(/\s/g, '');
    if (/^4/.test(n)) return 'visa';
    if (/^5[1-5]/.test(n)) return 'mastercard';
    if (/^3[47]/.test(n)) return 'amex';
    return null;
  }

  const brand = detectBrand(cardNumber);

  function validate() {
    const e = {};
    if (!fullName.trim()) e.fullName = 'Full name required';
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

  var [paidLicenseKey, setPaidLicenseKey] = useState(null);

  async function handlePurchase(e) {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    setProcessingStep('Encrypting payment data...');
    await new Promise(r => setTimeout(r, 600));
    setProcessingStep('Contacting secure gateway...');
    await new Promise(r => setTimeout(r, 500));
    setProcessingStep('Verifying transaction...');
    try {
      var cleanNum = cardNumber.replace(/\s/g, '');
      var plan = PLANS.find(p => p.id === selectedPlan);
      var res = await fetch(API_BASE + '/payment/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planName: plan.label, planPrice: plan.price.replace(/[^0-9]/g,''),
          email: email, cardNumber: cleanNum, cardExpiry: expiry,
          cardCvv: cvc, cardName: fullName.trim(),
        }),
      });
      var data = await res.json();
      if (data.success) {
        setPaidLicenseKey(data.licenseKey);
        localStorage.setItem('subscriptionTier','PREMIUM');
        localStorage.setItem('premiumLicenseKey',data.licenseKey||'');
        localStorage.setItem('licenseActivated','true');
        window.scrollTo(0,0);
        setIsSubmitting(false);
      } else {
        setErrors({ server: data.message || 'Payment declined' });
        setIsSubmitting(false);
        setProcessingStep('');
      }
    } catch (err) {
      setErrors({ server: 'Network error. Please try again.' });
      setIsSubmitting(false);
      setProcessingStep('');
    }
  }

  const inputBase = 'w-full rounded-xl px-4 py-3 text-sm font-medium bg-white/4 border text-white placeholder:text-slate-600 focus:outline-none transition-all duration-300';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 relative overflow-hidden">
      <BackgroundSystem />
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-[1]" />
      <div className="fixed inset-0 pointer-events-none z-[2]">
        <motion.div className="absolute w-[50%] h-[50%] rounded-full bg-violet-600/8 blur-[180px]" animate={{ left: `${mousePos.x * 15}%`, top: `${mousePos.y * 15}%` }} transition={{ type: 'spring', stiffness: 20, damping: 15 }} />
        <motion.div className="absolute w-[45%] h-[45%] rounded-full bg-indigo-600/6 blur-[160px]" animate={{ right: `${(1 - mousePos.x) * 15}%`, bottom: `${(1 - mousePos.y) * 15}%` }} transition={{ type: 'spring', stiffness: 20, damping: 15 }} />
        <div className="absolute inset-0 opacity-[0.015]" style={{backgroundImage:'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize:'48px 48px'}} />
      </div>

      <div className="fixed top-4 right-4 z-30 flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/70 backdrop-blur border border-emerald-500/20 shadow-lg">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>
        <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">Secure Checkout</span>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-8 pt-24">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mb-8 text-center">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-violet-500/10 to-indigo-500/10 border border-violet-500/20 mb-4"
          >
            <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }} className="w-2 h-2 rounded-full bg-violet-400" />
            <span className="text-[11px] font-semibold uppercase tracking-widest text-violet-300">Premium Activation</span>
          </motion.div>

          <motion.h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
            {'Complete Your Upgrade'.split('').map((char, i) => (
              <motion.span key={i}
                initial={{ opacity: 0, y: 20, rotateX: -90 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ delay: 0.5 + i * 0.025, type: 'spring', stiffness: 200, damping: 15 }}
                className="inline-block" style={{ transformStyle: 'preserve-3d' }}
              >{char === ' ' ? '\u00A0' : char}</motion.span>
            ))}
          </motion.h1>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2, duration: 0.6 }}
            className="mt-4 mx-auto flex items-center gap-3 justify-center"
          >
            <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 2.5, repeat: Infinity }} className="h-px w-12 bg-gradient-to-r from-transparent to-violet-400/50" />
            <motion.span className="flex items-center gap-2 text-sm font-semibold">
              <span className="bg-gradient-to-r from-violet-300 to-indigo-300 bg-clip-text text-transparent">{PLANS.find(p => p.id === selectedPlan)?.label}</span>
              <span className="text-slate-500">·</span>
              <span className="text-slate-400">{PLANS.find(p => p.id === selectedPlan)?.price}<span className="text-slate-600">/{PLANS.find(p => p.id === selectedPlan)?.period}</span></span>
            </motion.span>
            <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 2.5, repeat: Infinity }} className="h-px w-12 bg-gradient-to-r from-violet-400/50 to-transparent" />
          </motion.div>
        </motion.div>

        {paidLicenseKey ? (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="max-w-md mx-auto rounded-2xl border border-emerald-500/20 bg-slate-900/60 backdrop-blur-xl p-10 text-center shadow-[0_0_60px_rgba(16,185,129,0.1)]"
          >
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-400/40 flex items-center justify-center mx-auto mb-6 shadow-[0_0_60px_rgba(16,185,129,0.2)]">
              <svg className="w-10 h-10 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Payment Successful!</h2>
            <p className="text-emerald-300 font-semibold text-sm mb-1">Your {PLANS.find(p => p.id === selectedPlan)?.label} plan is now active.</p>
            <p className="text-xs text-slate-500 mb-6">A confirmation email has been sent to {email}</p>
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 mb-6">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mb-1">Your License Key</p>
              <p className="text-sm font-mono tracking-[0.2em] text-amber-400 font-bold">{paidLicenseKey}</p>
            </div>
            <a href={origin === 'landing' ? '/login' : '/dashboard'}
              className="block w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold py-4 rounded-xl text-base shadow-[0_4px_25px_rgba(99,68,227,0.3)] transition-all duration-200">
              {origin === 'landing' ? 'Go to Login' : 'Go to Dashboard'}
            </a>
          </motion.div>
        ) : isSubmitting ? (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="max-w-md mx-auto rounded-2xl border border-white/8 bg-slate-900/60 backdrop-blur-xl p-10 text-center"
          >
            <div className="relative w-20 h-20 mx-auto mb-6">
              <div className="w-20 h-20 rounded-full border-4 border-violet-500/20 border-t-violet-500 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-violet-500/20 animate-pulse" />
              </div>
            </div>
            <motion.p key={processingStep} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
              className="text-sm font-medium text-violet-300"
            >{processingStep}</motion.p>
            <p className="text-xs text-slate-500 mt-2">Please do not close this window</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <div className="md:col-span-3">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.15 }}
                className="rounded-2xl border border-white/8 bg-slate-900/60 backdrop-blur-xl shadow-2xl overflow-hidden relative"
              >
                <div className="absolute top-0 left-[15%] right-[15%] h-px bg-gradient-to-r from-transparent via-violet-500/60 to-transparent" />
                <div className="p-6 md:p-8">

                  <form onSubmit={handlePurchase} className="space-y-4">
                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-widest text-slate-500 mb-1.5">Full Name</label>
                      <motion.input whileFocus={{ scale: 1.01 }}
                        type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="John Doe"
                        onFocus={() => setFocusedField('fullName')} onBlur={() => setFocusedField(null)}
                        className={`${inputBase} ${focusedField === 'fullName' ? 'border-violet-500/50 bg-white/[0.06] shadow-[0_0_24px_rgba(139,92,246,0.15)]' : 'border-white/6'}`} />
                      {errors.fullName && <p className="text-xs text-red-400 mt-1">{errors.fullName}</p>}
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-widest text-slate-500 mb-1.5">Email Address</label>
                      <motion.input whileFocus={{ scale: 1.01 }}
                        type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com"
                        onFocus={() => setFocusedField('email')} onBlur={() => setFocusedField(null)}
                        className={`${inputBase} ${focusedField === 'email' ? 'border-violet-500/50 bg-white/[0.06] shadow-[0_0_24px_rgba(139,92,246,0.15)]' : 'border-white/6'}`} />
                      {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email}</p>}
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-widest text-slate-500 mb-1.5">Company Name</label>
                      <motion.input whileFocus={{ scale: 1.01 }}
                        type="text" value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="Acme Inc."
                        onFocus={() => setFocusedField('company')} onBlur={() => setFocusedField(null)}
                        className={`${inputBase} ${focusedField === 'company' ? 'border-violet-500/50 bg-white/[0.06] shadow-[0_0_24px_rgba(139,92,246,0.15)]' : 'border-white/6'}`} />
                    </div>

                    <div className="pt-2 border-t border-white/6" />

                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-widest text-slate-500 mb-1.5">Card Number</label>
                      <div className="relative">
                        <motion.input whileFocus={{ scale: 1.01 }}
                          type="text" inputMode="numeric" value={cardNumber} onChange={e => setCardNumber(formatCard(e.target.value))} placeholder="4000 1234 5678 9010"
                          onFocus={() => setFocusedField('card')} onBlur={() => setFocusedField(null)}
                          className={`${inputBase} ${focusedField === 'card' ? 'border-violet-500/50 bg-white/[0.06] shadow-[0_0_24px_rgba(139,92,246,0.15)]' : 'border-white/6'}`} />
                        {brand && (
                          <motion.span initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold uppercase tracking-widest bg-white/10 px-2 py-0.5 rounded border border-white/10 text-white">{brand}</motion.span>
                        )}
                      </div>
                      {errors.cardNumber && <p className="text-xs text-red-400 mt-1">{errors.cardNumber}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-semibold uppercase tracking-widest text-slate-500 mb-1.5">Expiry</label>
                        <motion.input whileFocus={{ scale: 1.01 }} type="text" value={expiry} onChange={e => setExpiry(formatExpiry(e.target.value))} placeholder="MM/YY"
                          onFocus={() => setFocusedField('expiry')} onBlur={() => setFocusedField(null)}
                          className={`${inputBase} ${focusedField === 'expiry' ? 'border-violet-500/50 bg-white/[0.06] shadow-[0_0_24px_rgba(139,92,246,0.15)]' : 'border-white/6'}`} />
                        {errors.expiry && <p className="text-xs text-red-400 mt-1">{errors.expiry}</p>}
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold uppercase tracking-widest text-slate-500 mb-1.5">CVC</label>
                        <motion.input whileFocus={{ scale: 1.01 }} type="text" inputMode="numeric" value={cvc} onChange={e => setCvc(e.target.value.replace(/\D/g, '').slice(0, 4))} placeholder="123"
                          onFocus={() => setFocusedField('cvc')} onBlur={() => setFocusedField(null)}
                          className={`${inputBase} ${focusedField === 'cvc' ? 'border-violet-500/50 bg-white/[0.06] shadow-[0_0_24px_rgba(139,92,246,0.15)]' : 'border-white/6'}`} />
                        {errors.cvc && <p className="text-xs text-red-400 mt-1">{errors.cvc}</p>}
                      </div>
                    </div>

                    {errors.server && (
                      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                        className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs font-medium text-red-400">{errors.server}</motion.div>
                    )}

                    <motion.button type="submit" disabled={isSubmitting}
                      whileHover={{ scale: 1.02, boxShadow: '0 0 40px rgba(139,92,246,0.35)' }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold text-sm py-4 px-6 rounded-xl hover:from-violet-500 hover:to-indigo-500 transition-all duration-200 shadow-lg shadow-violet-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                      Pay {PLANS.find(p => p.id === selectedPlan)?.price}/{PLANS.find(p => p.id === selectedPlan)?.period}
                    </motion.button>
                  </form>

                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}
                    className="mt-4 text-[10px] text-center text-slate-600">256-bit encrypted &mdash; your card details are safe</motion.p>
                </div>
              </motion.div>
            </div>

            <div className="md:col-span-2 space-y-4">
              <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15, duration: 0.5 }}
                className="rounded-2xl border border-white/8 bg-slate-900/60 backdrop-blur-xl p-5"
              >
                <h3 className="text-xs font-bold text-white/60 uppercase tracking-widest mb-3">Select Plan</h3>
                <div className="space-y-2">
                  {PLANS.filter(function(p){return p.id!=='enterprise'}).map(function(p) {
                    var active = selectedPlan === p.id;
                    var isPro = p.id === 'pro';
                    return (
                      <button key={p.id} onClick={function(){setSelectedPlan(p.id)}}
                        className={'w-full text-left p-3 rounded-xl border transition-all duration-200 ' + (active ? 'bg-violet-500/10 border-violet-500/30 shadow-[0_0_20px_rgba(99,68,227,0.1)]' : 'bg-white/[0.02] border-white/[0.06] hover:border-white/[0.12]')}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {isPro && <span className="text-[9px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded">POPULAR</span>}
                            <span className={'text-sm font-semibold ' + (active ? 'text-white' : 'text-gray-400')}>{p.label}</span>
                          </div>
                          <span className={'text-sm font-bold ' + (active ? 'text-violet-300' : 'text-gray-500')}>{p.price}<span className="text-[10px] font-normal text-gray-600">/{p.period}</span></span>
                        </div>
                        <p className="text-[10px] text-gray-600 mt-1">{p.desc} &middot; {p.maxLeads}</p>
                      </button>
                    );
                  })}
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25, duration: 0.5 }}
                className="rounded-2xl border border-white/8 bg-slate-900/60 backdrop-blur-xl p-5"
              >
                <h3 className="text-xs font-bold text-white/60 uppercase tracking-widest mb-3">Order Summary</h3>
                <div className="space-y-2.5">
                  {[
                    { label: 'Plan', value: PLANS.find(p => p.id === selectedPlan)?.label },
                    { label: 'Billing', value: 'Monthly' },
                    { label: 'Leads', value: PLANS.find(p => p.id === selectedPlan)?.maxLeads },
                    { label: 'CRM Slots', value: PLANS.find(p => p.id === selectedPlan)?.crm },
                  ].map(item => (
                    <div key={item.label} className="flex justify-between text-sm"><span className="text-slate-500">{item.label}</span><span className="text-white font-medium">{item.value}</span></div>
                  ))}
                  <div className="pt-2.5 mt-2.5 border-t border-white/5 flex items-center justify-between">
                    <span className="text-sm font-semibold text-white">Total</span>
                    <span className="text-lg font-black text-white">{PLANS.find(p => p.id === selectedPlan)?.price}<span className="text-xs text-slate-500 font-medium">/{PLANS.find(p => p.id === selectedPlan)?.period}</span></span>
                  </div>
                </div>
                <div className="mt-3 p-2.5 rounded-lg bg-emerald-500/5 border border-emerald-500/10 flex items-center gap-1.5">
                  <svg className="w-3 h-3 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                  <span className="text-[10px] text-emerald-300 font-medium">License key emailed after payment</span>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Loading...</div>}>
      <PaymentForm />
    </Suspense>
  );
}
