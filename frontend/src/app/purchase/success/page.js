'use client';
import { useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [status, setStatus] = useState('loading'); // 'loading', 'verified', 'error'

  useEffect(() => {
    if (!sessionId) {
      setStatus('error');
      return;
    }
    (async () => {
      try {
        const res = await fetch(`http://localhost:5001/api/purchase/success?session_id=${sessionId}`);
        if (res.ok) {
          setStatus('verified');
        } else {
          setStatus('error');
        }
      } catch (err) {
        setStatus('error');
      }
    })();
  }, [sessionId]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="animate-pulse text-white text-lg">Verifying your payment...</div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-center text-white">
          <p className="text-xl">Payment verification failed.</p>
          <Link href="/pricing" className="text-blue-400 underline mt-4 inline-block">Try again</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-center shadow-2xl">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/20 border border-green-500/30 mb-6">
          <svg className="w-10 h-10 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" ></path>
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-white mb-3">Payment Successful!</h2>
        <p className="text-slate-400 mb-6">
          Your plan has been activated. A license key has been sent to your email. Please check your inbox.
        </p>
        <Link
          href="/dashboard"
          className="inline-block w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3 text-sm font-semibold text-white shadow-lg hover:from-blue-500 hover:to-indigo-500 transition"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">Loading...</div>}>
      <SuccessContent />
    </Suspense>
  );
}