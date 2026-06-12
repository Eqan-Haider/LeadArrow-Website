'use client';

const STEPS = [
  { step: '01', title: 'Connect your CRM', desc: 'Authorize Close CRM with one click. We watch for new leads 24/7 without any extra configuration needed.', accent: 'rgba(37,99,235,0.2)', border: 'rgba(37,99,235,0.3)', num: '#3b82f6' },
  { step: '02', title: 'Add your reps', desc: 'Enter their phone numbers and have them install the Chrome extension. Takes under five minutes total.', accent: 'rgba(99,102,241,0.2)', border: 'rgba(99,102,241,0.3)', num: '#818cf8' },
  { step: '03', title: 'Start closing faster', desc: 'When a lead enters the CRM, LeadArrow instantly alerts the right rep — phone and browser, simultaneously.', accent: 'rgba(139,92,246,0.2)', border: 'rgba(139,92,246,0.3)', num: '#a78bfa' },
];

const FEATURES = [
  { icon: '⚡', title: 'Dual Alert System', desc: "Rep's phone rings simultaneously with their Chrome extension — zero lag, maximum coverage on every lead.", hover: 'rgba(234,179,8,0.15)' },
  { icon: '🔄', title: 'Round-Robin Routing', desc: 'Leads rotate evenly across your team. Set percentage splits or strict round-robin in under a minute.', hover: 'rgba(99,102,241,0.15)' },
  { icon: '🔗', title: 'Close CRM Integration', desc: 'Native one-click connection. Pulls lead name, source, and a direct CRM link automatically.', hover: 'rgba(59,130,246,0.15)' },
  { icon: '📞', title: 'Accept / Decline Controls', desc: 'Press 1 to accept or 2 to pass to the next available rep. Works entirely from the phone keypad.', hover: 'rgba(16,185,129,0.15)' },
  { icon: '📊', title: 'Live Dashboard', desc: 'Real-time response times, acceptance rates, and missed lead tracking across your entire team.', hover: 'rgba(168,85,247,0.15)' },
  { icon: '🔐', title: 'Enterprise Security', desc: 'License-key activation and role-based access ensure only paid, verified users reach premium features.', hover: 'rgba(239,68,68,0.15)' },
];

function SectionLabel({ children }) {
  return (
    <span className="inline-block text-[11px] font-black uppercase tracking-[0.2em] text-blue-400 mb-4">
      {children}
    </span>
  );
}

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-28 px-6 relative z-10">
      <div className="absolute inset-x-0 top-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.04), transparent)' }} />
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <SectionLabel>Simple Setup</SectionLabel>
          <h2 className="text-4xl sm:text-5xl font-black tracking-[-0.025em] text-white">How LeadArrow works</h2>
          <p className="mt-4 text-slate-400 text-[16px]">Three steps. No engineering required.</p>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {STEPS.map((item) => (
            <div
              key={item.step}
              className="group relative rounded-2xl p-8 overflow-hidden transition-all duration-300 hover:-translate-y-2 cursor-default"
              style={{
                background: `linear-gradient(135deg, rgba(15,23,42,0.8), rgba(15,23,42,0.5))`,
                border: `1px solid ${item.border}`,
                backdropFilter: 'blur(20px)',
                boxShadow: `0 8px 40px ${item.accent}, inset 0 1px 0 rgba(255,255,255,0.05)`,
              }}
            >
              {/* Top shimmer */}
              <div className="absolute inset-x-0 top-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${item.num}60, transparent)` }} />
              {/* Hover glow */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400"
                style={{ background: `radial-gradient(circle at 50% 0%, ${item.accent}, transparent 70%)` }}
              />
              {/* Left neon border sweep on hover */}
              <div
                className="absolute inset-y-0 left-0 w-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: `linear-gradient(180deg, transparent, ${item.num}, transparent)` }}
              />
              <div className="relative">
                <span className="text-[64px] font-black leading-none select-none" style={{ color: item.num, opacity: 0.2 }}>{item.step}</span>
                <h3 className="mt-3 text-[19px] font-black text-white tracking-tight">{item.title}</h3>
                <p className="mt-3 text-[14px] text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FeaturesSection() {
  return (
    <section id="features" className="py-28 px-6 relative z-10">
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(180deg, transparent, rgba(37,99,235,0.04), transparent)' }} />
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <SectionLabel>Why LeadArrow</SectionLabel>
          <h2 className="text-4xl sm:text-5xl font-black tracking-[-0.025em] text-white">Everything you need to respond instantly</h2>
          <p className="mt-4 max-w-2xl mx-auto text-[16px] text-slate-400 leading-relaxed">
            From dual-device alerts to intelligent routing — built for high-ticket sales teams.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((item, idx) => (
            <div
              key={idx}
              className="group relative rounded-2xl p-6 overflow-hidden transition-all duration-300 hover:-translate-y-1 cursor-default"
              style={{
                background: 'linear-gradient(135deg, rgba(15,23,42,0.7), rgba(15,23,42,0.4))',
                border: '1px solid rgba(255,255,255,0.07)',
                backdropFilter: 'blur(16px)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
              }}
            >
              {/* Top shimmer */}
              <div className="absolute inset-x-0 top-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.07), transparent)' }} />
              {/* Hover bg glow */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{ background: `radial-gradient(circle at 30% 0%, ${item.hover}, transparent 70%)` }}
              />
              {/* Left neon accent on hover */}
              <div
                className="absolute inset-y-0 left-0 w-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: 'linear-gradient(180deg, transparent, rgba(99,130,246,0.6), transparent)' }}
              />
              <div className="relative">
                <div
                  className="text-3xl mb-4 inline-block p-3 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08)' }}
                >
                  {item.icon}
                </div>
                <h3 className="text-[17px] font-black text-white mb-2 tracking-tight">{item.title}</h3>
                <p className="text-[13px] text-slate-500 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
