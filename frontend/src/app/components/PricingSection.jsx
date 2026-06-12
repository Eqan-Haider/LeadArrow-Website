'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

function PricingCard({ name, sub, price, period, priceSub, features, planId, featured }) {
  const router = useRouter();
  return (
    <div
      className="relative rounded-2xl flex flex-col overflow-hidden transition-all duration-300 hover:-translate-y-2"
      style={{
        background: featured
          ? 'linear-gradient(135deg, rgba(15,23,42,0.95), rgba(20,30,60,0.9))'
          : 'linear-gradient(135deg, rgba(15,23,42,0.7), rgba(15,23,42,0.5))',
        border: featured ? '1px solid rgba(37,99,235,0.5)' : '1px solid rgba(255,255,255,0.07)',
        backdropFilter: 'blur(20px)',
        boxShadow: featured
          ? '0 0 80px rgba(37,99,235,0.2), 0 30px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)'
          : '0 8px 30px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04)',
      }}
    >
      {featured && (
        <>
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(135deg, rgba(37,99,235,0.12) 0%, transparent 60%)' }} />
          <div className="absolute inset-x-0 top-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(99,130,246,0.9), transparent)' }} />
          <div className="absolute inset-x-0 bottom-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(37,99,235,0.3), transparent)' }} />
        </>
      )}
      <div className="relative p-6 flex flex-col flex-1">
        {featured && (
          <span
            className="absolute top-4 right-4 rounded-full px-2.5 py-0.5 text-[10px] font-black text-blue-300 uppercase tracking-widest"
            style={{ background: 'rgba(37,99,235,0.2)', border: '1px solid rgba(37,99,235,0.4)' }}
          >
            Popular
          </span>
        )}
        <h3 className="text-[18px] font-black text-white">{name}</h3>
        <p className={`text-[12px] mt-0.5 ${featured ? 'text-blue-300' : 'text-slate-500'}`}>{sub}</p>
        <div className="mt-5 mb-6">
          <span className="text-[42px] font-black text-white tracking-tight leading-none">{price}</span>
          {period && <span className={`text-[14px] font-normal ml-1 ${featured ? 'text-blue-300' : 'text-slate-500'}`}>{period}</span>}
          {priceSub && <p className="text-[12px] text-slate-500 mt-1">{priceSub}</p>}
        </div>
        <ul className="space-y-2.5 flex-1 mb-6">
          {features.map((f, i) => (
            <li key={i} className="flex items-start gap-2.5">
              <svg
                className={`h-4 w-4 flex-shrink-0 mt-0.5 ${featured ? 'text-blue-400' : 'text-emerald-500'}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span className={`text-[12px] leading-relaxed ${featured ? 'text-slate-300' : 'text-slate-500'}`}>{f}</span>
            </li>
          ))}
        </ul>
        <button
          onClick={() => router.push(`/checkout?plan=${planId}&origin=landing`)}
          className="group relative block w-full rounded-xl py-3 text-center text-[13px] font-black overflow-hidden transition-all duration-200 hover:scale-[1.02] active:scale-[0.97]"
          style={featured ? {
            background: 'linear-gradient(135deg, #2563eb, #4f46e5)',
            boxShadow: '0 4px 24px rgba(37,99,235,0.5)',
            color: 'white',
          } : {
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: 'rgb(203,213,225)',
          }}
        >
          {featured && (
            <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12" />
          )}
          <span className="relative">Buy Now</span>
        </button>
      </div>
    </div>
  );
}

export default function PricingSection({ onBookConsultation }) {
  const [tab, setTab] = useState('plans');

  return (
    <section id="pricing" className="py-28 px-6 relative z-10">
      <div className="absolute inset-x-0 top-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.04), transparent)' }} />
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <span className="inline-block text-[11px] font-black uppercase tracking-[0.2em] text-blue-400 mb-4">Simple Pricing</span>
          <h2 className="text-4xl sm:text-5xl font-black tracking-[-0.025em] text-white">Start free, scale as you grow</h2>
          <p className="mt-4 text-[16px] text-slate-400">All plans include unlimited calling. Cancel anytime.</p>

          {/* Toggle */}
          <div
            className="mt-8 inline-flex gap-1 p-1 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            {['plans', 'consultation'].map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className="px-5 py-2 rounded-lg text-[13px] font-bold transition-all duration-200"
                style={tab === t ? {
                  background: 'linear-gradient(135deg, #2563eb, #4f46e5)',
                  color: 'white',
                  boxShadow: '0 2px 12px rgba(37,99,235,0.45)',
                } : { color: 'rgb(148,163,184)' }}
              >
                {t === 'plans' ? 'Plan Details' : 'Consultation Pricing'}
              </button>
            ))}
          </div>
        </div>

        {tab === 'plans' && (
          <div className="grid gap-4 lg:grid-cols-4">
            <PricingCard name="Starter" sub="For small teams" price="$750" period="/mo"
              features={['1 CRM connection','Phone + Chrome extension alerts','Round-robin & percentage-based routing','Basic dashboard & lead history','Up to 1,000 routed leads/month']}
              planId="starter" featured={false} />
            <PricingCard name="Growth" sub="Most popular" price="$1,500" period="/mo"
              features={['Everything in Starter','Advanced routing & rep schedules','Lead source filters & analytics','Priority support','Up to 5,000 routed leads/month']}
              planId="growth" featured={true} />
            <PricingCard name="Scale" sub="For growing teams" price="$3,000" period="/mo"
              features={['Everything in Growth','Multiple teams & routing groups','Custom dashboards & CSV exports','API/webhook access','Up to 15,000 routed leads/month']}
              planId="scale" featured={false} />
            <PricingCard name="Enterprise" sub="Unlimited scale" price="Custom" period=""
              priceSub="Starting at $5,000/mo"
              features={['Custom rep count','All features + custom CRM workflows','SSO/SAML & dedicated success manager','Multi-location & custom Telnyx config','Advanced SLA & security review']}
              planId="enterprise" featured={false} />
          </div>
        )}

        {tab === 'consultation' && (
          <div className="max-w-4xl mx-auto">
            <div
              className="relative rounded-2xl overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(15,23,42,0.9), rgba(15,23,42,0.7))',
                border: '1px solid rgba(255,255,255,0.1)',
                backdropFilter: 'blur(24px)',
                boxShadow: '0 20px 80px rgba(0,0,0,0.5)',
              }}
            >
              <div className="absolute inset-x-0 top-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(99,130,246,0.7), transparent)' }} />
              <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(135deg, rgba(37,99,235,0.05), transparent 60%)' }} />
              <div className="relative p-8 md:p-12">
                <h3 className="text-3xl font-black text-white tracking-tight mb-2">Pricing &amp; Plans</h3>
                <p className="text-[16px] text-slate-300 mb-1">Speed-to-lead software for high-ticket sales teams.</p>
                <p className="text-[14px] text-slate-500 mb-6 leading-relaxed">
                  Our platform instantly alerts the right sales rep by phone and Chrome extension when a new CRM lead comes in.
                </p>
                <p className="text-2xl font-black text-blue-400 mb-10">Plans start at $750/month.</p>
                <div className="grid gap-8 md:grid-cols-2">
                  <div>
                    <h4 className="text-[15px] font-black text-white mb-4">Final pricing depends on:</h4>
                    <ul className="space-y-2.5">
                      {['Number of active reps','CRM used','Monthly lead volume','Phone/SMS usage','USA/Canada vs. international reps','Routing and reporting needs'].map((item, idx) => (
                        <li key={idx} className="flex items-center gap-2.5 text-[13px] text-slate-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                    <p className="text-[12px] text-slate-600 italic mt-6 leading-relaxed">
                      Book a free consultation and we will recommend the best plan for your team.
                    </p>
                    <button
                      onClick={onBookConsultation}
                      className="group relative overflow-hidden inline-flex items-center gap-2 mt-4 rounded-xl px-5 py-2.5 text-[13px] font-black text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.97]"
                      style={{ background: 'linear-gradient(135deg, #2563eb, #4f46e5)', boxShadow: '0 4px 20px rgba(37,99,235,0.45)' }}
                    >
                      <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12" />
                      <span className="relative">Book a Free Consultation</span>
                      <svg className="relative w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </button>
                  </div>
                  <div>
                    <h4 className="text-[15px] font-black text-white mb-4">All plans can include:</h4>
                    <ul className="space-y-2.5">
                      {['CRM lead detection','Phone and Chrome extension alerts','Rep accept/decline','Automatic fallback routing','Round robin and percentage-based routing','Rep availability controls','Manager dashboard','Lead history and reporting','Pickup rate and connection rate tracking'].map((item, idx) => (
                        <li key={idx} className="flex items-center gap-2.5 text-[13px] text-slate-400">
                          <svg className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                          {item}
                        </li>
                      ))}
                    </ul>
                    <div
                      className="mt-6 rounded-xl p-5"
                      style={{ borderLeft: '2px solid #3b82f6', background: 'rgba(255,255,255,0.02)' }}
                    >
                      <p className="text-[14px] italic font-medium text-slate-300 leading-relaxed">
                        &ldquo;If your team misses even one extra high-ticket deal because of slow lead response, the platform can pay for itself.&rdquo;
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
