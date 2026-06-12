import Link from 'next/link';

export default function PricingAltPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Navbar – simple, with logo */}
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
        {/* Heading */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold sm:text-5xl">Pricing &amp; Plans</h1>
          <p className="mt-4 text-lg text-gray-300 max-w-2xl mx-auto">
            Speed‑to‑lead software for high‑ticket sales teams.
          </p>
          <p className="mt-6 text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Our platform instantly alerts the right sales rep by phone and Chrome extension when a new CRM lead comes in, helping your team respond faster and close more opportunities.
          </p>
          <p className="mt-4 text-3xl font-extrabold text-blue-400">
            Plans start at $750/month.
          </p>
        </div>

        {/* Two-column layout: details left, features right */}
        <div className="grid gap-12 lg:grid-cols-2">
          {/* Left – Pricing factors */}
          <div>
            <h2 className="text-xl font-semibold text-white mb-4">Final pricing depends on:</h2>
            <ul className="space-y-3 text-gray-300">
              {[
                'Number of active reps',
                'CRM used',
                'Monthly lead volume',
                'Phone/SMS usage',
                'USA/Canada vs. international reps',
                'Routing and reporting needs',
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <svg className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" ></path>
                  </svg>
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <p className="mt-8 text-sm text-gray-400 italic">
              Book a free consultation and we’ll recommend the best plan for your team.
            </p>
            <a
              href="#"
              className="mt-4 inline-block rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:bg-blue-700 transition"
            >
              Book a Free Consultation →
            </a>
          </div>

          {/* Right – What all plans include */}
          <div>
            <h2 className="text-xl font-semibold text-white mb-4">All plans can include:</h2>
            <ul className="space-y-3 text-gray-300">
              {[
                'CRM lead detection',
                'Phone and Chrome extension alerts',
                'Rep accept/decline',
                'Automatic fallback routing',
                'Round robin and percentage‑based routing',
                'Rep availability controls',
                'Manager dashboard',
                'Lead history and reporting',
                'Pickup rate and connection rate tracking',
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <svg className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" ></path>
                  </svg>
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            {/* Quote / Callout block */}
            <div className="mt-10 border-l-4 border-blue-500 bg-white/5 p-5 rounded-r-lg">
              <p className="text-lg font-medium text-gray-200 italic">
                &ldquo;If your team misses even one extra high‑ticket deal because of slow lead response, the platform can pay for itself.&rdquo;
              </p>
            </div>

            <a
              href="#"
              className="mt-6 inline-block rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:bg-blue-700 transition"
            >
              Book a Free Consultation →
            </a>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} LeadArrow Inc.
      </footer>
    </div>
  );
}