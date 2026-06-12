'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function AdminPage() {
  const [keys, setKeys] = useState([
    { id: 1, key: 'LA-A7F3-9B2C-4D6E', status: 'Active', expires: '2026-12-31', company: 'Acme Inc.' },
    { id: 2, key: 'LA-B3D8-2E5A-1F9C', status: 'Unused', expires: 'Never', company: '-' },
    { id: 3, key: 'LA-C9E1-7A4B-0D2F', status: 'Expired', expires: '2025-01-01', company: 'OldCo' },
  ]);
  const [search, setSearch] = useState('');
  const [generating, setGenerating] = useState(false);

  const filteredKeys = keys.filter(
    (k) =>
      k.key.toLowerCase().includes(search.toLowerCase()) ||
      k.company.toLowerCase().includes(search.toLowerCase()) ||
      k.status.toLowerCase().includes(search.toLowerCase())
  );

  const generateKey = () => {
    setGenerating(true);
    // Simulate a tiny delay for the loading effect
    setTimeout(() => {
      const newKey = `LA-${Math.random().toString(36).substring(2, 8).toUpperCase()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      setKeys([{ id: Date.now(), key: newKey, status: 'Active', expires: 'Never', company: '-' }, ...keys]);
      setGenerating(false);
    }, 400);
  };

  const revokeKey = (id) => {
    setKeys(keys.filter((k) => k.id !== id));
  };

  // Stats for the top cards
  const totalKeys = keys.length;
  const activeKeys = keys.filter((k) => k.status === 'Active').length;
  const unusedKeys = keys.filter((k) => k.status === 'Unused').length;

  return (
    <div className="min-h-screen bg-[#030711] text-white px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="cursor-pointer flex-shrink-0 relative">
              <div className="absolute -left-2 -top-1 w-10 h-10 rounded-full bg-blue-500/20 blur-md" />
              <img
                src="/leadarrow-logo.png"
                alt="LeadArrow"
                className="relative h-9 w-auto object-contain hover:opacity-90 transition-opacity"
              />
            </Link>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                License Keys
              </h1>
              <p className="text-slate-400 text-sm">Manage access to your platform</p>
            </div>
          </div>
          <button
            onClick={generateKey}
            disabled={generating}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-70"
          >
            {generating ? (
              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" ></path>
              </svg>
            )}
            {generating ? 'Generating...' : 'Generate New Key'}
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          {[
            { label: 'Total Keys', value: totalKeys, color: 'from-blue-500/20 to-blue-600/10' },
            { label: 'Active', value: activeKeys, color: 'from-green-500/20 to-emerald-600/10' },
            { label: 'Unused', value: unusedKeys, color: 'from-amber-500/20 to-yellow-600/10' },
          ].map((stat, idx) => (
            <div key={idx} className={`relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br ${stat.color} p-5 backdrop-blur-sm shadow-xl`}>
              <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full bg-white/5 blur-2xl" />
              <p className="text-sm font-medium text-slate-300">{stat.label}</p>
              <p className="text-4xl font-extrabold text-white mt-1">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Search bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" ></path>
            </svg>
            <input
              type="text"
              placeholder="Search keys, company or status..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm pl-10 pr-4 py-3 text-sm text-white placeholder-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>
        </div>

        {/* Keys Table */}
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  <th className="px-6 py-4 font-semibold text-slate-300 uppercase tracking-wider text-xs">License Key</th>
                  <th className="px-6 py-4 font-semibold text-slate-300 uppercase tracking-wider text-xs">Status</th>
                  <th className="px-6 py-4 font-semibold text-slate-300 uppercase tracking-wider text-xs">Expires</th>
                  <th className="px-6 py-4 font-semibold text-slate-300 uppercase tracking-wider text-xs">Company</th>
                  <th className="px-6 py-4 font-semibold text-slate-300 uppercase tracking-wider text-xs">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredKeys.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                      No license keys found. Click "Generate New Key" to create one.
                    </td>
                  </tr>
                ) : (
                  filteredKeys.map((k) => (
                    <tr key={k.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        <code className="font-mono text-sm text-blue-300 bg-blue-500/10 px-2 py-1 rounded-md">
                          {k.key}
                        </code>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                            k.status === 'Active'
                              ? 'bg-green-500/20 text-green-300 ring-1 ring-green-500/30'
                              : k.status === 'Unused'
                              ? 'bg-blue-500/20 text-blue-300 ring-1 ring-blue-500/30'
                              : 'bg-red-500/20 text-red-300 ring-1 ring-red-500/30'
                          }`}
                        >
                          {k.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-400 text-xs">{k.expires}</td>
                      <td className="px-6 py-4 text-slate-300 text-sm">{k.company}</td>
                      <td className="px-6 py-4">
                        {k.status === 'Active' && (
                          <button
                            onClick={() => revokeKey(k.id)}
                            className="text-xs font-medium text-red-400 hover:text-red-300 transition-colors hover:underline underline-offset-2"
                          >
                            Revoke
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}