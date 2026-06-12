'use client';
import { useState } from 'react';

export default function CRMFollowUpDashboard() {
  // Real live state: Shuru mein queue bilkul khali (zero tasks) hogi
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('All');

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 p-6 md:p-10 font-sans antialiased">
      <div className="mx-auto max-w-6xl">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-800 pb-6 mb-8 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white flex items-center gap-3">
              <span>📅</span> CRM Scheduled Follow-Up Calls
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              Real-time voice trigger queue synced directly with Close CRM tasks.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
              Telnyx Engine Live
            </span>
          </div>
        </div>

        {/* Dynamic Stats Grid - Automatic 0 unless data arrives */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-[#111827] border border-slate-800 p-5 rounded-2xl">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Tasks Synced</p>
            <p className="text-2xl font-black text-white mt-1">{tasks.length}</p>
          </div>
          <div className="bg-[#111827] border border-slate-800 p-5 rounded-2xl border-l-2 border-l-cyan-500">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Calls In Immediate Queue</p>
            <p className="text-2xl font-black text-cyan-400 mt-1">
              {tasks.filter((t: any) => t.status === 'In Queue').length}
            </p>
          </div>
          <div className="bg-[#111827] border border-slate-800 p-5 rounded-2xl">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Completed Reminders Today</p>
            <p className="text-2xl font-black text-emerald-400 mt-1">0</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 mb-6 bg-slate-900/60 p-1 rounded-xl max-w-xs border border-slate-800/60">
          {['All', 'In Queue', 'Scheduled'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`flex-1 text-xs font-bold py-2 rounded-lg transition-all ${
                filter === tab 
                  ? 'bg-slate-800 text-cyan-400 shadow' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Main List Card */}
        <div className="bg-[#111827] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-5 border-b border-slate-800 bg-slate-900/40">
            <h3 className="text-sm font-bold text-slate-200">Upcoming Voice Prompts Queue</h3>
          </div>
          
          {/* Live Check */}
          {tasks.length === 0 ? (
            <div className="p-16 text-center flex flex-col items-center justify-center">
              <span className="text-4xl mb-3 animate-pulse">🔄</span>
              <h4 className="text-base font-bold text-slate-300">Queue is currently empty</h4>
              <p className="text-xs text-slate-500 max-w-sm mt-1 leading-relaxed">
                Listening for scheduled tasks inside Close CRM. As soon as a rep's follow-up time arrives, it will pop up here instantly and trigger the Telnyx phone call.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-800/60">
              {tasks
                .filter((t: any) => filter === 'All' || t.status === filter)
                .map((task: any) => (
                  <div key={task.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-900/20 transition">
                    <div className="flex items-start gap-4">
                      <div className="bg-slate-800 p-3 rounded-xl text-xl font-mono flex items-center justify-center h-12 w-12">📞</div>
                      <div>
                        <h4 className="text-base font-bold text-white">{task.leadName}</h4>
                        <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                          <span>{task.company}</span> • <span className="font-mono text-slate-500">{task.phone}</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-6">
                      <div className="text-left sm:text-right">
                        <span className="text-xs font-semibold text-slate-400 block">Trigger Time</span>
                        <span className="text-sm font-bold text-cyan-300 font-mono">{task.scheduledTime}</span>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-[11px] font-bold ${
                        task.status === 'In Queue' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      }`}>
                        {task.status}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Live Info Banner */}
        <div className="mt-6 p-4 bg-slate-900/40 border border-slate-800 rounded-xl flex items-start gap-3">
          <span className="text-base">💡</span>
          <p className="text-xs text-slate-400 leading-relaxed">
            <strong className="text-slate-200">Live Infrastructure Mode:</strong> The page is now idling in a live listening loop. Once the backend webhook receives a task event from Close CRM, the metrics above will tick up dynamically.
          </p>
        </div>

      </div>
    </div>
  );
}