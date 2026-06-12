'use client';
import { useState } from 'react';

const INTEGRATIONS = [
  { name: 'Close CRM', icon: '🔗', desc: 'Native one-click connect', color: 'rgba(37,99,235,0.15)' },
  { name: 'Salesforce', icon: '☁️', desc: 'Enterprise CRM sync', color: 'rgba(6,182,212,0.15)' },
  { name: 'HubSpot', icon: '🟠', desc: 'Inbound lead routing', color: 'rgba(234,88,12,0.15)' },
  { name: 'Twilio', icon: '📱', desc: 'SMS & call delivery', color: 'rgba(239,68,68,0.15)' },
  { name: 'Telnyx', icon: '📞', desc: 'Custom phone config', color: 'rgba(16,185,129,0.15)' },
  { name: 'Chrome Extension', icon: '🌐', desc: 'Browser-level alerts', color: 'rgba(234,179,8,0.15)' },
  { name: 'Zapier', icon: '⚡', desc: 'Connect 5000+ apps', color: 'rgba(139,92,246,0.15)' },
  { name: 'Webhooks', icon: '🔄', desc: 'Custom API triggers', color: 'rgba(99,102,241,0.15)' },
];

const FAQS = [
  { q: 'How fast does LeadArrow alert my reps?', a: 'Within 2–5 seconds of a lead entering your CRM. Our infrastructure is built for sub-5-second delivery at scale, 24/7.' },
  { q: 'Which CRMs are supported?', a: 'Close CRM is natively supported with one-click authorization. Salesforce, HubSpot, and custom CRM connections via webhooks are available on Scale and Enterprise plans.' },
  { q: 'How does round-robin routing work?', a: 'Leads are distributed evenly across available reps. You can set percentage-based splits, schedules, or hard round-robin. If a rep declines or misses the call, it instantly rolls to the next rep.' },
  { q: 'Do reps need to install anything?', a: 'Reps install a lightweight Chrome extension for browser alerts. Phone alerts work immediately with just a phone number — no app required.' },
  { q: 'Is there a free trial?', a: 'Yes. You get full access to all features for 14 days with no credit card required. Cancel anytime.' },
  { q: 'What happens if a rep misses the alert?', a: 'LeadArrow automatically falls back to the next rep in the routing queue. You can configure fallback chains, time limits, and missed-lead notifications from the dashboard.' },
  { q: 'Can I use LeadArrow with international reps?', a: 'Yes. International phone routing is available on Growth and above. Pricing adjusts based on destination country. Book a consultation for a custom quote.' },
  { q: 'How does billing work?', a: 'All plans are billed monthly. You can upgrade, downgrade, or cancel at any time. Enterprise plans are billed annually with custom terms.' },
];

function SectionLabel({ children }) {
  return (
    <span className="inline-block text-[11px] font-black uppercase tracking-[0.2em] text-blue-400 mb-4">
      {children}
    </span>
  );
}

export function IntegrationsSection() {
  return (
    <section id="integrations" className="py-28 px-6 relative z-10">
      <div className="absolute inset-x-0 top-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.04), transparent)' }} />
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <SectionLabel>Integrations</SectionLabel>
          <h2 className="text-4xl sm:text-5xl font-black tracking-[-0.025em] text-white">Connects with your stack</h2>
          <p className="mt-4 text-[16px] text-slate-400 max-w-xl mx-auto leading-relaxed">
            Works seamlessly with the tools your team already uses. One-click setup, no engineering required.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {INTEGRATIONS.map((item, idx) => (
            <div
              key={idx}
              className="group relative rounded-2xl p-5 overflow-hidden transition-all duration-300 hover:-translate-y-1.5 cursor-pointer"
              style={{
                background: `linear-gradient(135deg, ${item.color} 0%, rgba(15,23,42,0.6) 100%)`,
                border: '1px solid rgba(255,255,255,0.07)',
                backdropFilter: 'blur(16px)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)',
              }}
            >
              <div className="absolute inset-x-0 top-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)' }} />
              <div
                className="absolute inset-y-0 left-0 w-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: 'linear-gradient(180deg, transparent, rgba(99,130,246,0.5), transparent)' }}
              />
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="text-2xl w-10 h-10 flex items-center justify-center rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  {item.icon}
                </div>
                <h3 className="text-[14px] font-black text-white">{item.name}</h3>
              </div>
              <p className="text-[12px] text-slate-500 leading-relaxed">{item.desc}</p>
              <div className="mt-3 inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 group-hover:text-slate-300 transition-colors duration-200">
                Learn more
                <svg className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </div>
          ))}
        </div>

        {/* More platforms strip */}
        <div
          className="mt-10 rounded-2xl p-6 overflow-hidden"
          style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.05)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <p className="text-center text-[11px] text-slate-600 uppercase tracking-[0.18em] font-bold mb-5">
            And many more platforms via webhooks &amp; API
          </p>
          <div className="flex flex-wrap justify-center items-center gap-4 opacity-35">
            {['Pipedrive','GoHighLevel','ActiveCampaign','Slack','Stripe','Intercom','Segment','Marketo'].map((name) => (
              <span
                key={name}
                className="text-[12px] font-semibold text-slate-400 px-3 py-1.5 rounded-lg"
                style={{ border: '1px solid rgba(255,255,255,0.08)' }}
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function FaqSection() {
  const [open, setOpen] = useState(null);

  return (
    <section id="faq" className="py-28 px-6 relative z-10">
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(180deg, transparent, rgba(99,102,241,0.04), transparent)' }} />
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <SectionLabel>FAQ</SectionLabel>
          <h2 className="text-4xl sm:text-5xl font-black tracking-[-0.025em] text-white">Frequently asked questions</h2>
          <p className="mt-4 text-[16px] text-slate-400">Everything you need to know before getting started.</p>
        </div>
        <div className="space-y-3">
          {FAQS.map((faq, idx) => (
            <div
              key={idx}
              className="relative rounded-2xl overflow-hidden transition-all duration-300"
              style={{
                background: open === idx ? 'rgba(15,23,42,0.85)' : 'rgba(15,23,42,0.5)',
                border: open === idx ? '1px solid rgba(37,99,235,0.35)' : '1px solid rgba(255,255,255,0.07)',
                backdropFilter: 'blur(16px)',
                boxShadow: open === idx ? '0 8px 40px rgba(37,99,235,0.15)' : 'none',
              }}
            >
              {open === idx && (
                <div className="absolute inset-x-0 top-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(99,130,246,0.7), transparent)' }} />
              )}
              <button
                onClick={() => setOpen(open === idx ? null : idx)}
                className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
              >
                <span className={`text-[15px] font-semibold transition-colors duration-200 ${open === idx ? 'text-white' : 'text-slate-300'}`}>
                  {faq.q}
                </span>
                <div
                  className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300"
                  style={{
                    border: open === idx ? '1px solid rgba(99,130,246,0.5)' : '1px solid rgba(255,255,255,0.12)',
                    background: open === idx ? 'rgba(37,99,235,0.2)' : 'rgba(255,255,255,0.04)',
                    transform: open === idx ? 'rotate(45deg)' : 'rotate(0deg)',
                  }}
                >
                  <svg className="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                </div>
              </button>
              {open === idx && (
                <div className="px-6 pb-5">
                  <p className="text-[14px] text-slate-400 leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
