'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { user, loading, login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [step, setStep] = useState('login');

  useEffect(() => {
    if (loading) return;
    if (user) {
      window.location.href = '/dashboard';
    }
  }, [user, loading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setMessage('Please fill all fields.');
      return;
    }

    try {
      const response = await fetch('http://localhost:5001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (response.ok) {
        const token = data.accessToken || data.token;
        const companyId = data.user?.companyId || data.companyId;
        if (companyId) localStorage.setItem('companyId', companyId);
        if (token) {
          login(token);
        }
        setMessage('Login successful! Redirecting...');
        setTimeout(() => { window.location.href = '/dashboard'; }, 1500);
      } else {
        setMessage(data.error || 'Invalid credentials');
      }
    } catch (error) {
      console.error(error);
      setMessage('Network error – please check if backend is running.');
    }
  };

  if (step === 'code_sent') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#030712] px-4">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 text-center max-w-sm w-full">
          <p className="text-blue-200 mb-4">{message}</p>
          <button
            onClick={() => (window.location.href = '/dashboard')}
            className="w-full bg-blue-600 py-3 rounded-lg text-white font-semibold hover:bg-blue-700 transition"
          >
            Continue to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#030712] relative overflow-hidden">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,_rgba(29,78,216,0.15),transparent_70%)]" />
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <Link
        href="/"
        className="absolute top-6 left-6 z-20 flex items-center gap-2 text-sm font-medium text-gray-300 hover:text-white transition bg-white/5 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" ></path>
        </svg>
        Back
      </Link>

      <div className="hidden md:flex md:w-1/2 items-center justify-center p-8 lg:p-12 relative overflow-hidden">
        <div className="relative z-10 w-full max-w-sm ml-16 md:ml-24">
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 mb-8 perspective-[800px] [transform:rotateY(-10deg)_rotateX(6deg)_rotateZ(-2deg)] shadow-[0_25px_60px_-15px_rgba(59,130,246,0.4)] hover:[transform:rotateY(-8deg)_rotateX(4deg)_rotateZ(-1deg)] transition-transform duration-500">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
              <div className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
              <div className="h-2.5 w-2.5 rounded-full bg-green-400" />
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-blue-300 uppercase tracking-wider">Incoming Lead</span>
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-300">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                </span>
                Live
              </span>
            </div>
            <p className="text-lg font-bold text-white">Ravi Sharma</p>
            <p className="text-sm text-gray-300">Source: Facebook Ads • just now</p>
            <div className="flex gap-2 mt-4">
              <button className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-xs font-semibold transition">
                Accept (Press 1)
              </button>
              <button className="flex-1 bg-white/10 hover:bg-white/20 text-white py-2 rounded-lg text-xs font-semibold transition">
                Decline (Press 2)
              </button>
            </div>
          </div>

          <h2 className="text-3xl font-bold text-white mb-4">Speed to Lead, Delivered</h2>

          <ul className="space-y-3 text-sm text-gray-200">
            <li className="flex items-start gap-3">
              <span className="text-blue-400 mt-0.5">⚡</span>
              <span>Instant phone calls & Chrome extension alerts</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-400 mt-0.5">🔄</span>
              <span>Round‑robin & percentage‑based routing</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-400 mt-0.5">📊</span>
              <span>Real‑time manager dashboard & reports</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-400 mt-0.5">🔗</span>
              <span>Seamless CRM integrations (Close, HubSpot, etc.)</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="w-full md:w-1/2 flex items-center justify-center px-6 py-12 perspective-[1200px]">
        <div className="w-full max-w-md">
          <Link href="/" className="block text-center mb-6">
            <span className="text-3xl font-extrabold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              LeadArrow
            </span>
          </Link>

          <div className="[transform:rotateY(4deg)_rotateX(-2deg)_rotateZ(1deg)] shadow-[0_25px_60px_-15px_rgba(59,130,246,0.3)] hover:[transform:rotateY(2deg)_rotateX(-1deg)_rotateZ(0deg)] transition-transform duration-500 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white">Welcome back</h2>
              <p className="text-sm text-gray-400 mt-1">Log in to your account</p>
            </div>

            {message && (
              <p className="text-sm text-center text-red-400 bg-red-400/10 py-2 rounded-lg mb-4">
                {message}
              </p>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-xl bg-white/10 border border-white/20 px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-xl bg-white/10 border border-white/20 px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="text-right -mt-2">
                <Link href="/forgot-password" className="text-xs text-blue-400 hover:underline">Forgot password?</Link>
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-xl text-white font-semibold transition shadow-lg shadow-blue-500/20"
              >
                Log in
              </button>
            </form>

            <p className="text-center text-sm text-gray-400 mt-4">
              Need an account?{' '}
              <Link href="/signup" className="text-blue-400 hover:underline font-medium">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}