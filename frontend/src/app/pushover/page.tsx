'use client';

import { useState } from 'react';

export default function PushoverSettingsPage() {
  const [enabled, setEnabled] = useState(false);
  const [userKey, setUserKey] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [notificationLogs, setNotificationLogs] = useState<any[]>([]);
  const [toast, setToast] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Core Simulation Function: Always throws error as requested
  const handleSave = async () => {
    setIsSaving(true);
    
    // 1 second real-time delay simulation
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);

    // Forces a validation error on any input text
    setToast({
      type: 'error',
      message: '🚨 API Validation Error: The provided Pushover Key is inactive or rejected by pushover.net routing servers. Please check your credentials.',
    });

    // Automatically appends a live failure entry in the logs table
    setNotificationLogs([
      { 
        id: 'log_' + Date.now(), 
        timestamp: new Date().toLocaleTimeString(), 
        event: 'Pushover Token Handshake Failed (HTTP 401 Unauthorized)', 
        status: 'FAILED (Core Telnyx calling still active)' 
      }
    ]);

    setTimeout(() => setToast(null), 5000);
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] p-4 md:p-8 text-slate-100">
      <div className="mx-auto max-w-3xl">
        
        {/* Page header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
              <span>🚨</span> Pushover Emergency Alerts
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              Configure a secondary notification channel that bypasses Do Not Disturb for critical lead alerts.
            </p>
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-3 py-1.5 rounded-full border border-cyan-500/20">
              API Sandbox Ready
            </span>
          </div>
        </div>

        {/* Settings card */}
        <div className="rounded-2xl border border-slate-800 bg-[#111827] p-6 md:p-8 shadow-xl">
          {/* Toggle row */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <span>⚙️</span> Enable Pushover Alerts
              </h2>
              <p className="mt-1 text-xs text-slate-400 max-w-md leading-relaxed">
                When a new inbound lead hits the system, route an instantaneous emergency notification to the Pushover client app alongside the Telnyx call.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setEnabled(!enabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none ${
                enabled ? 'bg-blue-600' : 'bg-slate-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-300 ${
                  enabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Expandable section */}
          <div
            className={`overflow-hidden transition-all duration-300 ${
              enabled ? 'max-h-96 opacity-100 mt-6' : 'max-h-0 opacity-0 mt-0'
            }`}
          >
            <div className="border-t border-slate-800/60 pt-6">
              <div>
                <label htmlFor="userKey" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Pushover User Key
                </label>
                <input
                  id="userKey"
                  type="text"
                  value={userKey}
                  onChange={(e) => setUserKey(e.target.value)}
                  placeholder="Paste your individual user key from pushover.net"
                  className="w-full rounded-xl border border-slate-700 bg-[#0b0f19] px-4 py-3 text-sm font-medium text-white placeholder-slate-600 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
                <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                  Errors or failure codes on the Pushover channel will be logged below and will <strong className="text-slate-400">never block</strong> or delay the core Telnyx calling/routing loop.
                </p>
              </div>
            </div>
          </div>

          {/* Save button */}
          <div className="mt-8 border-t border-slate-800/60 pt-6">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className={`w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                isSaving
                  ? 'bg-blue-600/50 cursor-not-allowed text-slate-300'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/10'
              }`}
            >
              {isSaving ? 'Synchronizing Engine...' : 'Save Notification Settings'}
            </button>
          </div>
        </div>

        {/* Live Logs Table */}
        <div className="mt-8 rounded-2xl border border-slate-800 bg-[#111827] overflow-hidden shadow-xl">
          <div className="p-4 border-b border-slate-800 bg-slate-900/40">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pushover Delivery Logs</h3>
          </div>
          
          {notificationLogs.length === 0 ? (
            <div className="p-10 text-center flex flex-col items-center justify-center">
              <span className="text-2xl mb-2">📋</span>
              <h4 className="text-xs font-bold text-slate-400">No logs recorded</h4>
              <p className="text-[11px] text-slate-500 max-w-xs mt-0.5">
                Dispatch histories, delivery tokens, and API exceptions will compile here in real-time once active routing is fired.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-800/60 font-mono text-xs p-4">
              {notificationLogs.map((log: any) => (
                <div key={log.id} className="flex justify-between items-center py-2 text-slate-400 gap-4">
                  <span className="truncate">[{log.timestamp}] {log.event}</span>
                  <span className="text-red-400 shrink-0 text-[10px] font-bold bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">{log.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Toast notification */}
        {toast && (
          <div
            className={`fixed bottom-5 right-5 rounded-xl border p-4 text-sm font-medium shadow-2xl backdrop-blur-md transition-all ${
              toast.type === 'success'
                ? 'border-green-500/30 bg-green-500/10 text-green-300'
                : 'border-red-500/30 bg-red-500/10 text-red-300'
            }`}
          >
            {toast.message}
          </div>
        )}
      </div>
    </div>
  );
}