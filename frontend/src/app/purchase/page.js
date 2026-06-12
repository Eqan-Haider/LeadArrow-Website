'use client';
import { useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

function PurchaseRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const plan = searchParams.get('plan') || 'starter';

  useEffect(() => {
    router.replace(`/checkout?plan=${plan}&origin=landing`);
  }, [router, plan]);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 mx-auto rounded-full border-4 border-violet-500/20 border-t-violet-500 animate-spin" />
        <p className="mt-4 text-sm text-slate-400">Redirecting to checkout...</p>
      </div>
    </div>
  );
}

export default function PurchasePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Loading...</div>}>
      <PurchaseRedirect />
    </Suspense>
  );
}
