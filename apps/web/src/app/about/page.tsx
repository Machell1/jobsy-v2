import Link from 'next/link';

export const metadata = {
  title: 'About Us',
  description:
    'Learn about Jobsy, Jamaica\'s trusted marketplace for local services. Our mission is to connect communities with reliable service providers.',
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Hero */}
      <div className="text-center mb-16">
        <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">About Jobsy</h1>
        <p className="mt-4 text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto">
          We&apos;re building Jamaica&apos;s most trusted platform for connecting people with
          skilled local service providers.
        </p>
      </div>

      {/* Mission */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
        <p className="text-gray-700 leading-relaxed">
          Jobsy was created to solve a simple problem: finding reliable service providers in
          Jamaica shouldn&apos;t be hard. Whether you need a plumber in Kingston, a caterer in
          Montego Bay, or a tutor in Mandeville, Jobsy makes it easy to discover, compare, and
          book trusted professionals.
        </p>
        <p className="mt-4 text-gray-700 leading-relaxed">
          Our mission is to empower local service providers by giving them a digital storefront
          to showcase their skills, while giving customers peace of mind through verified
          profiles and honest reviews. Jobsy is completely free to use — no commissions,
          no platform fees, no payment required to book. Providers keep 100% of what they earn.
        </p>
      </section>

      {/* How it works */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">How Jobsy Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: 'For Customers',
              items: [
                'Browse services by category or location',
                'Compare providers based on reviews and pricing',
                'Send booking requests for free — no payment upfront',
                'Leave reviews to help the community',
              ],
            },
            {
              title: 'For Providers',
              items: [
                'Create a professional profile for free',
                'List your services with photos and pricing',
                'Receive bookings and manage your schedule',
                'Get paid directly to your bank account',
              ],
            },
            {
              title: 'Trust & Safety',
              items: [
                'All providers undergo identity verification',
                'Reviews are from verified customers only',
                'Secure payment processing via Stripe',
                'Dedicated support team for disputes',
              ],
            },
          ].map((col) => (
            <div key={col.title} className="rounded-xl border border-[var(--border)] bg-white p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{col.title}</h3>
              <ul className="space-y-3">
                {col.items.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-gray-700">
                    <svg className="h-5 w-5 shrink-0 text-green-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Jamaica context */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Built for Jamaica</h2>
        <p className="text-gray-700 leading-relaxed">
          Jobsy is designed specifically for the Jamaican market. We support all 14 parishes,
          price services in Jamaican Dollars (JMD), and understand the unique needs of the local
          service economy. From the busy streets of Kingston to the scenic north coast, Jobsy is
          here to serve every community across the island.
        </p>
        <p className="mt-4 text-gray-700 leading-relaxed">
          We believe in the incredible talent and entrepreneurial spirit of Jamaican service
          providers. By giving them the right digital tools, we can help grow businesses, create
          jobs, and strengthen communities across the island.
        </p>
      </section>

      {/* Stats */}
      <section className="mb-16 rounded-xl bg-[var(--primary)] p-8 text-white">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: '14', label: 'Parishes Served' },
            { value: '18+', label: 'Service Categories' },
            { value: '1000+', label: 'Service Providers' },
            { value: '24/7', label: 'Customer Support' },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="text-3xl font-bold">{stat.value}</p>
              <p className="mt-1 text-sm text-blue-100">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to Get Started?</h2>
        <p className="text-gray-600 mb-6">
          Whether you&apos;re looking for a service or want to list your own, Jobsy has you covered.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link
            href="/services"
            className="inline-flex items-center justify-center rounded-lg bg-[var(--primary)] px-8 py-3 font-semibold text-white hover:opacity-90 transition-colors"
          >
            Find a Service
          </Link>
          <Link
            href="/register"
            className="inline-flex items-center justify-center rounded-lg border-2 border-[var(--primary)] px-8 py-3 font-semibold text-[var(--primary)] hover:bg-blue-50 transition-colors"
          >
            Become a Provider
          </Link>
        </div>
      </section>
    </div>
  );
}
