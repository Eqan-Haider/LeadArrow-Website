import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="flex items-center justify-between px-6 lg:px-12 py-6 border-b border-white/10">
        <Link href="/" className="flex items-center">
          <img
            src="/leadarrow-logo.png"
            alt="LeadArrow"
            className="h-10 w-auto object-contain hover:opacity-90 transition-opacity"
          />
        </Link>
        <Link href="/" className="text-sm text-gray-300 hover:text-white transition">
          ← Back to Home
        </Link>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-20">
        <h1 className="text-4xl font-bold sm:text-5xl mb-6">About LeadArrow</h1>
        <div className="space-y-6 text-gray-300 leading-relaxed">
          <p className="text-xl text-white font-medium">
            We turn CRM leads into instant phone calls and browser alerts — so your sales team never misses a high‑ticket deal.
          </p>
          <p>
            LeadArrow was built for high‑ticket sales teams who know that **speed to lead** is the single biggest factor in closing premium deals. The moment a new prospect appears in your CRM, our platform simultaneously rings the assigned rep’s mobile phone and Chrome extension, presents the lead’s name and source, and lets them accept or pass with a single click.
          </p>
          <p>
            Founded by a team of sales technology veterans, LeadArrow is already trusted by over 500 sales teams worldwide. We integrate natively with Close CRM, HubSpot, Salesforce, and GoHighLevel — and we’re adding more every quarter.
          </p>
          <div className="grid gap-6 sm:grid-cols-3 my-10">
            {[
              { number: '500+', label: 'Sales teams' },
              { number: '99.9%', label: 'Uptime guarantee' },
              { number: '<5 sec', label: 'Average response' },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl border border-white/10 bg-white/5 p-5 text-center">
                <p className="text-3xl font-extrabold text-blue-400">{stat.number}</p>
                <p className="text-sm text-gray-400 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
          <p>
            Our mission is simple: eliminate the gap between a lead entering the CRM and a rep making contact. We believe every second counts, and our routing engine (round‑robin or percentage‑based) ensures the right rep is always alerted first.
          </p>
          <p>
            Whether you’re a small team of five or an enterprise with global offices, LeadArrow scales with you. We offer working‑hour schedules, per‑rep performance analytics, and a manager dashboard that shows you exactly how fast your team responds.
          </p>
        </div>
        <div className="mt-12 flex gap-4">
          <Link href="/signup" className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition">
            Start Free Trial →
          </Link>
          <Link href="/contact" className="rounded-lg bg-white/10 px-6 py-3 text-sm font-semibold text-white hover:bg-white/20 transition">
            Contact Sales
          </Link>
        </div>
      </main>

      <footer className="border-t border-white/10 py-8 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} LeadArrow Inc.
      </footer>
    </div>
  );
}