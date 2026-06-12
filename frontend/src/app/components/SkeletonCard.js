export function SkeletonCard({ className = '' }) {
  return (
    <div className={`bg-slate-800/30 border border-white/5 rounded-2xl p-5 animate-pulse ${className}`}>
      <div className="h-3 w-20 bg-slate-700/50 rounded mb-3" />
      <div className="h-8 w-16 bg-slate-700/50 rounded mb-2" />
      <div className="h-3 w-32 bg-slate-700/30 rounded" />
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 p-4 animate-pulse">
      <div className="w-10 h-10 rounded-xl bg-slate-700/50" />
      <div className="flex-1 space-y-2">
        <div className="h-3 w-32 bg-slate-700/50 rounded" />
        <div className="h-3 w-20 bg-slate-700/30 rounded" />
      </div>
      <div className="h-6 w-16 bg-slate-700/40 rounded-full" />
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-slate-950 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="h-10 w-44 bg-slate-800/50 rounded-xl animate-pulse" />
          <div className="flex gap-2">
            <div className="h-10 w-24 bg-slate-800/50 rounded-xl animate-pulse" />
            <div className="h-10 w-24 bg-slate-800/50 rounded-xl animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[0,1,2,3].map(i => <SkeletonCard key={i} />)}
        </div>
        <div className="h-64 bg-slate-800/30 border border-white/5 rounded-2xl animate-pulse" />
      </div>
    </div>
  );
}
