'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import InternationalPhoneInput from '../components/InternationalPhoneInput';

export default function SignupPage() {
  const { login: authLogin } = useAuth();
  const [form, setForm] = useState({
    companyName: '',
    fullName: '',
    email: '',
    password: '',
    phoneNumber: '',
  });
  const [dialCode, setDialCode] = useState('');
  const [acceptedTcpa, setAcceptedTcpa] = useState(false);
  const [acceptedSms, setAcceptedSms] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  function handlePhoneChange(v){setDialCode(v);setForm(function(prev){return{...prev,phoneNumber:v}})}

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    if (!form.companyName.trim() || !form.fullName.trim() || !form.email.trim() || !form.password.trim()) {
      setMessage('Please fill all required fields.');
      return;
    }

    if (form.password.length < 6) {
      setMessage('Password must be at least 6 characters.');
      return;
    }

    const fullPhone = dialCode||form.phoneNumber;

    if (!acceptedTcpa) {
      setMessage('You must accept the TCPA/GDPR consent to create an account.');
      return;
    }

    if (!acceptedSms) {
      setMessage('You must consent to SMS notifications to create an account.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:5001/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: form.companyName.trim(),
          fullName: form.fullName.trim(),
          email: form.email.trim().toLowerCase(),
          password: form.password,
          phoneNumber: fullPhone,
          tcpaConsent: true,
          tcpaConsentedAt: new Date().toISOString(),
          smsConsent: true,
          smsConsentedAt: new Date().toISOString(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const token = data.accessToken || data.token;
        const companyId = data.user?.companyId;
        if (companyId) localStorage.setItem('companyId', companyId);
        if (token) authLogin(token);
        setMessage('Account created! Redirecting to dashboard...');
        setTimeout(() => { window.location.href = '/dashboard'; }, 1500);
      } else {
        setMessage(data.error || data.message || 'Signup failed. Please try again.');
      }
    } catch (err) {
      setMessage('Network error – please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#030712] relative overflow-hidden">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,_rgba(29,78,216,0.15),transparent_70%)]" />
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <Link href="/" className="absolute top-6 left-6 z-20 flex items-center gap-2 text-sm font-medium text-gray-300 hover:text-white transition bg-white/5 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" ></path></svg>
        Back
      </Link>

      <div className="hidden md:flex md:w-1/2 items-center justify-center p-8 lg:p-12 relative overflow-hidden">
        <div className="relative z-10 w-full max-w-sm ml-16 md:ml-24">
          <motion.div initial={{ opacity: 0, rotateY: 10 }} animate={{ opacity: 1, rotateY: 0 }} transition={{ duration: 0.7 }}
            className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 mb-8 shadow-[0_25px_60px_-15px_rgba(59,130,246,0.4)]"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
              <div className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
              <div className="h-2.5 w-2.5 rounded-full bg-green-400" />
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-blue-300 uppercase tracking-wider">Incoming Lead</span>
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-300">
                <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" /><span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" /></span>
                Live
              </span>
            </div>
            <p className="text-lg font-bold text-white">Priya Patel</p>
            <p className="text-sm text-gray-300">Source: LinkedIn Ad • just now</p>
            <div className="flex gap-2 mt-4">
              <button className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-xs font-semibold transition">Accept (Press 1)</button>
              <button className="flex-1 bg-white/10 hover:bg-white/20 text-white py-2 rounded-lg text-xs font-semibold transition">Decline (Press 2)</button>
            </div>
          </motion.div>

          <h2 className="text-3xl font-bold text-white mb-4">Speed to Lead, Delivered</h2>
          <ul className="space-y-3 text-sm text-gray-200">
            <li className="flex items-start gap-3"><span className="text-blue-400 mt-0.5">⚡</span><span>Instant phone calls & Chrome extension alerts</span></li>
            <li className="flex items-start gap-3"><span className="text-blue-400 mt-0.5">🔄</span><span>Round‑robin & percentage‑based routing</span></li>
            <li className="flex items-start gap-3"><span className="text-blue-400 mt-0.5">📊</span><span>Real‑time manager dashboard & reports</span></li>
            <li className="flex items-start gap-3"><span className="text-blue-400 mt-0.5">🔗</span><span>Seamless CRM integrations (Close, HubSpot, etc.)</span></li>
          </ul>
        </div>
      </div>

      <div className="w-full md:w-1/2 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <Link href="/" className="block text-center mb-6">
            <span className="text-3xl font-extrabold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">LeadArrow</span>
          </Link>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8"
          >
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white">Create your account</h2>
              <p className="text-sm text-gray-400 mt-1">Start your free trial</p>
            </div>

            <AnimatePresence>
              {message && (
                <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className={`text-sm text-center py-2 rounded-lg mb-4 ${message.includes('created') || message.includes('successfully') ? 'bg-green-400/10 text-green-400' : 'bg-red-400/10 text-red-400'}`}
                >{message}</motion.p>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input name="companyName" placeholder="Company Name *" value={form.companyName} onChange={handleChange} required
                className="w-full rounded-xl bg-white/10 border border-white/20 px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
              <input name="fullName" placeholder="Full Name *" value={form.fullName} onChange={handleChange} required
                className="w-full rounded-xl bg-white/10 border border-white/20 px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
              <input name="email" type="email" placeholder="Email *" value={form.email} onChange={handleChange} required
                className="w-full rounded-xl bg-white/10 border border-white/20 px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />

              <InternationalPhoneInput value={dialCode} onChange={handlePhoneChange} isPremium={true} disabled={false} label='Phone Number (optional)'/>

              <input name="password" type="password" placeholder="Password (min 6 characters) *" value={form.password} onChange={handleChange} required
                className="w-full rounded-xl bg-white/10 border border-white/20 px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />

              <motion.label whileTap={{ scale: 0.98 }}
                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${acceptedTcpa ? 'border-blue-500/40 bg-blue-500/5' : 'border-white/10 hover:border-white/20'}`}
              >
                <input type="checkbox" checked={acceptedTcpa} onChange={e => setAcceptedTcpa(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-gray-500 text-blue-600 focus:ring-blue-500 cursor-pointer" />
                <span className="text-xs text-gray-300 leading-relaxed">
                  I explicitly agree to receive automated notification updates, operational alerts, and communications from LeadArrow at the contact number provided. Consent is not a condition of purchase.
                </span>
              </motion.label>

              <motion.label whileTap={{ scale: 0.98 }}
                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${acceptedSms ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-white/10 hover:border-white/20'}`}
              >
                <input type="checkbox" checked={acceptedSms} onChange={e => setAcceptedSms(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-gray-500 text-emerald-600 focus:ring-emerald-500 cursor-pointer" />
                <span className="text-xs text-gray-300 leading-relaxed">
                  I explicitly agree to receive automated notification updates, operational alerts, and communications from LeadArrow at the contact number provided. Consent is not a condition of purchase.
                </span>
              </motion.label>

              <button type="submit" disabled={loading || !acceptedTcpa || !acceptedSms}
                className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-xl text-white font-semibold transition shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >{loading ? 'Creating account...' : 'Sign up'}</button>
            </form>

            <p className="text-center text-sm text-gray-400 mt-4">
              Already have an account?{' '}<Link href="/login" className="text-blue-400 hover:underline font-medium">Log in</Link>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
