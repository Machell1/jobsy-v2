export const metadata = {
  title: 'Privacy Policy',
  description: 'Jobsy Privacy Policy - Learn how we collect, use, and protect your personal information.',
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
      <p className="text-sm text-gray-500 mb-10">Last updated: January 1, 2025</p>

      <div className="prose prose-gray max-w-none space-y-8 text-gray-700 leading-relaxed">
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Introduction</h2>
          <p>
            Jobsy Ltd. (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;) is committed to
            protecting the privacy of our users. This Privacy Policy explains how we collect,
            use, disclose, and safeguard your information when you use our platform and services.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Information We Collect</h2>
          <p>We collect the following types of information:</p>
          <ul className="mt-3 space-y-2 list-disc list-inside">
            <li>
              <strong>Account Information:</strong> Name, email address, phone number, and
              profile details you provide when registering.
            </li>
            <li>
              <strong>Service Information:</strong> Details about services listed or booked,
              including descriptions, pricing, and images.
            </li>
            <li>
              <strong>Payment Information:</strong> Payment details processed securely through
              our payment partner, Stripe. We do not store full credit card numbers.
            </li>
            <li>
              <strong>Location Data:</strong> Parish and address information to match you with
              local service providers.
            </li>
            <li>
              <strong>Usage Data:</strong> Information about how you interact with the Platform,
              including pages visited, search queries, and device information.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">3. How We Use Your Information</h2>
          <p>We use the collected information to:</p>
          <ul className="mt-3 space-y-2 list-disc list-inside">
            <li>Provide, maintain, and improve the Platform</li>
            <li>Process bookings and payments</li>
            <li>Connect customers with relevant service providers</li>
            <li>Send transactional notifications (booking confirmations, receipts)</li>
            <li>Verify provider identities and maintain platform trust</li>
            <li>Respond to customer support inquiries</li>
            <li>Detect and prevent fraud or abuse</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Information Sharing</h2>
          <p>
            We may share your information with: (a) service providers you book with (your name
            and contact details); (b) payment processors for transaction processing; (c) law
            enforcement when required by law; and (d) service partners who help us operate the
            Platform under strict confidentiality agreements.
          </p>
          <p className="mt-3">
            We do not sell your personal information to third parties for marketing purposes.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Data Security</h2>
          <p>
            We implement appropriate technical and organizational measures to protect your
            personal information. This includes encryption of data in transit and at rest,
            regular security audits, and access controls. However, no method of transmission over
            the Internet is 100% secure.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Data Retention</h2>
          <p>
            We retain your personal information for as long as your account is active or as
            needed to provide services. We may retain certain data for a longer period as required
            by law or for legitimate business purposes such as resolving disputes and enforcing
            agreements.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Your Rights</h2>
          <p>You have the right to:</p>
          <ul className="mt-3 space-y-2 list-disc list-inside">
            <li>Access the personal information we hold about you</li>
            <li>Request correction of inaccurate information</li>
            <li>Request deletion of your account and personal data</li>
            <li>Opt out of marketing communications</li>
            <li>Export your data in a portable format</li>
          </ul>
          <p className="mt-3">
            To exercise these rights, contact us at{' '}
            <a href="mailto:privacy@jobsy.com" className="text-[var(--primary)] hover:underline">
              privacy@jobsy.com
            </a>.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Cookies</h2>
          <p>
            We use cookies and similar technologies to improve your experience, remember your
            preferences, and analyze Platform usage. You can manage cookie preferences through
            your browser settings. Essential cookies required for Platform functionality cannot be
            disabled.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Children&apos;s Privacy</h2>
          <p>
            The Platform is not intended for children under 18 years of age. We do not knowingly
            collect personal information from children. If we learn that we have collected
            information from a child, we will take steps to delete it promptly.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">10. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. Changes will be posted on this
            page with an updated effective date. We encourage you to review this page
            periodically.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Contact Us</h2>
          <p>
            If you have any questions or concerns about this Privacy Policy, please contact us at{' '}
            <a href="mailto:privacy@jobsy.com" className="text-[var(--primary)] hover:underline">
              privacy@jobsy.com
            </a>.
          </p>
        </section>
      </div>
    </div>
  );
}
