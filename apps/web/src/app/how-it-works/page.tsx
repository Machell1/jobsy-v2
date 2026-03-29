import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'How It Works - Jobsy',
  description: 'Learn how Jobsy connects customers with trusted service providers across Jamaica. Search, book, and review - completely free.',
};

export default function HowItWorksPage() {
  const steps = [
    {
      number: '01',
      title: 'Search for a Service',
      description: 'Browse by category, parish, or keyword. Filter by price, rating, or location to find the right provider for your needs.',
      icon: (
        <svg className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
        </svg>
      ),
    },
    {
      number: '02',
      title: 'Book Your Provider',
      description: 'Send a free booking request with your preferred date, time, and details. The provider will confirm your appointment.',
      icon: (
        <svg className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
        </svg>
      ),
    },
    {
      number: '03',
      title: 'Get It Done',
      description: 'Your provider arrives and delivers the service. After the job is complete, leave a review to help others in the community.',
      icon: (
        <svg className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
      ),
    },
  ];

  const forProviders = [
    {
      title: 'List Your Services',
      description: 'Create a free profile and add your services with descriptions, pricing, and service areas.',
    },
    {
      title: 'Receive Bookings',
      description: 'Get booking requests from customers in your area. Accept or decline based on your availability.',
    },
    {
      title: 'Grow Your Business',
      description: 'Build your reputation with reviews, add photos, and reach more customers across Jamaica.',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="bg-gradient-to-br from-emerald-700 to-emerald-900 text-white py-16 md:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold">How Jobsy Works</h1>
          <p className="mt-4 text-lg text-emerald-100 max-w-2xl mx-auto">
            Connecting Jamaica's customers with trusted service providers. Simple, free, and reliable.
          </p>
        </div>
      </div>

      {/* Steps for Customers */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold uppercase tracking-widest text-[var(--primary)] mb-2">For Customers</p>
            <h2 className="text-3xl font-bold text-gray-900">Find and Book in 3 Easy Steps</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            {steps.map((step) => (
              <div key={step.number} className="text-center">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-[var(--primary)]">
                  {step.icon}
                </div>
                <span className="text-xs font-bold text-emerald-500 uppercase tracking-widest">Step {step.number}</span>
                <h3 className="mt-2 text-xl font-semibold text-gray-900">{step.title}</h3>
                <p className="mt-2 text-gray-500 leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/services"
              className="inline-flex items-center gap-2 rounded-xl bg-[var(--primary)] px-8 py-3 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
            >
              Browse Services
            </Link>
          </div>
        </div>
      </section>

      {/* For Providers */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold uppercase tracking-widest text-[var(--primary)] mb-2">For Providers</p>
            <h2 className="text-3xl font-bold text-gray-900">Grow Your Business on Jobsy</h2>
            <p className="mt-2 text-gray-500">Completely free. No commissions. No hidden fees.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {forProviders.map((item, i) => (
              <div key={i} className="rounded-2xl border border-[var(--border)] bg-white p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-lg font-bold text-emerald-700 mb-4">
                  {i + 1}
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                <p className="mt-2 text-sm text-gray-500 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/claim"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-8 py-3 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
            >
              Claim Your Profile
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-8 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Register as Provider
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-10">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {[
              { q: 'Is Jobsy really free?', a: 'Yes. Jobsy is 100% free for both customers and providers. No commissions, no platform fees, no payment required to book.' },
              { q: 'How do I find a provider near me?', a: 'Use the search bar on the homepage or browse by category. You can filter by parish to find providers in your area.' },
              { q: 'How do providers get paid?', a: 'Providers handle payment directly with customers. Jobsy connects you - we don\'t process payments or take a cut.' },
              { q: 'Can I leave a review?', a: 'Yes! After a booking is completed, both customers and providers can leave reviews. Reviews help build trust in the community.' },
              { q: 'I\'m a provider. How do I get listed?', a: 'Register as a provider at jobsyja.com/register, or if your business is already listed, claim your profile at jobsyja.com/claim.' },
            ].map((faq) => (
              <div key={faq.q} className="rounded-xl border border-[var(--border)] p-5">
                <h3 className="font-semibold text-gray-900">{faq.q}</h3>
                <p className="mt-2 text-sm text-gray-500 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
