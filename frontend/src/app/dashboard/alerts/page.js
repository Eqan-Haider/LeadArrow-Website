'use client';
import { useState, useEffect } from 'react';

var API = 'http://localhost:5001/api';

function cn() { var a = []; for (var i = 0; i < arguments.length; i++) { if (arguments[i]) a.push(arguments[i]); } return a.join(' '); }

var METRIC_OPTIONS = [
  { value: 'response_time', label: 'Avg Response Time' },
  { value: 'missed_leads', label: 'Missed Leads (per hour)' },
  { value: 'connection_rate', label: 'Connection Rate' },
  { value: 'lead_volume', label: 'Lead Volume' },
];

var OPERATOR_OPTIONS = [
  { value: 'gt', label: '>' },
  { value: 'gte', label: '>=' },
  { value: 'lt', label: '<' },
  { value: 'lte', label: '<=' },
  { value: 'eq', label: '=' },
];

export default function AlertThresholdsPage() {
  var [companyId, setCompanyId] = useState('');
  var [thresholds, setThresholds] = useState([]);
  var [loading, setLoading] = useState(false);
  var [message, setMessage] = useState('');
  var [showForm, setShowForm] = useState(false);
  var [formMetric, setFormMetric] = useState('response_time');
  var [formOperator, setFormOperator] = useState('gt');
  var [formValue, setFormValue] = useState('');
  var [formEnabled, setFormEnabled] = useState(true);
  var [editId, setEditId] = useState(null);

  function getToken() { return localStorage.getItem('token') || ''; }

  useEffect(function() {
    var cid = localStorage.getItem('companyId');
    setCompanyId(cid || '');
  }, []);

  useEffect(function() {
    if (!companyId) return;
    fetchThresholds();
  }, [companyId]);

  async function fetchThresholds() {
    setLoading(true);
    try {
      var resp = await fetch(API + '/alert-thresholds/' + companyId, {
        headers: { 'Authorization': 'Bearer ' + getToken() },
      });
      if (resp.ok) setThresholds(await resp.json());
    } catch (e) { console.error(e); }
    setLoading(false);
  }

  function resetForm() {
    setFormMetric('response_time');
    setFormOperator('gt');
    setFormValue('');
    setFormEnabled(true);
    setEditId(null);
    setShowForm(false);
  }

  function editThreshold(t) {
    setEditId(t.id);
    setFormMetric(t.metric);
    setFormOperator(t.operator);
    setFormValue(String(t.value));
    setFormEnabled(t.enabled);
    setShowForm(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!formValue) { setMessage('Value is required'); return; }
    setMessage('');
    var body = { metric: formMetric, operator: formOperator, value: parseFloat(formValue), enabled: formEnabled };
    try {
      var url = editId ? API + '/alert-thresholds/' + editId : API + '/alert-thresholds/' + companyId;
      var method = editId ? 'PUT' : 'POST';
      var resp = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + getToken() },
        body: JSON.stringify(body),
      });
      if (resp.ok) { setMessage(editId ? 'Threshold updated' : 'Threshold created'); resetForm(); fetchThresholds(); }
      else setMessage('Failed to save');
    } catch (e) { setMessage('Network error'); }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this threshold?')) return;
    try {
      var resp = await fetch(API + '/alert-thresholds/' + id, {
        method: 'DELETE',
        headers: { 'Authorization': 'Bearer ' + getToken() },
      });
      if (resp.ok) { setMessage('Threshold deleted'); fetchThresholds(); }
      else setMessage('Failed to delete');
    } catch (e) { setMessage('Network error'); }
  }

  function getMetricLabel(m) { var o = METRIC_OPTIONS.find(function(x) { return x.value === m; }); return o ? o.label : m; }
  function getOperatorLabel(m) { var o = OPERATOR_OPTIONS.find(function(x) { return x.value === m; }); return o ? o.label : m; }

  return (
    <div className="min-h-screen bg-[#030712] text-white p-6">
      <div className="max-w-xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <a href="/dashboard" className="flex items-center gap-1 text-sm text-gray-400 hover:text-white border border-white/10 px-3 py-1.5 rounded-xl transition-all duration-200">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
            </a>
            <h1 className="text-2xl font-bold">Alert Thresholds</h1>
          </div>
          <button onClick={function() { resetForm(); setShowForm(true); }}
            className="flex items-center gap-1 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 shadow-[0_4px_15px_rgba(99,68,227,0.25)]">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
            Add Threshold
          </button>
        </div>

        {message && (
          <div className={cn('px-4 py-2 rounded-lg text-sm mb-4', message.includes('deleted') || message.includes('Failed') ? 'bg-red-500/10 text-red-300' : 'bg-emerald-500/10 text-emerald-300')}>
            {message}
          </div>
        )}

        {showForm && (
          <div className="bg-[#0B0F19]/80 border border-white/[0.04] rounded-xl p-5 mb-6">
            <h3 className="text-sm font-semibold mb-4">{editId ? 'Edit Threshold' : 'New Threshold'}</h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1.5">Metric</label>
                <select value={formMetric} onChange={function(e) { setFormMetric(e.target.value); }}
                  className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {METRIC_OPTIONS.map(function(o) { return <option key={o.value} value={o.value}>{o.label}</option>; })}
                </select>
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1.5">Operator</label>
                  <select value={formOperator} onChange={function(e) { setFormOperator(e.target.value); }}
                    className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                    {OPERATOR_OPTIONS.map(function(o) { return <option key={o.value} value={o.value}>{o.label}</option>; })}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1.5">Value</label>
                  <input type="number" step="0.1" value={formValue} onChange={function(e) { setFormValue(e.target.value); }}
                    className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <div onClick={function() { setFormEnabled(!formEnabled); }}
                  className={'w-10 h-5 rounded-full transition-colors relative ' + (formEnabled ? 'bg-emerald-500' : 'bg-gray-600')}>
                  <div className={'absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ' + (formEnabled ? 'translate-x-5' : 'translate-x-0.5')} />
                </div>
                <span className="text-sm">Enabled</span>
              </label>
              <div className="flex gap-2">
                <button type="submit" className="flex-1 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 shadow-[0_4px_15px_rgba(99,68,227,0.2)]">{editId ? 'Update' : 'Create'}</button>
                <button type="button" onClick={resetForm} className="px-4 py-2.5 rounded-lg text-sm bg-white/5 hover:bg-white/10 transition">Cancel</button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <p className="text-gray-400 text-sm">Loading...</p>
        ) : thresholds.length === 0 ? (
          <div className="bg-[#0B0F19]/60 border border-white/[0.04] rounded-xl p-8 text-center">
            <p className="text-gray-500 text-sm">No alert thresholds configured. Click "+ Add Threshold" to create one.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {thresholds.map(function(t) {
              return (
                <div key={t.id} className="bg-[#0B0F19]/60 border border-white/[0.04] rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={cn('w-2 h-2 rounded-full', t.enabled ? 'bg-emerald-500' : 'bg-gray-600')} />
                      <span className="text-sm font-medium text-white">{getMetricLabel(t.metric)}</span>
                    </div>
                    <p className="text-xs text-gray-400">{getOperatorLabel(t.operator)} {t.value}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={function() { editThreshold(t); }} className="text-blue-400 hover:text-blue-300 text-xs">Edit</button>
                    <button onClick={function() { handleDelete(t.id); }} className="text-red-400 hover:text-red-300 text-xs">Delete</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
