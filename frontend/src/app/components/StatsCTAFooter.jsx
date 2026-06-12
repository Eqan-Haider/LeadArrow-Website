'use client';
import Link from 'next/link';

export function StatsSection() {
  return (
    <section className="py-16 px-6 relative z-10">
      <div className="max-w-4xl mx-auto">
        <div
          className="relative rounded-2xl overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(15,23,42,0.85), rgba(15,23,42,0.6))',
            border: '1px solid rgba(255,255,255,0.08)',
            backdropFilter: 'blur(24px)',
            boxShadow: '0 20px_60px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.07)',
          }}
        >
          <div className="absolute inset-x-0 top-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(37,99,235,0.5), transparent)' }} />
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(37,99,235,0.07), transparent 60%)' }} />
          <div className="relative grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x" style={{ '--tw-divide-opacity': 1, borderColor: 'rgba(255,255,255,0.06)' }}>
            {[
              { value: '500+', label: 'Sales teams', icon: '👥' },
              { value: '99.9%', label: 'Uptime guarantee', icon: '⚡' },
              { value: '< 5 sec', label: 'Average alert speed', icon: '🚀' },
            ].map((stat, idx) => (
              <div
                key={idx}
                className="flex flex-col items-center py-10 px-6 text-center"
                style={{ borderColor: 'rgba(255,255,255,0.06)' }}
              >
                <span className="text-2xl mb-3">{stat.icon}</span>
                <p className="text-[46px] font-black text-white tracking-tight leading-none">{stat.value}</p>
                <p className="mt-2 text-[13px] text-slate-500 font-semibold">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function FinalCTASection() {
  return (
    <section className="py-28 px-6 relative z-10 overflow-hidden">
      {/* Glow blobs */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        style={{ width: '700px', height: '400px', borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(37,99,235,0.14), transparent 70%)', filter: 'blur(60px)' }}
      />
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        style={{ width: '400px', height: '200px', borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(99,102,241,0.1), transparent 70%)', filter: 'blur(40px)' }}
      />
      <div className="relative max-w-3xl mx-auto text-center">
        <div
          className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-bold text-emerald-300 mb-6"
          style={{ borderColor: 'rgba(16,185,129,0.25)', background: 'rgba(16,185,129,0.07)' }}
        >
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
          </span>
          14-day free trial — no credit card required
        </div>
        <h2
          className="text-4xl sm:text-5xl lg:text-[64px] font-black tracking-[-0.03em] leading-[1.04]"
          style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #e2e8f0 40%, #93c5fd 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          Ready to never miss<br />a lead again?
        </h2>
        <p className="mt-5 text-[17px] text-slate-400 leading-relaxed">
          Join 500+ sales teams who close faster with LeadArrow.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/signup"
            className="group relative overflow-hidden rounded-2xl px-10 py-4 text-[15px] font-black text-white transition-all duration-300 hover:scale-[1.03] active:scale-[0.96]"
            style={{ background: 'linear-gradient(135deg, #2563eb, #4f46e5)', boxShadow: '0 8px 40px rgba(37,99,235,0.5)' }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-white/10" />
            <div className="absolute inset-x-0 top-0 h-px bg-white/25" />
            <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 bg-gradient-to-r from-transparent via-white/12 to-transparent skew-x-12" />
            <span className="relative">Start Free Trial →</span>
          </Link>
          <a
            href="#"
            className="rounded-2xl border border-white/10 bg-white/[0.04] px-8 py-4 text-[15px] font-semibold text-slate-300 backdrop-blur hover:border-white/20 hover:bg-white/[0.08] hover:text-white transition-all duration-200"
          >
            Book a Demo
          </a>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer
      className="relative z-10 py-16 px-6"
      style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 mb-14">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-5 group w-fit">
              <div className="relative">
                <div
                  className="absolute -inset-1.5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: 'rgba(37,99,235,0.2)', filter: 'blur(8px)' }}
                />
                <div
                  className="relative rounded-xl p-1.5"
                  style={{ border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)' }}
                >
                  <img src="/leadarrow-logo.png" alt="LeadArrow" className="h-7 w-auto object-contain" />
                </div>
              </div>
              <span className="text-[14px] font-black text-white">LeadArrow</span>
            </Link>
            <p className="text-[13px] text-slate-500 leading-relaxed max-w-[230px]">
              Speed-to-lead platform for high-ticket sales teams. Connect your CRM and never miss a fast lead again.
            </p>
          </div>

          {/* Product */}
          <FooterCol title="Product" links={[['How It Works','#how-it-works'],['Features','#features'],['Integrations','#integrations'],['Pricing','#pricing']]} />
          {/* Company */}
          <FooterCol title="Company" links={[['About','/about'],['Contact','/contact'],['Book a Call','#'],['FAQ','#faq']]} />
          {/* Account */}
          <FooterCol title="Account" links={[['Sign In','/login'],['Sign Up','/signup'],['Privacy Policy','/privacy'],['Terms of Service','/terms']]} />
        </div>

        <div
          className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
        >
          <p className="text-[12px] text-slate-600">
            &copy; {new Date().getFullYear()} LeadArrow. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link href="/privacy" className="text-[12px] text-slate-600 hover:text-slate-400 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="text-[12px] text-slate-600 hover:text-slate-400 transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }) {
  return (
    <div>
      <h4 className="text-[11px] font-black text-white mb-4 uppercase tracking-[0.14em]">{title}</h4>
      <ul className="space-y-3">
        {links.map(([label, href]) => (
          <li key={label}>
            <Link href={href} className="text-[13px] text-slate-500 hover:text-slate-300 transition-colors duration-200">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
