'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

var API = 'http://localhost:5001/api';

function cn() { var a = []; for (var i = 0; i < arguments.length; i++) { if (arguments[i]) a.push(arguments[i]); } return a.join(' '); }

export default function AdminDashboardPage() {
  var [tab, setTab] = useState('overview');
  var [companyId, setCompanyId] = useState('');
  var [overview, setOverview] = useState(null);
  var [users, setUsers] = useState([]);
  var [trials, setTrials] = useState([]);
  var [licenses, setLicenses] = useState([]);
  var [loading, setLoading] = useState(false);
  var [message, setMessage] = useState('');
  var [token, setToken] = useState('');

  useEffect(function() {
    var t = localStorage.getItem('token');
    var cid = localStorage.getItem('companyId');
    setToken(t || '');
    setCompanyId(cid || '');
  }, []);

  function getToken() { return token || localStorage.getItem('token') || ''; }

  async function fetchOverview() {
    if (!companyId) return;
    setLoading(true);
    try {
      var resp = await fetch(API + '/admin/overview?companyId=' + companyId, { headers: { 'Authorization': 'Bearer ' + getToken() } });
      if (resp.ok) setOverview(await resp.json());
    } catch (e) { console.error(e); }
    setLoading(false);
  }

  async function fetchUsers() {
    setLoading(true);
    try {
      var resp = await fetch(API + '/admin/users?companyId=' + companyId, { headers: { 'Authorization': 'Bearer ' + getToken() } });
      if (resp.ok) setUsers(await resp.json());
    } catch (e) { console.error(e); }
    setLoading(false);
  }

  async function fetchTrials() {
    setLoading(true);
    try {
      var resp = await fetch(API + '/admin/trials', { headers: { 'Authorization': 'Bearer ' + getToken() } });
      if (resp.ok) setTrials(await resp.json());
    } catch (e) { console.error(e); }
    setLoading(false);
  }

  async function fetchLicenses() {
    setLoading(true);
    try {
      var resp = await fetch(API + '/admin/licenses', { headers: { 'Authorization': 'Bearer ' + getToken() } });
      if (resp.ok) setLicenses(await resp.json());
    } catch (e) { console.error(e); }
    setLoading(false);
  }

  async function toggleActive(id, isActive) {
    try {
      var resp = await fetch(API + '/admin/users/' + id + '/toggle-active', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + getToken() },
        body: JSON.stringify({ isActive: !isActive }),
      });
      if (resp.ok) { setMessage('User updated'); fetchUsers(); } else { setMessage('Failed to update'); }
    } catch (e) { setMessage('Network error'); }
  }

  async function changeRole(id, role) {
    try {
      var resp = await fetch(API + '/admin/users/' + id + '/role', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + getToken() },
        body: JSON.stringify({ role }),
      });
      if (resp.ok) { setMessage('Role updated'); fetchUsers(); } else { setMessage('Failed'); }
    } catch (e) { setMessage('Network error'); }
  }

  async function extendTrial(id) {
    try {
      var resp = await fetch(API + '/admin/users/' + id + '/trial-extend', {
        method: 'PATCH',
        headers: { 'Authorization': 'Bearer ' + getToken() },
      });
      if (resp.ok) { setMessage('Trial extended'); fetchTrials(); } else { setMessage('Failed'); }
    } catch (e) { setMessage('Network error'); }
  }

  async function deleteUser(id) {
    if (!confirm('Delete this user? This cannot be undone.')) return;
    try {
      var resp = await fetch(API + '/admin/users/' + id, {
        method: 'DELETE',
        headers: { 'Authorization': 'Bearer ' + getToken() },
      });
      if (resp.ok) { setMessage('User deleted'); fetchUsers(); fetchTrials(); } else { setMessage('Failed'); }
    } catch (e) { setMessage('Network error'); }
  }

  async function revokeLicense(id) {
    if (!confirm('Revoke this license? User will lose premium access.')) return;
    try {
      var resp = await fetch(API + '/admin/licenses/' + id + '/revoke', {
        method: 'PATCH',
        headers: { 'Authorization': 'Bearer ' + getToken() },
      });
      if (resp.ok) { setMessage('License revoked'); fetchLicenses(); } else { setMessage('Failed'); }
    } catch (e) { setMessage('Network error'); }
  }

  async function extendLicense(id) {
    try {
      var resp = await fetch(API + '/admin/licenses/' + id + '/extend', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + getToken() },
        body: JSON.stringify({ days: 30 }),
      });
      if (resp.ok) { setMessage('License extended 30 days'); fetchLicenses(); } else { setMessage('Failed'); }
    } catch (e) { setMessage('Network error'); }
  }

  useEffect(function() { if (tab === 'overview' && companyId) fetchOverview(); }, [tab, companyId]);
  useEffect(function() { if (tab === 'users' && companyId) fetchUsers(); }, [tab, companyId]);
  useEffect(function() { if (tab === 'trials') fetchTrials(); }, [tab]);
  useEffect(function() { if (tab === 'licenses') fetchLicenses(); }, [tab]);

  var TABS = [
    { key: 'overview', label: 'Overview' },
    { key: 'users', label: 'Users' },
    { key: 'trials', label: 'Trials' },
    { key: 'licenses', label: 'Licenses' },
  ];

  function formatDate(d) {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  return (
    <div className="min-h-screen bg-[#030712] text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-xs text-gray-500 mt-0.5">Manage users, trials, and licenses</p>
          </div>
          <a href="/dashboard"
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white border border-white/10 hover:border-white/20 px-4 py-2 rounded-xl transition-all duration-200">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
            Back to Dashboard
          </a>
        </div>

        {message && (
          <div className={'flex items-center gap-2 px-4 py-3 rounded-xl text-sm mb-6 border '+(message.includes('Failed')||message.includes('Network')||message.includes('deleted')?'bg-red-500/10 border-red-500/20 text-red-300':'bg-emerald-500/10 border-emerald-500/20 text-emerald-300')}>
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={message.includes('Failed')||message.includes('Network')||message.includes('deleted')?'M6 18L18 6M6 6l12 12':'M5 13l4 4L19 7'}></path></svg>
            <span>{message}</span>
            <button onClick={function(){setMessage('')}} className="ml-auto text-current opacity-60 hover:opacity-100"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>
          </div>
        )}

        <div className="flex gap-2 mb-6 flex-wrap">
          {TABS.map(function(t) {
            var active = tab === t.key;
            return (
              <button key={t.key} onClick={function() { setTab(t.key); }}
                className={cn('px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 border',
                  active ? 'bg-violet-500/10 border-violet-500/30 text-white' : 'bg-white/[0.02] border-transparent text-gray-400 hover:text-white hover:border-white/10')}>
                {t.label}
              </button>
            );
          })}
        </div>

        {loading && <p className="text-gray-400 text-sm">Loading...</p>}

        {tab === 'overview' && (
          <div>
            {overview ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Users', value: overview.totalUsers, color: '#6366f1' },
                  { label: 'Leads', value: overview.totalLeads, color: '#06b6d4' },
                  { label: 'Accepted', value: overview.totalAccepted, color: '#10b981' },
                  { label: 'Active Reps', value: overview.activeReps, color: '#f59e0b' },
                ].map(function(s, i) {
                  return (
                    <div key={i} className="bg-[#0B0F19]/80 border border-white/[0.04] rounded-xl p-5">
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{s.label}</p>
                      <p className="text-3xl font-bold" style={{ color: s.color }}>{s.value}</p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <button onClick={fetchOverview} className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm">Load Overview</button>
            )}
          </div>
        )}

        {tab === 'users' && (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <button onClick={fetchUsers} className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm">Refresh</button>
            </div>
            <div className="bg-[#0B0F19]/60 border border-white/[0.04] rounded-xl overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/[0.04] bg-white/[0.02]">
                    <th className="px-4 py-3 text-gray-400 font-medium">Name</th>
                    <th className="px-4 py-3 text-gray-400 font-medium">Email</th>
                    <th className="px-4 py-3 text-gray-400 font-medium">Role</th>
                    <th className="px-4 py-3 text-gray-400 font-medium">Active</th>
                    <th className="px-4 py-3 text-gray-400 font-medium">Tier</th>
                    <th className="px-4 py-3 text-gray-400 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(function(u) {
                    return (
                      <tr key={u.id} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                        <td className="px-4 py-3 text-white">{u.fullName}</td>
                        <td className="px-4 py-3 text-gray-400">{u.email}</td>
                        <td className="px-4 py-3">
                          <select value={u.role} onChange={function(e) { changeRole(u.id, e.target.value); }}
                            className="bg-transparent text-sm text-gray-300 border border-white/10 rounded px-2 py-1">
                            <option value="USER">USER</option>
                            <option value="REP">REP</option>
                            <option value="MANAGER">MANAGER</option>
                            <option value="ADMIN">ADMIN</option>
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          <button onClick={function() { toggleActive(u.id, u.isActive); }}
                            className={cn('px-2 py-1 rounded text-xs font-medium', u.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400')}>
                            {u.isActive ? 'Active' : 'Inactive'}
                          </button>
                        </td>
                        <td className="px-4 py-3 text-gray-400 text-xs">{u.subscriptionTier || '—'}</td>
                        <td className="px-4 py-3">
                          <button onClick={function() { deleteUser(u.id); }} className="text-red-400 hover:text-red-300 text-xs">Delete</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'trials' && (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <button onClick={fetchTrials} className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm">Refresh</button>
            </div>
            <div className="bg-[#0B0F19]/60 border border-white/[0.04] rounded-xl overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/[0.04] bg-white/[0.02]">
                    <th className="px-4 py-3 text-gray-400 font-medium">Name</th>
                    <th className="px-4 py-3 text-gray-400 font-medium">Email</th>
                    <th className="px-4 py-3 text-gray-400 font-medium">Company</th>
                    <th className="px-4 py-3 text-gray-400 font-medium">Created</th>
                    <th className="px-4 py-3 text-gray-400 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {trials.map(function(u) {
                    return (
                      <tr key={u.id} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                        <td className="px-4 py-3 text-white">{u.fullName}</td>
                        <td className="px-4 py-3 text-gray-400">{u.email}</td>
                        <td className="px-4 py-3 text-gray-400">{u.companyName}</td>
                        <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(u.createdAt)}</td>
                        <td className="px-4 py-3 flex gap-2">
                          <button onClick={function() { extendTrial(u.id); }} className="bg-emerald-600 hover:bg-emerald-700 px-3 py-1 rounded text-xs font-medium text-white">Activate</button>
                          <button onClick={function() { deleteUser(u.id); }} className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-xs font-medium text-white">Delete</button>
                        </td>
                      </tr>
                    );
                  })}
                  {trials.length === 0 && (
                    <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">No trial users found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'licenses' && (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <button onClick={fetchLicenses} className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm">Refresh</button>
            </div>
            <div className="bg-[#0B0F19]/60 border border-white/[0.04] rounded-xl overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/[0.04] bg-white/[0.02]">
                    <th className="px-4 py-3 text-gray-400 font-medium">License Key</th>
                    <th className="px-4 py-3 text-gray-400 font-medium">Email</th>
                    <th className="px-4 py-3 text-gray-400 font-medium">Plan</th>
                    <th className="px-4 py-3 text-gray-400 font-medium">Status</th>
                    <th className="px-4 py-3 text-gray-400 font-medium">Activated</th>
                    <th className="px-4 py-3 text-gray-400 font-medium">Expires</th>
                    <th className="px-4 py-3 text-gray-400 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {licenses.map(function(l) {
                    var expired = l.expiresAt && new Date(l.expiresAt) < new Date();
                    var expiringSoon = l.expiresAt && !expired && new Date(l.expiresAt) < new Date(Date.now() + 7 * 86400000);
                    return (
                      <tr key={l.id} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                        <td className="px-4 py-3 font-mono text-xs text-blue-300">{l.licenseToken}</td>
                        <td className="px-4 py-3 text-gray-400">{l.issuedToEmail}</td>
                        <td className="px-4 py-3 text-white">{l.plan}</td>
                        <td className="px-4 py-3">
                          <span className={cn('px-2 py-1 rounded text-xs font-medium',
                            l.status === 'ACTIVE' ? (expired ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400') :
                            l.status === 'EXPIRED' ? 'bg-red-500/20 text-red-400' :
                            'bg-gray-500/20 text-gray-400')}>
                            {expired ? 'EXPIRED' : l.status}
                          </span>
                          {expiringSoon && l.status === 'ACTIVE' && (
                            <span className="ml-2 text-[10px] text-amber-400">Expiring soon</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500">{formatDate(l.activatedAt)}</td>
                        <td className={cn('px-4 py-3 text-xs', expired ? 'text-red-400' : expiringSoon ? 'text-amber-400' : 'text-gray-500')}>
                          {formatDate(l.expiresAt)}
                        </td>
                        <td className="px-4 py-3 flex gap-2">
                          {l.status === 'ACTIVE' && !expired && (
                            <>
                              <button onClick={function() { extendLicense(l.id); }} className="bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded text-[10px] font-medium text-white">Extend</button>
                              <button onClick={function() { revokeLicense(l.id); }} className="bg-red-600 hover:bg-red-700 px-2 py-1 rounded text-[10px] font-medium text-white">Revoke</button>
                            </>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {licenses.length === 0 && (
                    <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">No licenses found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
