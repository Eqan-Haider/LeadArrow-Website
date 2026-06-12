'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) { setError('Email is required'); return; }
    setError('');
    try {
      const resp = await fetch('http://localhost:5001/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      await resp.json();
      setSubmitted(true);
    } catch (err) {
      setError('Network error – please try again.');
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#030712] px-4">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 text-center max-w-md w-full">
          <div className="w-14 h-14 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"></path></svg>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Check Your Email</h2>
          <p className="text-gray-400 text-sm mb-6">If an account exists for <span className="text-blue-300">{email}</span>, a reset link and code have been sent.</p>
          <Link href="/login" className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-semibold transition shadow-lg shadow-blue-500/20">Back to Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#030712] px-4">
      <div className="w-full max-w-md">
        <Link href="/login" className="flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-6 transition">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"></path></svg>
          Back to Login
        </Link>
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-white mb-2">Reset Password</h2>
          <p className="text-sm text-gray-400 mb-6">Enter your email and we'll send you a reset code and link.</p>
          {error && <p className="text-sm text-red-400 bg-red-400/10 py-2 px-3 rounded-lg mb-4">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full rounded-xl bg-white/10 border border-white/20 px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-xl text-white font-semibold transition shadow-lg shadow-blue-500/20">Send Reset Link</button>
          </form>
        </div>
      </div>
    </div>
  );
}