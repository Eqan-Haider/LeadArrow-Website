'use client';
import { useState } from 'react';

var API = 'http://localhost:5001/api';

export default function SetupWizard() {
  var [step, setStep] = useState(0);
  var [companyName, setCompanyName] = useState('');
  var [crmChoice, setCrmChoice] = useState('close');
  var [reps, setReps] = useState([{ name: '', email: '', phone: '' }]);
  var [routingMethod, setRoutingMethod] = useState('ROUND_ROBIN');
  var [submitting, setSubmitting] = useState(false);
  var [done, setDone] = useState(false);

  var steps = ['Welcome', 'Connect CRM', 'Add Reps', 'Configure Routing'];

  function handleRepChange(i, field, val) {
    var copy = reps.slice();
    copy[i] = { ...copy[i], [field]: val };
    setReps(copy);
  }

  function addRepRow() { setReps([...reps, { name: '', email: '', phone: '' }]); }

  function removeRepRow(i) {
    if (reps.length <= 1) return;
    var copy = reps.slice();
    copy.splice(i, 1);
    setReps(copy);
  }

  async function finish() {
    setSubmitting(true);
    var token = localStorage.getItem('token');
    try {
      var setupRes = await fetch(API + '/workspace/setup', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyName: companyName.trim(), crmChoice: crmChoice, routingMethod: routingMethod }),
      });
      if (!setupRes.ok) { console.error('Setup failed', await setupRes.text()); setSubmitting(false); return; }
      var setupData = await setupRes.json();
      localStorage.setItem('companyId', setupData.workspaceId);

      for (var r of reps) {
        if (!r.name.trim() || !r.email.trim()) continue;
        await fetch(API + '/reps/add', {
          method: 'POST',
          headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
          body: JSON.stringify({ fullName: r.name.trim(), email: r.email.trim(), phoneNumber: r.phone.trim(), companyId: setupData.workspaceId }),
        });
      }

      setDone(true);
    } catch (e) { console.error(e); }
    setSubmitting(false);
  }

  if (done) {
    return <div className="min-h-screen bg-[#030712] text-white flex items-center justify-center p-8">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-6">
          <svg className="w-10 h-10 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
        </div>
        <h1 className="text-2xl font-bold mb-2">All Set!</h1>
        <p className="text-slate-400 mb-6">Your workspace is configured and ready to route leads.</p>
        <a href="/dashboard" className="inline-block bg-[#6344E3] hover:bg-[#5035C4] text-white px-6 py-3 rounded-xl text-sm font-semibold transition-all">Go to Dashboard</a>
      </div>
    </div>;
  }

  return <div className="min-h-screen bg-[#030712] text-white p-8">
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-2 mb-8">
        {steps.map(function (s, i) {
          return <div key={s} className="flex items-center gap-2 flex-1">
            <div className={'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ' + (i <= step ? 'bg-[#6344E3] text-white' : 'bg-white/[0.03] text-slate-600 border border-white/10')}>{i + 1}</div>
            <span className={'text-xs ' + (i <= step ? 'text-white' : 'text-slate-600')}>{s}</span>
            {i < steps.length - 1 && <div className={'flex-1 h-px ' + (i < step ? 'bg-[#6344E3]' : 'bg-white/10')} />}
          </div>;
        })}
      </div>

      <div className="bg-[#0B0F19]/80 border border-white/[0.04] rounded-2xl p-8">
        {step === 0 && <div>
          <h1 className="text-2xl font-bold mb-2">Welcome to LeadArrow</h1>
          <p className="text-slate-400 mb-6">Let's get your workspace set up in a few quick steps. You'll connect your CRM, add your sales reps, and configure how leads are routed.</p>
          <div className="bg-white/[0.02] rounded-xl p-4 mb-6 border border-white/[0.04]">
            <p className="text-xs text-slate-500">You can change all of these settings later from the dashboard.</p>
          </div>
          <label className="block text-sm font-semibold mb-2">Company Name</label>
          <input type="text" value={companyName} onChange={function (e) { setCompanyName(e.target.value); }} placeholder="Acme Corp" className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-violet-500/50" />
        </div>}

        {step === 1 && <div>
          <h1 className="text-2xl font-bold mb-2">Connect Your CRM</h1>
          <p className="text-slate-400 mb-6">Choose which CRM you use. LeadArrow will watch for new leads and route them to your reps automatically.</p>
          <div className="grid grid-cols-2 gap-3 mb-6">
            {['close', 'gohighlevel', 'salesforce', 'hubspot'].map(function (crm) {
              return <button key={crm} onClick={function () { setCrmChoice(crm); }}
                className={'p-4 rounded-xl border text-left transition-all ' + (crmChoice === crm ? 'bg-violet-500/10 border-violet-500/30' : 'bg-white/[0.02] border-white/10 hover:border-white/20')}>
                <p className="text-sm font-semibold text-white">{crm === 'close' ? 'Close CRM' : crm === 'gohighlevel' ? 'GoHighLevel' : crm === 'salesforce' ? 'Salesforce' : 'HubSpot'}</p>
                <p className="text-[10px] text-slate-500 mt-1">{crm === 'close' ? 'Integrated' : 'Coming soon'}</p>
              </button>;
            })}
          </div>
        </div>}

        {step === 2 && <div>
          <h1 className="text-2xl font-bold mb-2">Add Your Team</h1>
          <p className="text-slate-400 mb-6">Add your sales reps. They'll receive lead alerts on their phone and Chrome extension.</p>
          {reps.map(function (r, i) {
            return <div key={i} className="flex gap-2 mb-3 items-end">
              <div className="flex-1"><label className="text-[9px] text-slate-500 uppercase tracking-wider block mb-1">Name</label><input type="text" value={r.name} onChange={function (e) { handleRepChange(i, 'name', e.target.value); }} placeholder="John Doe" className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-violet-500/50" /></div>
              <div className="flex-1"><label className="text-[9px] text-slate-500 uppercase tracking-wider block mb-1">Email</label><input type="email" value={r.email} onChange={function (e) { handleRepChange(i, 'email', e.target.value); }} placeholder="john@company.com" className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-violet-500/50" /></div>
              <div className="flex-1"><label className="text-[9px] text-slate-500 uppercase tracking-wider block mb-1">Phone</label><input type="text" value={r.phone} onChange={function (e) { handleRepChange(i, 'phone', e.target.value); }} placeholder="+1234567890" className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-violet-500/50" /></div>
              <button onClick={function () { removeRepRow(i); }} disabled={reps.length <= 1} className="bg-red-500/10 hover:bg-red-500/20 text-red-300 disabled:opacity-30 px-2 py-2 rounded-lg text-xs transition-all">&times;</button>
            </div>;
          })}
          <button onClick={addRepRow} className="text-xs text-violet-400 hover:text-violet-300 transition-all">+ Add another rep</button>
        </div>}

        {step === 3 && <div>
          <h1 className="text-2xl font-bold mb-2">Configure Routing</h1>
          <p className="text-slate-400 mb-6">Choose how leads are distributed to your team.</p>
          <div className="flex gap-3 mb-6">
            <label className={'flex-1 cursor-pointer p-4 rounded-xl border transition-all ' + (routingMethod === 'ROUND_ROBIN' ? 'bg-violet-500/10 border-violet-500/30' : 'bg-white/[0.02] border-white/10 hover:border-white/20')}>
              <input type="radio" name="routing" value="ROUND_ROBIN" checked={routingMethod === 'ROUND_ROBIN'} onChange={function (e) { setRoutingMethod(e.target.value); }} className="sr-only" />
              <p className="text-sm font-semibold text-white">Round Robin</p>
              <p className="text-[10px] text-slate-400 mt-1">Leads rotate evenly between all active reps.</p>
            </label>
            <label className={'flex-1 cursor-pointer p-4 rounded-xl border transition-all ' + (routingMethod === 'PERCENTAGE' ? 'bg-violet-500/10 border-violet-500/30' : 'bg-white/[0.02] border-white/10 hover:border-white/20')}>
              <input type="radio" name="routing" value="PERCENTAGE" checked={routingMethod === 'PERCENTAGE'} onChange={function (e) { setRoutingMethod(e.target.value); }} className="sr-only" />
              <p className="text-sm font-semibold text-white">Percentage-Based</p>
              <p className="text-[10px] text-slate-400 mt-1">Top reps receive more leads based on percentage.</p>
            </label>
          </div>
        </div>}
      </div>

      <div className="flex justify-between mt-6">
        <button onClick={function () { setStep(Math.max(0, step - 1)); }} disabled={step === 0} className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white disabled:opacity-30 border border-white/10 hover:border-white/20 transition-all">Back</button>
        {step < 3
          ? <button onClick={function () { setStep(step + 1); }} disabled={step === 0 && !companyName.trim()} className="bg-[#6344E3] hover:bg-[#5035C4] text-white px-6 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50 transition-all">Continue</button>
          : <button onClick={finish} disabled={submitting} className="bg-[#6344E3] hover:bg-[#5035C4] text-white px-6 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50 transition-all">{submitting ? 'Setting up...' : 'Finish Setup'}</button>
        }
      </div>
    </div>
  </div>;
}
