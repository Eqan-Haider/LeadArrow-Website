'use client';
import Link from 'next/link';
import { useState } from 'react';

export default function RequestKeyPage() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', company: '', message: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    // In real app, send this data to backend / email
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 rounded-full bg-green-500/20 flex items-center justify-center mb-4">
            <svg className="h-8 w-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" ></path></svg>
          </div>
          <h2 className="text-2xl font-bold text-white">Request Submitted!</h2>
          <p className="mt-2 text-gray-400">We will email you a license key shortly.</p>
          <Link href="/" className="mt-6 inline-block text-blue-400 hover:underline">Return to Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative">
      <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 text-sm text-gray-400 hover:text-white transition">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" ></path></svg>
        Back
      </Link>
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-md shadow-2xl">
        <h2 className="text-2xl font-bold text-white mb-6">Request a License Key</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input name="name" placeholder="Your Name" onChange={(e) => setForm({ ...form, name: e.target.value })} required className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500" />
          <input name="email" type="email" placeholder="Work Email" onChange={(e) => setForm({ ...form, email: e.target.value })} required className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500" />
          <input name="company" placeholder="Company Name" onChange={(e) => setForm({ ...form, company: e.target.value })} required className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500" />
          <textarea name="message" placeholder="Tell us about your team (optional)" onChange={(e) => setForm({ ...form, message: e.target.value })} className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 h-24" />
          <button type="submit" className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 py-3 font-semibold text-white hover:from-blue-700 hover:to-indigo-700 transition shadow-lg">
            Submit Request
          </button>
        </form>
      </div>
    </div>
  );
}