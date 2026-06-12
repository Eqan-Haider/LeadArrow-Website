'use client';
import Link from 'next/link';

// ---------- CONFIG ----------
const SHOW_ALTERNATE_PRICING = true;
const CALL_BOOKING_LINK = "https://calendly.com/your-username/consultation"; // Replace with real Calendly link

// ---------- ALTERNATE PRICING COMPONENT ----------
function AlternatePricing({ bookingUrl }) {
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
    'Round robin and percentage-based routing',
    'Rep availability controls',
    'Manager dashboard',
    'Lead history and reporting',
    'Pickup rate and connection rate tracking',
  ];

  return (
    <div className="min-h-screen bg-[#091d33] text-white py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold sm:text-5xl">Pricing &amp; Plans</h1>
          <p className="mt-4 text-xl text-gray-300">Speed‑to‑lead software for high‑ticket sales teams.</p>
          <p className="mt-6 text-gray-400 max-w-2xl mx-auto">
            Our platform instantly alerts the right sales rep by phone and Chrome extension when a new CRM lead comes in,
            helping your team respond faster and close more opportunities.
          </p>
          <p className="mt-4 text-2xl font-extrabold text-blue-400">Plans start at $750/month.</p>
        </div>

        <div className="grid gap-12 md:grid-cols-2">
          {/* Left Column – Factors + CTA */}
          <div>
            <h2 className="text-2xl font-semibold mb-4">Final pricing depends on:</h2>
            <ul className="space-y-3">
              {pricingFactors.map((factor, i) => (
                <li key={i} className="flex items-start gap-3">
                  <svg className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-300">{factor}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8">
              <a
                href={bookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block rounded-lg bg-blue-600 px-8 py-4 text-sm font-semibold text-white shadow-lg hover:bg-blue-700 transition"
              >
                Book a Free Consultation
              </a>
            </div>
          </div>

          {/* Right Column – Features + Blockquote */}
          <div>
            <h2 className="text-2xl font-semibold mb-4">All plans can include:</h2>
            <ul className="space-y-3">
              {features.map((feat, i) => (
                <li key={i} className="flex items-start gap-3">
                  <svg className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-300">{feat}</span>
                </li>
              ))}
            </ul>

            {/* Value Statement Box */}
            <div className="mt-10 border-l-4 border-blue-500 bg-white/5 p-5 rounded-r-lg">
              <blockquote className="text-lg italic font-medium text-gray-200">
                “If your team misses even one extra high‑ticket deal because of slow lead response, the platform can pay for itself.”
              </blockquote>
            </div>

            <div className="mt-6">
              <a
                href={bookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block rounded-lg bg-blue-600 px-8 py-4 text-sm font-semibold text-white shadow-lg hover:bg-blue-700 transition"
              >
                Book a Free Consultation
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- PAGE COMPONENT ----------
export default function AlternatePricingPage() {
  // With the flag, you can easily switch back to a standard card layout later.
  return (
    <>
      {SHOW_ALTERNATE_PRICING ? (
        <AlternatePricing bookingUrl={CALL_BOOKING_LINK} />
      ) : (
        // Placeholder for standard pricing cards if you want to keep the same route
        <div className="min-h-screen bg-[#091d33] text-white flex items-center justify-center">
          <p>Standard pricing cards coming soon.</p>
        </div>
      )}
    </>
  );
}