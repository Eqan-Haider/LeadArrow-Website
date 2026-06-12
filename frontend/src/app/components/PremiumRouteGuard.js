'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

export default function PremiumRouteGuard({ children, fallback = '/dashboard' }) {
  const router = useRouter();
  const { isPremium, loading } = useAuth();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!isPremium) {
        router.replace(fallback);
      } else {
        setChecked(true);
      }
    }
  }, [isPremium, loading, router, fallback]);

  if (loading || !checked) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full border-4 border-violet-500/20 border-t-violet-500 animate-spin" />
          <p className="text-sm text-slate-400">Verifying access...</p>
        </div>
      </div>
    );
  }

  return children;
}
