'use client';
import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

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

function CustomSelect({ options, value, onChange, placeholder }) {
  var [open, setOpen] = useState(false);
  var [dropdownStyle, setDropdownStyle] = useState({});
  var ref = useRef(null);
  var triggerRef = useRef(null);

  useEffect(function() {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target) && triggerRef.current && !triggerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return function() { document.removeEventListener('mousedown', handleClick); };
  }, []);

  function handleOpen() {
    if (triggerRef.current) {
      var rect = triggerRef.current.getBoundingClientRect();
      setDropdownStyle({
        position: 'fixed',
        top: rect.bottom + 6,
        left: rect.left,
        width: rect.width,
        zIndex: 99999,
      });
    }
    setOpen(!open);
  }

  var selected = options.find(function(o) { return o.value === value; });

  var dropdown = open ? (
    <div ref={ref} style={{
      ...dropdownStyle,
      backgroundColor: '#0c1017',
      border: '1px solid rgba(255,255,255,0.15)',
      borderRadius: '12px',
      overflow: 'hidden',
      boxShadow: '0 25px 60px -15px rgba(0,0,0,0.95)',
    }}>
      {options.map(function(o) {
        var isSelected = o.value === value;
        return (
          <div
            key={o.value}
            onClick={function() { onChange(o.value); setOpen(false); }}
            style={{
              backgroundColor: isSelected ? 'rgba(124,58,237,0.25)' : 'transparent',
              color: isSelected ? '#a78bfa' : '#cbd5e1',
              padding: '10px 16px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'background 0.15s',
            }}
            onMouseEnter={function(e) { if (!isSelected) e.currentTarget.style.backgroundColor = 'rgba(124,58,237,0.15)'; }}
            onMouseLeave={function(e) { if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent'; }}
          >
            {o.label}
          </div>
        );
      })}
    </div>
  ) : null;

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <div
        ref={triggerRef}
        onClick={handleOpen}
        style={{
          width: '100%',
          borderRadius: '12px',
          backgroundColor: '#0c1017',
          border: '1px solid rgba(255,255,255,0.12)',
          padding: '10px 16px',
          color: '#e2e8f0',
          fontSize: '14px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          userSelect: 'none',
          transition: 'border-color 0.15s',
        }}
        onMouseEnter={function(e) { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'; }}
        onMouseLeave={function(e) { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; }}
      >
        <span style={{ fontWeight: '500' }}>{selected ? selected.label : placeholder || 'Select...'}</span>
        <svg
          style={{ width: '16px', height: '16px', color: '#64748b', transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
      {typeof window !== 'undefined' && open && createPortal(dropdown, document.body)}
    </div>
  );
}

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
    <div className="min-h-screen bg-[#030712] p-6">
      <div className="max-w-xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <a href="/dashboard" className="flex items-center gap-1 text-sm text-gray-400 hover:text-white border border-white/10 px-3 py-1.5 rounded-xl">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
            </a>
            <h1 className="text-2xl font-bold text-white">Alert Thresholds</h1>
          </div>
          <button onClick={function() { resetForm(); setShowForm(true); }}
            className="flex items-center gap-1 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 px-4 py-2 rounded-xl text-sm font-medium text-white shadow-[0_4px_15px_rgba(99,68,227,0.25)]">
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
          <div className="bg-[#0B0F19] border border-white/[0.08] rounded-xl p-5 mb-6">
            <h3 className="text-base font-semibold text-white mb-4">{editId ? 'Edit Threshold' : 'New Threshold'}</h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1.5">Metric</label>
                <CustomSelect options={METRIC_OPTIONS} value={formMetric} onChange={setFormMetric} />
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1.5">Operator</label>
                  <CustomSelect options={OPERATOR_OPTIONS} value={formOperator} onChange={setFormOperator} />
                </div>
                <div className="flex-1">
                  <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1.5">Value</label>
                  <input type="number" step="0.1" value={formValue} onChange={function(e) { setFormValue(e.target.value); }}
                    className="w-full rounded-xl bg-[#0c1017] border border-white/[0.12] px-4 py-2.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-white/[0.25] transition-colors" />
                </div>
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <div onClick={function() { setFormEnabled(!formEnabled); }}
                  className={'w-10 h-5 rounded-full transition-colors relative ' + (formEnabled ? 'bg-emerald-500' : 'bg-gray-600')}>
                  <div className={'absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ' + (formEnabled ? 'translate-x-5' : 'translate-x-0.5')} />
                </div>
                <span className="text-sm text-white">Enabled</span>
              </label>
              <div className="flex gap-2">
                <button type="submit" className="flex-1 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 py-2.5 rounded-lg text-sm font-medium text-white">{editId ? 'Update' : 'Create'}</button>
                <button type="button" onClick={resetForm} className="px-4 py-2.5 rounded-lg text-sm bg-white/5 hover:bg-white/10 text-white">Cancel</button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <p className="text-gray-400 text-sm">Loading...</p>
        ) : thresholds.length === 0 ? (
          <div className="bg-[#0B0F19] border border-white/[0.08] rounded-xl p-8 text-center">
            <p className="text-gray-400 text-sm">No alert thresholds configured. Click &quot;+ Add Threshold&quot; to create one.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {thresholds.map(function(t) {
              return (
                <div key={t.id} className="bg-[#0B0F19] border border-white/[0.08] rounded-xl p-4 flex items-center justify-between">
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