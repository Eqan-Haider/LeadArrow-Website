export default function AlternatePricing({ bookingUrl }) {
  const pricingFactors = [
    'Number of active reps',
    'CRM used',
    'Monthly lead volume',
    'Phone/SMS usage',
    'USA/Canada vs. international reps',
    'Routing and reporting needs',
  ];
  const features = [
    'CRM lead detection',
    'Phone and Chrome extension alerts',
    'Rep accept/decline',
    'Automatic fallback routing',
    'Round robin and percentage‑based routing',
    'Rep availability controls',
    'Manager dashboard',
    'Lead history and reporting',
    'Pickup rate and connection rate tracking',
  ];

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm">
      <div className="text-center mb-12">
        <h3 className="text-3xl font-bold text-white mb-2">Pricing &amp; Plans</h3>
        <p className="text-gray-300">Speed‑to‑lead software for high‑ticket sales teams.</p>
        <p className="mt-2 text-2xl font-extrabold text-blue-400">Plans start at $750/month.</p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <h4 className="text-lg font-semibold text-white mb-3">Final pricing depends on:</h4>
          <ul className="space-y-2 text-gray-300">
            {pricingFactors.map((f, i) => (
              <li key={i} className="flex items-start gap-2">
                <svg className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                {f}
              </li>
            ))}
          </ul>
          <p className="text-sm text-gray-400 italic mt-6">
            Book a free consultation and we’ll recommend the best plan for your team.
          </p>
          <a
            href={bookingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-4 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:bg-blue-700 transition"
          >
            Book a Free Consultation →
          </a>
        </div>
        <div>
          <h4 className="text-lg font-semibold text-white mb-3">All plans can include:</h4>
          <ul className="space-y-2 text-gray-300">
            {features.map((f, i) => (
              <li key={i} className="flex items-start gap-2">
                <svg className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                {f}
              </li>
            ))}
          </ul>
          <div className="mt-8 border-l-4 border-blue-500 bg-white/5 p-5 rounded-r-lg">
            <blockquote className="text-lg italic font-medium text-gray-200">
              “If your team misses even one extra high‑ticket deal because of slow lead response, the platform can pay for itself.”
            </blockquote>
          </div>
          <a
            href={bookingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-6 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:bg-blue-700 transition"
          >
            Book a Free Consultation →
          </a>
        </div>
      </div>
    </div>
  );
}