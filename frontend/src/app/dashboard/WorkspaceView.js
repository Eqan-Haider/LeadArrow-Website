'use client';
import { useState, useEffect } from 'react';

var API = 'http://localhost:5001/api';

function Tooltip({ text }) {
  return <span className="group relative ml-1 cursor-help"><span className="text-slate-500 text-[10px] border border-slate-600 rounded-full w-3.5 h-3.5 inline-flex items-center justify-center">?</span><span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 p-2 rounded-lg bg-[#1a1f2e] border border-white/10 text-[10px] text-slate-300 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 whitespace-normal">{text}</span></span>;
}

export default function WorkspaceView({ user, isPremium }) {
  var [tab, setTab] = useState('overview');
  var [settings, setSettings] = useState(null);
  var [reps, setReps] = useState([]);
  var [history, setHistory] = useState([]);
  var [analytics, setAnalytics] = useState(null);
  var [pairCodes, setPairCodes] = useState({});
  var [copiedId, setCopiedId] = useState(null);
  var [loading, setLoading] = useState(true);
  var [msg, setMsg] = useState('');

  /* Rep form */
  var [newRepName, setNewRepName] = useState('');
  var [newRepEmail, setNewRepEmail] = useState('');
  var [newRepPhone, setNewRepPhone] = useState('');

  /* Slack */
  var [slackWebhook, setSlackWebhook] = useState('');
  var [slackConnected, setSlackConnected] = useState(false);

  /* Routing */
  var [routingMethod, setRoutingMethod] = useState('ROUND_ROBIN');
  var [calendarToggle, setCalendarToggle] = useState(false);
  var [leadSource, setLeadSource] = useState('crm');

  var cId = user?.companyId || user?.id || '';

  useEffect(function () {
    loadAll();
  }, []);

  function loadAll() {
    setLoading(true);
    var token = localStorage.getItem('token');
    var headers = { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' };

    Promise.all([
      fetch(API + '/workspace/settings', { headers }).then(function (r) { return r.json(); }).catch(function () { return {}; }),
      fetch(API + '/reps?companyId=' + cId, { headers }).then(function (r) { return r.json(); }).catch(function () { return []; }),
      fetch(API + '/workspace/history', { headers }).then(function (r) { return r.json(); }).catch(function () { return []; }),
      fetch(API + '/workspace/analytics', { headers }).then(function (r) { return r.json(); }).catch(function () { return null; }),
    ]).then(function ([s, r, h, a]) {
      setSettings(s);
      if (Array.isArray(r)) setReps(r);
      if (Array.isArray(h)) setHistory(h);
      if (a) setAnalytics(a);
      setLoading(false);
    });
  }

  function saveSettings(extra) {
    var token = localStorage.getItem('token');
    fetch(API + '/workspace/settings', {
      method: 'PUT',
      headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
      body: JSON.stringify(Object.assign({
        calendarAwareProcessing: calendarToggle,
        routingMethod: routingMethod,
      }, extra || {})),
    }).then(function (r) { return r.json(); }).then(function () {
      setMsg('Settings saved');
      setTimeout(function () { setMsg(''); }, 2000);
    }).catch(function () { setMsg('Save failed'); });
  }

  function addRep() {
    if (!newRepName.trim() || !newRepEmail.trim()) return;
    var token = localStorage.getItem('token');
    fetch(API + '/reps/add', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName: newRepName.trim(), email: newRepEmail.trim(), phoneNumber: newRepPhone.trim(), companyId: cId }),
    }).then(function (r) { return r.json(); }).then(function (d) {
      if (d.error) { setMsg(d.error); } else { setNewRepName(''); setNewRepEmail(''); setNewRepPhone(''); loadAll(); setMsg('Rep added'); }
      setTimeout(function () { setMsg(''); }, 2000);
    }).catch(function () { setMsg('Failed to add rep'); });
  }

  function removeRep(id) {
    var token = localStorage.getItem('token');
    fetch(API + '/reps/' + id, { method: 'DELETE', headers: { 'Authorization': 'Bearer ' + token } })
      .then(function () { loadAll(); setMsg('Rep removed'); setTimeout(function () { setMsg(''); }, 2000); })
      .catch(function () { setMsg('Failed to remove rep'); });
  }

  function toggleRepActive(id, current) {
    var token = localStorage.getItem('token');
    fetch(API + '/reps/' + id, {
      method: 'PUT',
      headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !current }),
    }).then(function () { loadAll(); }).catch(function () {});
  }

  var tabs = [
    { key: 'overview', label: 'Overview', emoji: '\uD83D\uDCCA' },
    { key: 'reps', label: 'Reps', emoji: '\uD83D\uDC65' },
    { key: 'routing', label: 'Routing', emoji: '\uD83D\uDD04' },
    { key: 'integrations', label: 'Integrations', emoji: '\u2699\uFE0F' },
    { key: 'history', label: 'History', emoji: '\uD83D\uDDD2\uFE0F' },
  ];

  if (loading) return <div className="p-8"><div className="text-center py-12 text-slate-500">Loading workspace...</div></div>;

  return <div className="p-8">
    <div className="flex items-center justify-between mb-6">
      <div><h1 className="text-xl font-bold text-white">Workspace Settings</h1><p className="text-xs text-slate-400 mt-1">Configure your team, routing, and integrations</p></div>
      {msg && <span className="text-xs px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">{msg}</span>}
    </div>

    <div className="flex gap-2 mb-6 flex-wrap">
      {tabs.map(function (t) {
        return <button key={t.key} onClick={function () { setTab(t.key); }}
          className={'px-4 py-2 rounded-lg text-xs font-semibold transition-all ' + (tab === t.key ? 'bg-violet-500/15 text-violet-300 border border-violet-500/20' : 'text-slate-500 hover:text-slate-300 border border-transparent')}>
          {t.emoji} {t.label}
        </button>;
      })}
    </div>

    {/* === OVERVIEW === */}
    {tab === 'overview' && <div>
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-[#0B0F19]/60 border border-white/5 rounded-xl p-4">
          <p className="text-[9px] text-slate-500 uppercase tracking-wider">Total Reps</p>
          <p className="text-2xl font-bold text-white mt-1">{reps.length}</p>
        </div>
        <div className="bg-[#0B0F19]/60 border border-white/5 rounded-xl p-4">
          <p className="text-[9px] text-slate-500 uppercase tracking-wider">Active Reps</p>
          <p className="text-2xl font-bold text-white mt-1">{reps.filter(function (r) { return r.isActive; }).length}</p>
        </div>
        <div className="bg-[#0B0F19]/60 border border-white/5 rounded-xl p-4">
          <p className="text-[9px] text-slate-500 uppercase tracking-wider">Total Leads Routed</p>
          <p className="text-2xl font-bold text-white mt-1">{analytics?.totalLeads || 0}</p>
        </div>
        <div className="bg-[#0B0F19]/60 border border-white/5 rounded-xl p-4">
          <p className="text-[9px] text-slate-500 uppercase tracking-wider">Connection Rate</p>
          <p className="text-2xl font-bold text-white mt-1">{analytics?.connectionRate || 0}%</p>
        </div>
      </div>

      <div className="bg-[#0B0F19]/60 border border-white/5 rounded-xl p-5">
        <h3 className="text-sm font-bold text-white mb-3">Team Coverage</h3>
        {reps.length === 0 ? <p className="text-xs text-slate-500">No reps added yet. Go to the Reps tab to add your team.</p> :
        <div className="space-y-2">{reps.map(function (r) {
          return <div key={r.id} className="flex items-center gap-3 bg-white/[0.02] rounded-lg px-3 py-2">
            <span className={'w-2 h-2 rounded-full shrink-0 ' + (r.isActive ? 'bg-emerald-500' : 'bg-slate-600')}></span>
            <span className="text-sm text-slate-200 flex-1">{r.name || r.fullName}</span>
            <span className="text-xs text-slate-500">{r.email}</span>
            <span className={'text-[10px] px-2 py-0.5 rounded-full ' + (r.isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-500/10 text-slate-400')}>{r.isActive ? 'Active' : 'Inactive'}</span>
          </div>;
        })}</div>}
      </div>
    </div>}

    {/* === REPS === */}
    {tab === 'reps' && <div>
      <div className="bg-[#0B0F19]/60 border border-white/5 rounded-xl p-5 mb-6">
        <h3 className="text-sm font-bold text-white mb-3">Add Rep <Tooltip text="Add a new sales rep to your team. They will receive lead alerts via phone and Chrome extension."/></h3>
        <div className="flex gap-3 items-end flex-wrap">
          <div><label className="text-[9px] text-slate-500 uppercase tracking-wider block mb-1">Full Name</label><input type="text" value={newRepName} onChange={function (e) { setNewRepName(e.target.value); }} placeholder="John Doe" className="bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 w-44 focus:outline-none focus:border-violet-500/50"/></div>
          <div><label className="text-[9px] text-slate-500 uppercase tracking-wider block mb-1">Email</label><input type="email" value={newRepEmail} onChange={function (e) { setNewRepEmail(e.target.value); }} placeholder="john@company.com" className="bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 w-48 focus:outline-none focus:border-violet-500/50"/></div>
          <div><label className="text-[9px] text-slate-500 uppercase tracking-wider block mb-1">Phone <Tooltip text="Rep's mobile number for receiving lead calls. Must include country code."/></label><input type="text" value={newRepPhone} onChange={function (e) { setNewRepPhone(e.target.value); }} placeholder="+1234567890" className="bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 w-40 focus:outline-none focus:border-violet-500/50"/></div>
          <button onClick={addRep} disabled={!newRepName.trim() || !newRepEmail.trim()} className="bg-[#6344E3] hover:bg-[#5035C4] text-white px-4 py-2 rounded-lg text-xs font-semibold disabled:opacity-50 transition-all">Add Rep</button>
        </div>
      </div>

      <div className="bg-[#0B0F19]/60 border border-white/5 rounded-xl p-5">
        <h3 className="text-sm font-bold text-white mb-3">Team Members <Tooltip text="Manage your sales reps. Toggle active status to control who receives lead alerts."/></h3>
        {reps.length === 0 ? <p className="text-xs text-slate-500 py-4 text-center">No reps yet. Add your first rep above.</p> :
        <div className="overflow-x-auto"><table className="w-full text-left"><thead><tr className="text-[9px] text-slate-500 uppercase tracking-wider border-b border-white/5"><th className="pb-2 pr-3 font-semibold">Name</th><th className="pb-2 pr-3 font-semibold">Email</th><th className="pb-2 pr-3 font-semibold">Phone</th><th className="pb-2 pr-3 font-semibold">Status</th><th className="pb-2 pr-3 font-semibold">Extension</th><th className="pb-2 font-semibold">Actions</th></tr></thead><tbody>{reps.map(function (r) {
          var code = pairCodes[r.id];
          function genCode() {
            var c = 'LA-' + Math.random().toString(36).substring(2, 8).toUpperCase();
            setPairCodes(function(p){return{...p,[r.id]:c}});
          }
          function copyCode() {
            if (code) { navigator.clipboard.writeText(code); setCopiedId(r.id); setTimeout(function(){setCopiedId(null)},1500); }
          }
          return <tr key={r.id} className="border-b border-white/[0.02] text-sm text-slate-300">
            <td className="py-2.5 pr-3 font-medium text-white">{r.name || r.fullName}</td>
            <td className="py-2.5 pr-3 text-slate-400">{r.email}</td>
            <td className="py-2.5 pr-3 text-slate-400">{r.phoneNumber || '\u2014'}</td>
            <td className="py-2.5 pr-3"><span className={'text-[10px] px-2 py-0.5 rounded-full ' + (r.isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-500/10 text-slate-400')}>{r.isActive ? 'Active' : 'Inactive'}</span></td>
            <td className="py-2.5 pr-3">
              {code ? <div className="flex items-center gap-1">
                <code className="text-[9px] font-mono text-cyan-300 bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/20">{code}</code>
                <button onClick={copyCode} className="text-[9px] text-slate-500 hover:text-slate-300 px-1">{copiedId===r.id ? '\u2713' : '\uD83D\uDCCB'}</button>
              </div> : <button onClick={genCode} className="text-[9px] px-2 py-1 rounded bg-violet-500/10 text-violet-300 border border-violet-500/20 hover:bg-violet-500/20 transition-all">Generate Code</button>}
            </td>
            <td className="py-2.5 flex gap-2">
              <button onClick={function () { toggleRepActive(r.id, r.isActive); }} className={'text-[10px] px-2 py-1 rounded-lg font-medium border transition-all ' + (r.isActive ? 'bg-amber-500/10 text-amber-300 border-amber-500/20 hover:bg-amber-500/20' : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20 hover:bg-emerald-500/20')}>{r.isActive ? 'Deactivate' : 'Activate'}</button>
              <button onClick={function () { removeRep(r.id); }} className="text-[10px] px-2 py-1 rounded-lg font-medium bg-red-500/10 text-red-300 border border-red-500/20 hover:bg-red-500/20 transition-all">Remove</button>
            </td>
          </tr>;
        })}</tbody></table></div>}
      </div>
    </div>}

    {/* === ROUTING === */}
    {tab === 'routing' && <div>
      <div className="bg-[#0B0F19]/60 border border-white/5 rounded-xl p-5 mb-6">
        <h3 className="text-sm font-bold text-white mb-4">Routing Method <Tooltip text="Choose how leads are distributed to your reps. Round Robin rotates evenly. Percentage lets you control how many leads each rep gets first."/></h3>
        <div className="flex gap-3 mb-4">
          <label className={'flex-1 cursor-pointer p-4 rounded-xl border transition-all ' + (routingMethod === 'ROUND_ROBIN' ? 'bg-violet-500/10 border-violet-500/30' : 'bg-white/[0.02] border-white/10 hover:border-white/20')}>
            <input type="radio" name="routing" value="ROUND_ROBIN" checked={routingMethod === 'ROUND_ROBIN'} onChange={function (e) { setRoutingMethod(e.target.value); }} className="sr-only"/>
            <p className="text-sm font-semibold text-white">Round Robin</p>
            <p className="text-[10px] text-slate-400 mt-1">Leads rotate evenly between all active reps. Each new lead goes to the next rep in line.</p>
          </label>
          <label className={'flex-1 cursor-pointer p-4 rounded-xl border transition-all ' + (routingMethod === 'PERCENTAGE' ? 'bg-violet-500/10 border-violet-500/30' : 'bg-white/[0.02] border-white/10 hover:border-white/20')}>
            <input type="radio" name="routing" value="PERCENTAGE" checked={routingMethod === 'PERCENTAGE'} onChange={function (e) { setRoutingMethod(e.target.value); }} className="sr-only"/>
            <p className="text-sm font-semibold text-white">Percentage-Based</p>
            <p className="text-[10px] text-slate-400 mt-1">Top-performing reps receive more leads. You control what percentage goes to each rep first.</p>
          </label>
        </div>
        <div className="flex items-center gap-3 mb-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={calendarToggle} onChange={function (e) { setCalendarToggle(e.target.checked); }} className="accent-violet-500"/>
            <span className="text-xs text-slate-300">Enable Google Calendar busy-checking <Tooltip text="When enabled, the system will check each rep's Google Calendar before routing a lead. If the rep is in a meeting, the lead goes to the next available rep."/></span>
          </label>
        </div>
        <button onClick={saveSettings} className="bg-[#6344E3] hover:bg-[#5035C4] text-white px-5 py-2 rounded-lg text-xs font-semibold transition-all">Save Routing Settings</button>
      </div>

      {routingMethod === 'PERCENTAGE' && reps.length > 0 && <div className="bg-[#0B0F19]/60 border border-white/5 rounded-xl p-5">
        <h3 className="text-sm font-bold text-white mb-3">Rep Percentages <Tooltip text="Set what percentage of new leads each rep should get first. Percentages should add up to 100."/></h3>
        <p className="text-xs text-slate-500 mb-3">Configure in the Reps tab. Percentage routing requires per-rep weights.</p>
      </div>}
    </div>}

    {/* === INTEGRATIONS === */}
    {tab === 'integrations' && <div>
      <div className="bg-[#0B0F19]/60 border border-white/5 rounded-xl p-5 mb-6">
        <h3 className="text-sm font-bold text-white mb-3">Lead Trigger Source <Tooltip text="Choose where new lead alerts come from. CRM means the system watches your CRM for new leads. Slack means new lead messages in a Slack channel will trigger the workflow."/></h3>
        <div className="flex gap-3 mb-4">
          <label className={'flex-1 cursor-pointer p-4 rounded-xl border transition-all ' + (leadSource === 'crm' ? 'bg-violet-500/10 border-violet-500/30' : 'bg-white/[0.02] border-white/10 hover:border-white/20')}>
            <input type="radio" name="leadSource" value="crm" checked={leadSource === 'crm'} onChange={function (e) { setLeadSource('crm'); saveSettings({ leadTriggerSource: 'crm' }); }} className="sr-only"/>
            <p className="text-sm font-semibold text-white">CRM New Leads</p>
            <p className="text-[10px] text-slate-400 mt-1">Watch connected CRM for new lead creation. Best for dedicated CRM teams.</p>
          </label>
          <label className={'flex-1 cursor-pointer p-4 rounded-xl border transition-all ' + (leadSource === 'slack' ? 'bg-violet-500/10 border-violet-500/30' : 'bg-white/[0.02] border-white/10 hover:border-white/20')}>
            <input type="radio" name="leadSource" value="slack" checked={leadSource === 'slack'} onChange={function (e) { setLeadSource('slack'); saveSettings({ leadTriggerSource: 'slack' }); }} className="sr-only"/>
            <p className="text-sm font-semibold text-white">Slack Channel</p>
            <p className="text-[10px] text-slate-400 mt-1">New lead messages in a connected Slack channel trigger routing. Best for multi-team CRMs.</p>
          </label>
        </div>
      </div>

      <div className="bg-[#0B0F19]/60 border border-white/5 rounded-xl p-5 mb-6">
        <h3 className="text-sm font-bold text-white mb-3">CRM Connection <Tooltip text="Connect your CRM so the system can watch for new leads and send reps directly to the correct lead record."/></h3>
        <div className="flex gap-2 flex-wrap mb-3">
          {['close', 'gohighlevel', 'salesforce', 'hubspot'].map(function (crm) {
            var connected = settings?.crmProvider === crm;
            return <button key={crm} disabled className={'px-4 py-3 rounded-xl text-xs font-semibold border transition-all ' + (connected ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' : 'bg-white/[0.02] text-slate-500 border-white/10')}>
              {crm === 'close' ? 'Close CRM' : crm === 'gohighlevel' ? 'GoHighLevel' : crm === 'salesforce' ? 'Salesforce' : 'HubSpot'}
              {connected ? ' \u2705' : ''}
            </button>;
          })}
        </div>
        <p className="text-[10px] text-slate-500">Currently only Close CRM is integrated. GHL, Salesforce, and HubSpot coming soon.</p>
      </div>

      <div className="bg-[#0B0F19]/60 border border-white/5 rounded-xl p-5 mb-6">
        <h3 className="text-sm font-bold text-white mb-3">Slack Connection <Tooltip text="Connect a Slack workspace and channel. New lead messages in this channel will trigger the routing workflow if Slack is selected as the lead trigger source."/></h3>
        <p className="text-xs text-slate-500 mb-3">Use the Slack webhook URL below in your Slack workspace to forward lead messages.</p>
        <div className="flex gap-2 items-center">
          <input type="text" readOnly value={slackWebhook || (API + '/webhook/slack/' + cId)} className="flex-1 bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-xs text-cyan-300 font-mono truncate"/>
          <button onClick={function () { navigator.clipboard.writeText(API + '/webhook/slack/' + cId); setMsg('Copied!'); setTimeout(function () { setMsg(''); }, 2000); }} className="bg-white/[0.03] hover:bg-white/[0.06] text-slate-300 border border-white/10 px-3 py-2 rounded-lg text-xs transition-all">Copy URL</button>
        </div>
      </div>

      <div className="bg-[#0B0F19]/60 border border-white/5 rounded-xl p-5">
        <h3 className="text-sm font-bold text-white mb-3">Google Calendar <Tooltip text="Connect Google Calendar to automatically check if reps are in meetings before routing leads to them."/></h3>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={calendarToggle} onChange={function (e) { setCalendarToggle(e.target.value); }} className="accent-violet-500"/>
            <span className="text-xs text-slate-300">Calendar busy-checking enabled</span>
          </label>
          <button onClick={saveSettings} className="bg-white/[0.03] hover:bg-white/[0.06] text-slate-300 border border-white/10 px-3 py-1.5 rounded-lg text-xs transition-all">Save</button>
        </div>
      </div>
    </div>}

    {/* === HISTORY === */}
    {tab === 'history' && <div>
      <div className="bg-[#0B0F19]/60 border border-white/5 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4"><h3 className="text-sm font-bold text-white">Lead Routing History <Tooltip text="Complete log of all lead routing events. Shows which rep was alerted, their response, and the final outcome."/></h3><span className="text-[10px] text-slate-500">{history.length} entries</span></div>
        {history.length === 0 ? <p className="text-xs text-slate-500 text-center py-8">No lead routing history yet. Leads will appear here once they are routed.</p> :
        <div className="overflow-x-auto"><table className="w-full text-left"><thead><tr className="text-[9px] text-slate-500 uppercase tracking-wider border-b border-white/5"><th className="pb-2 pr-3 font-semibold">Prospect</th><th className="pb-2 pr-3 font-semibold">Source</th><th className="pb-2 pr-3 font-semibold">Status</th><th className="pb-2 pr-3 font-semibold">Accepted By</th><th className="pb-2 pr-3 font-semibold">Attempts</th><th className="pb-2 font-semibold">Time</th></tr></thead><tbody>{history.map(function (log) {
          var acceptedAttempt = log.attempts.find(function (a) { return a.status === 'ACCEPTED'; });
          return <tr key={log.id} className="border-b border-white/[0.02] text-sm text-slate-300">
            <td className="py-2.5 pr-3 font-medium text-white">{log.prospectName}</td>
            <td className="py-2.5 pr-3 text-slate-400">{log.leadSource || '\u2014'}</td>
            <td className="py-2.5 pr-3"><span className={'text-[10px] px-2 py-0.5 rounded-full ' + (log.status === 'ROUTING' ? 'bg-amber-500/10 text-amber-400' : log.status === 'ACCEPTED' || log.acceptedAt ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400')}>{log.acceptedAt ? 'Accepted' : log.status}</span></td>
            <td className="py-2.5 pr-3 text-slate-400">{acceptedAttempt?.user?.fullName || '\u2014'}</td>
            <td className="py-2.5 pr-3 text-slate-500">{log.attempts.length}</td>
            <td className="py-2.5 text-slate-500 text-[11px]">{new Date(log.createdAt).toLocaleString()}</td>
          </tr>;
        })}</tbody></table></div>}
      </div>
    </div>}
  </div>;
}
