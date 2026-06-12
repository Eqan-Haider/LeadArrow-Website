'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import BackgroundSystem from './components/BackgroundSystem.jsx';
import { HowItWorksSection, FeaturesSection } from './components/ContentSections.jsx';
import { FaqSection } from './components/IntegrationsAndFaq.jsx';
import { StatsSection, FinalCTASection, Footer } from './components/StatsCTAFooter.jsx';
import BookingModal from './components/BookingModal';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar.jsx';
import HeroSection from './components/HeroSection.jsx';
import RoleSwitcher from './components/RoleSwitcher.jsx';

function CharReveal({ text, className, delay = 0, baseDelay = 0 }) {
  return (
    <span className={className}>
      {text.split('').map((ch, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 20, rotateX: -90, scale: 0.5 }}
          whileInView={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: baseDelay + i * 0.025, type: 'spring', stiffness: 150, damping: 12 }}
          className="inline-block"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {ch === ' ' ? '\u00A0' : ch}
        </motion.span>
      ))}
    </span>
  );
}

export default function HomePage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const canvasRef = useRef(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [pricingTab, setPricingTab] = useState('plans');
  const [repCount, setRepCount] = useState(1);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const { isPremium: ctxIsPremium } = useAuth();
  const [hasPremium, setHasPremium] = useState(false);

  useEffect(() => {
    setHasPremium(!!localStorage.getItem('premiumLicenseKey') || ctxIsPremium);
    const onMove = (e) => setMousePos({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w = canvas.width = window.innerWidth;
    let h = canvas.height = window.innerHeight;
    const pts = [];
    const rings = [];

    for (let i = 0; i < 160; i++) {
      pts.push({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4,
        s: Math.random() * 2 + 0.5, a: Math.random() * 0.4 + 0.05,
      });
    }

    for (let i = 0; i < 5; i++) {
      const rp = [];
      for (let j = 0; j < 36; j++) {
        const a = (j / 36) * Math.PI * 2;
        rp.push({ x: Math.cos(a), y: Math.sin(a), a });
      }
      rings.push({
        cx: Math.random() * w, cy: Math.random() * h,
        r: Math.random() * 140 + 50, ang: Math.random() * Math.PI * 2,
        sp: (Math.random() - 0.5) * 0.006, points: rp,
        cl: `rgba(139,92,246,${Math.random() * 0.1 + 0.03})`,
      });
    }

    let frame;
    function draw() {
      ctx.clearRect(0, 0, w, h);
      for (const p of pts) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.s, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(139,92,246,${p.a})`;
        ctx.fill();
      }
      for (const r of rings) {
        r.ang += r.sp;
        const cx = r.cx + Math.sin(r.ang * 0.3) * 18;
        const cy = r.cy + Math.cos(r.ang * 0.5) * 14;
        for (let j = 0; j < r.points.length; j++) {
          const p = r.points[j];
          const x = cx + p.x * r.r;
          const y = cy + p.y * r.r * 0.35;
          ctx.beginPath();
          ctx.arc(x, y, 1.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(167,139,250,${0.12 + 0.1 * Math.sin(p.a + r.ang * 2)})`;
          ctx.fill();
          if (j % 4 === 0) {
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(167,139,250,${0.04})`;
            ctx.fill();
          }
        }
      }
      frame = requestAnimationFrame(draw);
    }
    draw();
    const onResize = () => { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; };
    window.addEventListener('resize', onResize);
    return () => { window.removeEventListener('resize', onResize); if (frame) cancelAnimationFrame(frame); };
  }, []);

  const decreaseReps = () => setRepCount((prev) => Math.max(1, prev - 1));
  const increaseReps = () => setRepCount((prev) => prev + 1);

  return (
    <>
      <style>{`
        * { box-sizing: border-box; }
        @keyframes scrollHorizontal {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll { animation: scrollHorizontal 28s linear infinite; }
        @keyframes orbFloatA { 0%,100% { transform: translateY(0px) scale(1); } 50% { transform: translateY(-35px) scale(1.04); } }
        @keyframes orbFloatB { 0%,100% { transform: translateY(0px) scale(1); } 50% { transform: translateY(28px) scale(0.97); } }
        @keyframes orbFloatC { 0%,100% { transform: translateY(0px) scale(1); } 50% { transform: translateY(-22px) scale(1.03); } }
        @keyframes neonPulse { 0%,100% { opacity: 0.6; transform: scale(1); } 50% { opacity: 1; transform: scale(1.08); } }
        @keyframes spinSlow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes cubeRotate { 0% { transform: rotateX(20deg) rotateY(0deg); } 100% { transform: rotateX(20deg) rotateY(360deg); } }
        @keyframes cardFloat { 0%,100% { transform: rotateY(-8deg) rotateX(5deg) rotateZ(-1.5deg) translateY(0px); } 50% { transform: rotateY(-8deg) rotateX(5deg) rotateZ(-1.5deg) translateY(-10px); } }
        @keyframes pulseBar { 0%,100% { opacity: 0.7; } 50% { opacity: 1; } }
        @keyframes lineSlide { 0%,100% { transform: translateX(0) scaleX(1); opacity: 0.4; } 50% { transform: translateX(30px) scaleX(1.2); opacity: 0.8; } }
        html { scroll-behavior: smooth; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #030711; }
        ::-webkit-scrollbar-thumb { background: rgba(37,99,235,0.3); border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(37,99,235,0.5); }
      `}</style>

      <div className="min-h-screen text-white overflow-x-hidden" style={{ fontFamily: "DM Sans, Instrument Sans, system-ui, sans-serif", background: '#030711' }}>
        <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />
        <div className="fixed inset-0 pointer-events-none z-0">
          <motion.div className="absolute w-[50%] h-[50%] rounded-full bg-violet-600/6 blur-[180px]" animate={{ left: `${mousePos.x * 18}%`, top: `${mousePos.y * 18}%` }} transition={{ type: 'spring', stiffness: 12, damping: 10 }} />
          <motion.div className="absolute w-[45%] h-[45%] rounded-full bg-indigo-600/5 blur-[160px]" animate={{ right: `${(1 - mousePos.x) * 18}%`, bottom: `${(1 - mousePos.y) * 18}%` }} transition={{ type: 'spring', stiffness: 12, damping: 10 }} />
          <div className="absolute inset-0 opacity-[0.012]" style={{backgroundImage:'linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)', backgroundSize:'48px 48px'}} />
        </div>
        <div className="fixed top-4 right-4 z-30 flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/70 backdrop-blur border border-emerald-500/20 shadow-lg">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">{hasPremium ? 'Premium Active' : 'System Online'}</span>
        </div>

        <BackgroundSystem />
        <Navbar />

        <main>
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <HeroSection />
            <HowItWorksSection />
            <FeaturesSection />
          </div>

          <section id="integrations" className="py-24 bg-white/5 overflow-hidden">
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-16">
              <motion.span initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-sm font-semibold uppercase tracking-widest text-blue-400">Seamless Integrations</motion.span>
              <CharReveal text="Works with your favorite tools" className="mt-4 text-3xl font-bold text-white sm:text-4xl block" baseDelay={0.2} />
              <motion.p initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.5 }} className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">
                Connect LeadArrow to your existing CRM and communication platforms.
              </motion.p>
            </div>
            <div className="relative w-full overflow-hidden">
              <div className="flex gap-8 w-max animate-scroll">
                {['Close CRM', 'Salesforce', 'HubSpot', 'Pipedrive', 'GoHighLevel', 'ActiveCampaign', 'Slack', 'Zapier', 'Twilio', 'Telnyx'].map((tool, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                    className="inline-block rounded-2xl border border-white/10 bg-white/5 px-8 py-4 backdrop-blur-sm text-white font-semibold text-lg transition-all duration-300 hover:scale-110 hover:border-blue-400 hover:shadow-[0_0_20px_rgba(59,130,246,0.8)] cursor-default"
                  >{tool}</motion.div>
                ))}
                {['Close CRM', 'Salesforce', 'HubSpot', 'Pipedrive', 'GoHighLevel', 'ActiveCampaign', 'Slack', 'Zapier', 'Twilio', 'Telnyx'].map((tool, i) => (
                  <div key={`dup-${i}`} className="inline-block rounded-2xl border border-white/10 bg-white/5 px-8 py-4 backdrop-blur-sm text-white font-semibold text-lg transition-all duration-300 hover:scale-110 hover:border-blue-400 hover:shadow-[0_0_20px_rgba(59,130,246,0.8)] cursor-default">{tool}</div>
                ))}
              </div>
            </div>
          </section>

          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <StatsSection />
          </div>

          <section id="pricing" className="py-24 bg-white/5">
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-12">
              <motion.span initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-sm font-semibold uppercase tracking-widest text-blue-400">Simple Pricing</motion.span>
              <CharReveal text="Start free, scale as you grow" className="mt-4 text-4xl font-bold text-white sm:text-5xl block" baseDelay={0.15} />
              <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.4 }} className="mt-4 text-lg text-gray-300">All plans include unlimited calling. Cancel anytime.</motion.p>
              <div className="mt-10 inline-flex items-center bg-slate-900/50 border border-white/10 rounded-full p-1.5">
                <button onClick={() => setPricingTab('plans')} className={`px-6 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${pricingTab === 'plans' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-gray-300 hover:text-white'}`}>Plan Details</button>
                <button onClick={() => setPricingTab('consultation')} className={`px-6 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${pricingTab === 'consultation' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-gray-300 hover:text-white'}`}>Consultation Pricing</button>
              </div>
            </div>

            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {pricingTab === 'plans' && (
                <div className="grid gap-8 lg:grid-cols-3">
                  {[
                    { id: 'starter', name: 'Starter', price: '$750', period: 'mo', sub: 'For small teams', features: ['1 CRM connection','Phone + Chrome extension alerts','Round-robin & percentage-based routing','Basic dashboard & lead history','Up to 1,000 routed leads/month'], cls: 'border-white/10 bg-slate-950/40 hover:border-blue-500/30' },
                    { id: 'pro', name: 'Pro', price: '$1,500', period: 'mo', sub: 'For growing teams', features: ['Everything in Starter','Advanced routing & rep schedules','Lead source filters & analytics','Priority support','Up to 5,000 routed leads/month'], cls: 'border-blue-400/30 bg-gradient-to-b from-blue-500/10 to-slate-950/40 scale-105 z-10', popular: true },
                    { id: 'enterprise', name: 'Enterprise', price: 'Custom', period: '', sub: 'Unlimited scale', features: ['Custom rep count','All features + flexible CRM integrations','SSO/SAML & dedicated success manager','Multi-location & advanced telephony routing','Advanced SLA & security review'], cls: 'border-white/10 bg-slate-950/40 hover:border-blue-500/30', priceSub: 'Starting at $5,000/mo' },
                  ].map((plan, i) => (
                    <motion.div key={plan.id} initial={{ opacity: 0, y: 30, rotateX: 15 }} whileInView={{ opacity: 1, y: 0, rotateX: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.12, type: 'spring', stiffness: 100, damping: 13 }} whileHover={{ y: -5 }}
                      className={`rounded-3xl border ${plan.cls} backdrop-blur-xl p-8 flex flex-col transition relative`} style={{ transformStyle: 'preserve-3d', perspective: 600 }}
                    >
                      {plan.popular && <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-bold px-4 py-1 rounded-full">MOST POPULAR</div>}
                      <motion.h3 className="text-2xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">{plan.name}</motion.h3>
                      <p className="text-sm text-gray-400 mt-1">{plan.sub}</p>
                      <p className="text-5xl font-extrabold text-white mt-6">{plan.price}<span className="text-lg font-normal text-gray-400">/{plan.period}</span></p>
                      {plan.priceSub && <p className="text-sm text-gray-400 mt-2">{plan.priceSub}</p>}
                      <ul className="mt-8 space-y-3 text-sm text-gray-300 flex-1">
                        {plan.features.map((f, j) => (
                          <li key={j} className="flex items-start gap-2"><span className="text-green-400 text-lg leading-none mt-0.5">✦</span><span>{f}</span></li>
                        ))}
                      </ul>
                      <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                        onClick={() => router.push(`/checkout?plan=${plan.id}&origin=landing`)}
                        className={`mt-6 block w-full rounded-xl py-3 text-center text-sm font-bold transition ${plan.popular ? 'bg-white text-blue-600 hover:bg-gray-100' : 'border border-white/20 text-white hover:bg-white/10'}`}
                      >Buy Now</motion.button>
                    </motion.div>
                  ))}
                </div>
              )}

              {pricingTab === 'consultation' && (
                <div className="max-w-6xl mx-auto">
                  <div className="bg-slate-950/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-10">
                    <div className="text-center mb-10">
                      <h3 className="text-3xl font-bold text-white">Pricing &amp; Plans</h3>
                      <p className="text-lg text-gray-300 mt-2">Speed-to-lead software for high-ticket sales teams.</p>
                      <div className="mt-4 inline-block bg-blue-500/10 border border-blue-400/20 rounded-full px-5 py-1.5">
                        <span className="text-blue-400 font-semibold text-sm">Plans start at $750/month</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
                      <div className="flex flex-col justify-between bg-slate-950/40 border border-white/10 rounded-3xl p-8">
                        <div>
                          <h4 className="text-xl font-semibold text-white mb-4">Final pricing depends on:</h4>
                          <ul className="space-y-3 text-sm text-gray-300">
                            <li className="flex items-center justify-between">
                              <span className="flex items-center gap-3"><span className="text-green-400 text-lg leading-none mt-0.5">✦</span><span>Number of active reps</span></span>
                              <span className="flex items-center gap-2">
                                <button onClick={decreaseReps} className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-sm transition flex items-center justify-center">−</button>
                                <span className="text-lg font-bold text-white min-w-[2rem] text-center">{repCount}</span>
                                <button onClick={increaseReps} className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-sm transition flex items-center justify-center">+</button>
                              </span>
                            </li>
                            {['CRM used','Monthly lead volume','Phone/SMS usage','USA/Canada vs. international reps','Routing and reporting needs'].map((item, idx) => (
                              <li key={idx} className="flex items-start gap-3"><span className="text-green-400 text-lg leading-none mt-0.5">✦</span><span>{item}</span></li>
                            ))}
                          </ul>
                          <div className="mt-4 p-3 bg-blue-500/10 border border-blue-400/20 rounded-xl">
                            <p className="text-sm text-blue-300">Estimated base: <span className="font-bold text-white">${repCount * 75}/mo</span></p>
                            <p className="text-xs text-gray-400 mt-1">(Final enterprise volume discount applied during call)</p>
                          </div>
                        </div>
                        <button onClick={() => setIsBookingModalOpen(true)} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-4 text-sm font-semibold text-white shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_35px_rgba(37,99,235,0.7)] hover:scale-[1.02] transition-all duration-300 self-start">Book a Free Consultation →</button>
                      </div>
                      <div className="flex flex-col justify-between bg-slate-950/40 border border-white/10 rounded-3xl p-8">
                        <div>
                          <h4 className="text-xl font-semibold text-white mb-4">All plans can include:</h4>
                          <ul className="space-y-3 text-sm text-gray-300">
                            {['Multi-CRM lead sync (GoHighLevel, Close, etc.)','Phone and Chrome extension alerts','Rep accept/decline','Automatic fallback routing','Round robin and percentage-based routing','Rep availability controls','Manager dashboard','Lead history and reporting'].map((item, idx) => (
                              <li key={idx} className="flex items-start gap-3"><span className="text-green-400 text-lg leading-none mt-0.5">✦</span><span>{item}</span></li>
                            ))}
                          </ul>
                        </div>
                        <button onClick={() => setIsBookingModalOpen(true)} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-4 text-sm font-semibold text-white shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_35px_rgba(37,99,235,0.7)] hover:scale-[1.02] transition-all duration-300 self-start">Book a Free Consultation →</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>

          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <FaqSection />
            <FinalCTASection />
          </div>
        </main>

        <Footer />
        <BookingModal isOpen={isBookingModalOpen} onClose={() => setIsBookingModalOpen(false)} />
        <RoleSwitcher />

        {user && (
          <div className="fixed bottom-4 left-4 z-30 flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/70 backdrop-blur border border-violet-500/20 shadow-lg">
            <span className={`w-2 h-2 rounded-full ${user.role === 'PREMIUM_SUBSCRIBER' ? 'bg-amber-400' : user.role === 'SUPER_ADMIN' ? 'bg-emerald-400' : 'bg-blue-400'}`} />
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              {user.role === 'PREMIUM_SUBSCRIBER' ? 'PREMIUM' : user.role === 'SUPER_ADMIN' ? 'ADMIN' : 'REP'}
            </span>
            <span className="text-[9px] text-slate-600">·</span>
            <span className="text-[9px] text-slate-600">{user.email || ''}</span>
          </div>
        )}
      </div>
    </>
  );
}
