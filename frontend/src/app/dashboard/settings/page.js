'use client';
import { useState, useEffect } from 'react';

var API = 'http://localhost:5001/api';

export default function RepSettingsPage() {
  var [userId, setUserId] = useState('');
  var [phoneNumber, setPhoneNumber] = useState('');
  var [isAvailable, setIsAvailable] = useState(true);
  var [pushoverEnabled, setPushoverEnabled] = useState(false);
  var [pushoverKey, setPushoverKey] = useState('');
  var [message, setMessage] = useState('');
  var [saving, setSaving] = useState(false);

  useEffect(function() {
    var t = localStorage.getItem('token');
    if (!t) return;
    try {
      var parts = t.split('.');
      var payload = JSON.parse(atob(parts[1].replace(/-/g,'+').replace(/_/g,'/')));
      setUserId(payload.id || '');
      setPhoneNumber(payload.phoneNumber || '');
    } catch (e) { console.error(e); }
  }, []);

  useEffect(function() {
    if (!userId) return;
    fetch(API + '/reps/' + userId + '/pushover-settings', {
      headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') },
    }).then(function(r) { return r.json(); }).then(function(d) {
      if (d && typeof d.isEnabled === 'boolean') {
        setPushoverEnabled(d.isEnabled);
        setPushoverKey(d.userKey || '');
      }
    }).catch(function() {});
  }, [userId]);

  async function saveSettings() {
    setSaving(true);
    setMessage('');
    var token = localStorage.getItem('token');
    try {
      var resp = await fetch(API + '/reps/' + userId, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
        body: JSON.stringify({ phoneNumber: phoneNumber || '', isAvailable: isAvailable }),
      });
      if (resp.ok) {
        await fetch(API + '/reps/' + userId + '/pushover-settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
          body: JSON.stringify({ userKey: pushoverKey, isEnabled: pushoverEnabled }),
        });
        setMessage('Settings saved');
      } else {
        setMessage('Failed to save');
      }
    } catch (e) { setMessage('Network error'); }
    setSaving(false);
  }

  return (
    <div className="min-h-screen bg-[#030712] text-white p-6">
      <div className="max-w-xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Rep Settings</h1>
          <a href="/dashboard" className="flex items-center gap-2 text-sm text-gray-400 hover:text-white border border-white/10 px-4 py-2 rounded-xl transition-all duration-200">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
            Back
          </a>
        </div>

        {message && (
          <div className={'px-4 py-2 rounded-lg text-sm mb-4 ' + (message === 'Settings saved' ? 'bg-emerald-500/10 text-emerald-300' : 'bg-red-500/10 text-red-300')}>
            {message}
          </div>
        )}

        <div className="bg-[#0B0F19]/80 border border-white/[0.04] rounded-xl p-6 space-y-5">
          <div>
            <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1.5">Phone Number</label>
            <input type="tel" value={phoneNumber} onChange={function(e) { setPhoneNumber(e.target.value); }}
              className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-2.5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <div onClick={function() { setIsAvailable(!isAvailable); }}
                className={'w-10 h-5 rounded-full transition-colors relative ' + (isAvailable ? 'bg-emerald-500' : 'bg-gray-600')}>
                <div className={'absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ' + (isAvailable ? 'translate-x-5' : 'translate-x-0.5')} />
              </div>
              <span className="text-sm">Available for lead routing</span>
            </label>
          </div>

          <div className="border-t border-white/[0.04] pt-5">
            <h3 className="text-sm font-semibold text-gray-300 mb-3">Pushover Notifications</h3>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <div onClick={function() { setPushoverEnabled(!pushoverEnabled); }}
                  className={'w-10 h-5 rounded-full transition-colors relative ' + (pushoverEnabled ? 'bg-emerald-500' : 'bg-gray-600')}>
                  <div className={'absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ' + (pushoverEnabled ? 'translate-x-5' : 'translate-x-0.5')} />
                </div>
                <span className="text-sm">Enable Pushover</span>
              </label>
              {pushoverEnabled && (
                <div>
                  <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1.5">Pushover User Key</label>
                  <input type="text" value={pushoverKey} onChange={function(e) { setPushoverKey(e.target.value); }}
                    placeholder="Your Pushover user key" className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-2.5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              )}
            </div>
          </div>

          <button onClick={saveSettings} disabled={saving}
            className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50 py-3 rounded-xl text-white font-semibold transition-all duration-200 shadow-[0_4px_20px_rgba(99,68,227,0.25)]">
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
}
