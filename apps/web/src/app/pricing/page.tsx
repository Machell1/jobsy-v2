import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Pricing - Jobsy',
  description: 'Free for customers. Affordable plans for providers who want to grow faster. No commissions, ever.',
};

const plans = [
  {
    name: 'Free',
    price: 'J$0',
    period: 'forever',
    description: 'Everything you need to get started on Jobsy.',
    cta: 'Get Started Free',
    ctaHref: '/register',
    highlight: false,
    features: [
      'List up to 3 services',
      'Basic provider profile',
      'Receive booking requests',
      'In-app messaging with customers',
      'Customer reviews & ratings',
      'Access to 14 parish reach',
    ],
  },
  {
    name: 'Pro',
    price: 'J$1,500',
    period: '/month',
    description: 'For serious providers ready to scale their client base.',
    cta: 'Contact us to subscribe',
    ctaHref: 'mailto:admin@jobsyja.com?subject=Jobsy%20Pro%20Subscription',
    highlight: true,
    features: [
      'Unlimited service listings',
      'Priority placement in search',
      'Pro badge on your profile',
      'Booking analytics dashboard',
      'Advanced profile customisation',
      'Priority customer support',
      'Everything in Free',
    ],
  },
  {
    name: 'Business',
    price: 'J$3,500',
    period: '/month',
    description: 'Maximum visibility for established providers and teams.',
    cta: 'Contact us to subscribe',
    ctaHref: 'mailto:admin@jobsyja.com?subject=Jobsy%20Business%20Subscription',
    highlight: false,
    features: [
      'Promoted listings (homepage spotlight)',
      'Featured placement at top of search',
      'Verified badge on profile',
      'Ad campaign dashboard',
      'Full analytics & reporting',
      'Dedicated account manager',
      'Everything in Pro',
    ],
  },
];

function CheckIcon() {
  return (
    <svg className="h-5 w-5 shrink-0 text-[var(--primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
    </svg>
  );
}

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-[var(--border)]">
        <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-[var(--primary)] mb-3">Pricing</p>
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
            Free to book. <span className="text-[var(--primary)]">Grow faster</span> with Pro.
          </h1>
          <p className="mt-5 text-lg text-gray-600 max-w-2xl mx-auto">
            Customers always book for free. Providers choose the plan that fits their ambition.
            No commissions. No hidden fees. Cancel anytime.
          </p>
        </div>
      </div>

      {/* Plans */}
      <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col rounded-2xl border bg-white p-8 shadow-sm ${
                plan.highlight
                  ? 'border-[var(--primary)] ring-2 ring-[var(--primary)]'
                  : 'border-[var(--border)]'
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-[var(--primary)] px-4 py-1 text-xs font-bold uppercase tracking-wider text-white shadow">
                    Most Popular
                  </span>
                </div>
              )}

              <div>
                <h2 className="text-xl font-bold text-gray-900">{plan.name}</h2>
                <p className="mt-1 text-sm text-gray-500">{plan.description}</p>
                <div className="mt-5 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-gray-900">{plan.price}</span>
                  <span className="text-gray-500">{plan.period}</span>
                </div>
              </div>

              <ul className="mt-8 flex-1 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5">
                    <CheckIcon />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <a
                href={plan.ctaHref}
                className={`mt-8 block rounded-xl py-3 text-center text-sm font-semibold transition-opacity ${
                  plan.highlight
                    ? 'bg-[var(--primary)] text-white hover:opacity-90'
                    : 'border border-[var(--border)] text-gray-700 hover:bg-gray-50'
                }`}
              >
                {plan.cta}
              </a>
            </div>
          ))}
        </div>

        {/* FAQ / trust line */}
        <div className="mt-14 rounded-2xl bg-white border border-[var(--border)] p-8 text-center">
          <h3 className="text-xl font-bold text-gray-900 mb-2">Why no commission?</h3>
          <p className="text-gray-600 max-w-2xl mx-auto text-sm leading-relaxed">
            Jobsy is built on trust. Taking a cut of every job creates friction and discourages providers from using the platform.
            Instead, providers who want extra visibility pay a flat subscription - and everyone else uses Jobsy for free, forever.
          </p>
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
            {[
              { label: 'No commission', detail: '0% taken from any booking - providers keep 100%' },
              { label: 'No payment upfront', detail: 'Customers request bookings for free, pay directly to the provider' },
              { label: 'Cancel anytime', detail: 'Month-to-month subscriptions with no lock-in period' },
            ].map((item) => (
              <div key={item.label} className="flex gap-3">
                <div className="mt-0.5">
                  <CheckIcon />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{item.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Advertise section */}
        <div className="mt-10 rounded-2xl bg-gradient-to-br from-emerald-700 to-emerald-900 p-8 text-center text-white">
          <h3 className="text-xl font-bold mb-2">Want to advertise on Jobsy?</h3>
          <p className="text-emerald-100 text-sm max-w-lg mx-auto">
            Reach thousands of Jamaicans looking for services every week. Run banner campaigns, sponsored listings, and more.
          </p>
          <a
            href="mailto:ads@jobsyja.com"
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-emerald-800 hover:bg-emerald-50 transition-colors"
          >
            Contact Our Ads Team
          </a>
        </div>
      </div>
    </div>
  );
}
