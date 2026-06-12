'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    var params = new URLSearchParams(window.location.search);
    var t = params.get('token') || '';
    var e = params.get('email') || '';
    setToken(t);
    setEmail(e);
  }, []);

  var handleSubmit = async function(e) {
    e.preventDefault();
    if (!email) { setError('Email is required'); return; }
    if (!code && !token) { setError('Reset code is required'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (password !== confirm) { setError('Passwords do not match'); return; }
    setError('');
    setMessage('Resetting password...');
    try {
      var resp = await fetch('http://localhost:5001/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, code: code || undefined, token: token || undefined, newPassword: password }),
      });
      var data = await resp.json();
      if (resp.ok) {
        setSuccess(true);
        setMessage(data.message || 'Password reset successful!');
      } else {
        setError(data.error || 'Reset failed');
      }
    } catch (err) {
      setError('Network error – please try again.');
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#030712] px-4">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 text-center max-w-md w-full">
          <div className="w-14 h-14 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"></path></svg>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Password Reset Successful</h2>
          <p className="text-gray-400 text-sm mb-6">You can now log in with your new password.</p>
          <Link href="/login" className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-semibold transition shadow-lg shadow-blue-500/20">Log In</Link>
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
          <h2 className="text-2xl font-bold text-white mb-2">Set New Password</h2>
          <p className="text-sm text-gray-400 mb-6">Enter the reset code from your email and choose a new password.</p>
          {(error || message) && (
            <p className={'text-sm py-2 px-3 rounded-lg mb-4 ' + (error ? 'text-red-400 bg-red-400/10' : 'text-emerald-400 bg-emerald-400/10')}>
              {error || message}
            </p>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="email" placeholder="Email address" value={email} onChange={function(e){setEmail(e.target.value)}} required className="w-full rounded-xl bg-white/10 border border-white/20 px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <input type="text" placeholder="Reset code (from email)" value={code} onChange={function(e){setCode(e.target.value)}} className="w-full rounded-xl bg-white/10 border border-white/20 px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <input type="password" placeholder="New password (min 6 chars)" value={password} onChange={function(e){setPassword(e.target.value)}} required className="w-full rounded-xl bg-white/10 border border-white/20 px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <input type="password" placeholder="Confirm new password" value={confirm} onChange={function(e){setConfirm(e.target.value)}} required className="w-full rounded-xl bg-white/10 border border-white/20 px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-xl text-white font-semibold transition shadow-lg shadow-blue-500/20">Reset Password</button>
          </form>
        </div>
      </div>
    </div>
  );
}
