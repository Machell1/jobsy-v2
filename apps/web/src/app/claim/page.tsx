import type { Metadata } from 'next';
import { ClaimSearch } from './claim-search';
import { ClaimCodeInput } from './claim-code-input';

export const metadata: Metadata = {
  title: 'Claim Your Business - Jobsy',
  description: 'Search for your business on Jobsy and claim your free provider profile. Take control of your listing today.',
};

export default function ClaimPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-emerald-700 to-emerald-900 text-white">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-emerald-200 mb-3">For Service Providers</p>
          <h1 className="text-4xl font-extrabold sm:text-5xl">
            Already listed on Jobsy?
          </h1>
          <p className="mt-4 text-lg text-emerald-100 max-w-2xl mx-auto">
            We've pre-listed thousands of Jamaican service providers. Search for your business and take control of your profile - it's completely free.
          </p>
        </div>
      </div>

      {/* Claim Code Section */}
      <div className="mx-auto max-w-4xl px-4 pt-10 sm:px-6 lg:px-8">
        <ClaimCodeInput />
      </div>

      {/* Search + Results */}
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <ClaimSearch />
      </div>

      {/* Not found CTA */}
      <div className="mx-auto max-w-4xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-[var(--border)] bg-white p-8 text-center">
          <h3 className="text-lg font-bold text-gray-900">Don't see your business?</h3>
          <p className="mt-2 text-sm text-gray-600 max-w-md mx-auto">
            No worries - you can register as a new provider and start listing your services right away.
          </p>
          <a
            href="/register"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-6 py-3 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
          >
            Register as a Provider
          </a>
        </div>
      </div>
    </div>
  );
}
