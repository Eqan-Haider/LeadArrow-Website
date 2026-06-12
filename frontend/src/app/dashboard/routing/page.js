'use client';
import { useState, useEffect } from 'react';

var API = 'http://localhost:5001/api';

function cn() { var a = []; for (var i = 0; i < arguments.length; i++) { if (arguments[i]) a.push(arguments[i]); } return a.join(' '); }

export default function RoutingSettingsPage() {
  var [companyId, setCompanyId] = useState('');
  var [reps, setReps] = useState([]);
  var [percentages, setPercentages] = useState({});
  var [routingMethod, setRoutingMethod] = useState('ROUND_ROBIN');
  var [message, setMessage] = useState('');
  var [loading, setLoading] = useState(false);

  function getToken() { return localStorage.getItem('token') || ''; }

  useEffect(function() {
    var cid = localStorage.getItem('companyId');
    setCompanyId(cid || '');
  }, []);

  useEffect(function() {
    if (!companyId) return;
    fetch(API + '/reps?companyId=' + companyId, {
      headers: { 'Authorization': 'Bearer ' + getToken() },
    }).then(function(r) { return r.json(); }).then(function(d) {
      if (Array.isArray(d)) setReps(d);
    }).catch(function() {});
  }, [companyId]);

  useEffect(function() {
    if (!companyId) return;
    fetch(API + '/admin/routing-percentages/' + companyId, {
      headers: { 'Authorization': 'Bearer ' + getToken() },
    }).then(function(r) { return r.json(); }).then(function(d) {
      if (Array.isArray(d)) {
        var map = {};
        d.forEach(function(p) { map[p.userId] = p.percentage; });
        setPercentages(map);
      }
    }).catch(function() {});
  }, [companyId]);

  function setPct(userId, val) {
    var n = parseInt(val) || 0;
    if (n < 0) n = 0;
    if (n > 100) n = 100;
    setPercentages(function(prev) { return { ...prev, [userId]: n }; });
  }

  var totalPct = Object.values(percentages).reduce(function(s, v) { return s + (v || 0); }, 0);

  async function saveRouting() {
    setLoading(true);
    setMessage('');
    var pctArray = reps.filter(function(r) { return (percentages[r.id] || 0) > 0; }).map(function(r) {
      return { userId: r.id, percentage: percentages[r.id] || 0 };
    });
    try {
      var resp = await fetch(API + '/admin/routing-percentages/' + companyId, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + getToken() },
        body: JSON.stringify({ percentages: pctArray }),
      });
      if (resp.ok) {
        var wsResp = await fetch(API + '/admin/workspace-settings/' + companyId, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + getToken() },
          body: JSON.stringify({ routingRule: routingMethod }),
        });
        if (wsResp.ok) setMessage('Routing settings saved');
        else setMessage('Saved percentages but failed to save routing method');
      } else {
        var d = await resp.json();
        setMessage(d.error || 'Failed to save');
      }
    } catch (e) { setMessage('Network error'); }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-[#030712] text-white p-6">
      <div className="max-w-xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Routing Settings</h1>
          <a href="/dashboard" className="flex items-center gap-2 text-sm text-gray-400 hover:text-white border border-white/10 px-4 py-2 rounded-xl transition-all duration-200">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
            Back
          </a>
        </div>

        {message && (
          <div className={cn('px-4 py-2 rounded-lg text-sm mb-4', message.includes('saved') ? 'bg-emerald-500/10 text-emerald-300' : 'bg-red-500/10 text-red-300')}>
            {message}
          </div>
        )}

        <div className="bg-[#0B0F19]/80 border border-white/[0.04] rounded-xl p-6 space-y-5">
          <div>
            <label className="block text-xs text-gray-400 uppercase tracking-wider mb-2">Routing Method</label>
            <div className="flex gap-2">
              {['ROUND_ROBIN', 'PERCENTAGE', 'FIRST_AVAILABLE'].map(function(m) {
                return (
                  <button key={m} onClick={function() { setRoutingMethod(m); }}
                    className={cn('px-4 py-2 rounded-lg text-sm font-medium transition', routingMethod === m ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10')}>
                    {m === 'ROUND_ROBIN' ? 'Round Robin' : m === 'PERCENTAGE' ? 'Percentage' : 'First Available'}
                  </button>
                );
              })}
            </div>
          </div>

          {routingMethod === 'PERCENTAGE' && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs text-gray-400 uppercase tracking-wider">Rep Allocation</label>
                <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', totalPct === 100 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400')}>
                  Total: {totalPct}%
                </span>
              </div>
              <div className="space-y-3">
                {reps.map(function(r) {
                  return (
                    <div key={r.id} className="flex items-center gap-3">
                      <span className="text-sm text-gray-300 w-36 truncate">{r.fullName || r.name}</span>
                      <input type="range" min="0" max="100" step="5" value={percentages[r.id] || 0}
                        onChange={function(e) { setPct(r.id, e.target.value); }}
                        className="flex-1 h-2 rounded-lg appearance-none cursor-pointer bg-white/10 accent-blue-500" />
                      <input type="number" min="0" max="100" value={percentages[r.id] || 0}
                        onChange={function(e) { setPct(r.id, e.target.value); }}
                        className="w-16 rounded-lg bg-white/10 border border-white/20 px-2 py-1.5 text-sm text-white text-center focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      <span className="text-xs text-gray-500 w-6">%</span>
                    </div>
                  );
                })}
                {reps.length === 0 && <p className="text-gray-500 text-sm">No reps found for this company.</p>}
              </div>
            </div>
          )}

          <button onClick={saveRouting} disabled={loading || !companyId}
            className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50 py-3 rounded-xl text-white font-semibold transition-all duration-200 shadow-[0_4px_20px_rgba(99,68,227,0.25)]">
            {loading ? 'Saving...' : 'Save Routing Settings'}
          </button>
        </div>
      </div>
    </div>
  );
}
