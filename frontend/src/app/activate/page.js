'use client';
import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function ActivateContent() {
  const searchParams = useSearchParams();
  const plan = searchParams.get('plan') || 'starter'; // default
  const [licenseKey, setLicenseKey] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!licenseKey.trim()) {
      setMessage('Please enter a license key.');
      return;
    }
    // Simulated activation
    setMessage('License key accepted! Your plan is now active. (Backend will verify)');
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative">
      <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 text-sm text-gray-400 hover:text-white transition">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" ></path></svg>
        Back
      </Link>

      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-md shadow-2xl">
        <div className="flex justify-center mb-6">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" ></path>
            </svg>
          </div>
        </div>
        <h2 className="text-2xl font-bold text-white text-center mb-2">Activate Your Plan</h2>
        <p className="text-sm text-gray-400 text-center mb-2">
          You are activating the <span className="capitalize font-semibold text-white">{plan}</span> plan.
        </p>
        <p className="text-xs text-gray-500 text-center mb-6">
          After purchase, you will receive a license key via email. Enter it below to unlock full features.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="License Key (e.g., LA-XXXX-XXXX-XXXX)"
            value={licenseKey}
            onChange={(e) => setLicenseKey(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
            required
          />
          <button
            type="submit"
            className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 py-3 font-semibold text-white hover:from-blue-700 hover:to-indigo-700 transition shadow-lg"
          >
            Activate
          </button>
        </form>

        {message && (
          <p className="mt-4 text-center text-sm text-blue-300">{message}</p>
        )}
      </div>
    </div>
  );
}

export default function ActivatePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-400">Loading...</div>}>
      <ActivateContent />
    </Suspense>
  );
}