export const metadata = {
  title: 'Terms of Service',
  description: 'Jobsy Terms of Service - Read our terms and conditions for using the platform.',
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms of Service</h1>
      <p className="text-sm text-gray-500 mb-10">Last updated: January 1, 2025</p>

      <div className="prose prose-gray max-w-none space-y-8 text-gray-700 leading-relaxed">
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Acceptance of Terms</h2>
          <p>
            By accessing or using Jobsy (&quot;the Platform&quot;), you agree to be bound by these
            Terms of Service. If you do not agree to these terms, please do not use the Platform.
            The Platform is operated by Jobsy Ltd., a company registered in Jamaica.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Description of Service</h2>
          <p>
            Jobsy is an online marketplace that connects service providers with customers in
            Jamaica. The Platform facilitates the discovery, booking, and payment for local
            services. Jobsy does not itself provide any services listed on the Platform and is
            not a party to the agreement between service providers and customers.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">3. User Accounts</h2>
          <p>
            You must create an account to use certain features of the Platform. You are
            responsible for maintaining the confidentiality of your account credentials and for
            all activities that occur under your account. You agree to provide accurate and
            complete information when creating your account.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Service Providers</h2>
          <p>
            Service providers are independent contractors, not employees of Jobsy. Providers are
            responsible for the quality of their services, compliance with applicable laws, and
            payment of any applicable taxes. Jobsy reserves the right to verify provider
            identities and may remove providers who do not meet our quality standards.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Bookings and Payments</h2>
          <p>
            When you book a service through Jobsy, you agree to pay the listed price plus any
            applicable fees. Payments are processed securely through our payment partner. Jobsy
            charges a service fee for facilitating the transaction. Cancellation policies vary by
            provider and are displayed at the time of booking.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Reviews and Content</h2>
          <p>
            Users may leave reviews for services they have used. Reviews must be honest,
            accurate, and based on genuine experiences. Jobsy reserves the right to remove
            reviews that violate our guidelines. By posting content on the Platform, you grant
            Jobsy a non-exclusive license to use, display, and distribute that content.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Prohibited Conduct</h2>
          <p>
            Users must not: (a) use the Platform for any unlawful purpose; (b) harass, abuse, or
            threaten other users; (c) post false or misleading information; (d) attempt to
            circumvent Platform fees; (e) scrape or collect data from the Platform without
            permission; or (f) impersonate another person or entity.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Limitation of Liability</h2>
          <p>
            Jobsy is not liable for any disputes between service providers and customers, the
            quality of services provided, or any damages arising from the use of the Platform.
            Our liability is limited to the fees paid to Jobsy for the specific transaction in
            question.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Modifications</h2>
          <p>
            Jobsy reserves the right to modify these Terms of Service at any time. Changes will
            be posted on this page with an updated effective date. Continued use of the Platform
            after changes are posted constitutes acceptance of the modified terms.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">10. Governing Law</h2>
          <p>
            These Terms of Service are governed by the laws of Jamaica. Any disputes arising from
            these terms shall be resolved in the courts of Jamaica.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Contact</h2>
          <p>
            If you have any questions about these Terms of Service, please contact us at{' '}
            <a href="mailto:legal@jobsy.com" className="text-[var(--primary)] hover:underline">
              legal@jobsy.com
            </a>.
          </p>
        </section>
      </div>
    </div>
  );
}
