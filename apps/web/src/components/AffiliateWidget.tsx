'use client';

interface AffiliateWidgetProps {
  affiliateCode?: string;
  source?: string;
}

export function AffiliateWidget({ affiliateCode, source = 'web' }: AffiliateWidgetProps) {
  const handleClick = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.jobsyja.com';
      await fetch(`${API_URL}/api/ads/track-click`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          affiliateCode,
          targetUrl: `${window.location.origin}/register?ref=${affiliateCode}`,
          source,
        }),
      });
    } catch {
      // Non-critical — don't block navigation
    }
  };

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--primary-light)] p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--primary)]">
          <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-900">Know a skilled tradesperson?</p>
          <p className="mt-1 text-xs text-gray-600">
            Refer providers to Jobsy and help them grow their business — for free.
          </p>
          <a
            href={`/register?ref=${affiliateCode ?? 'affiliate'}&role=provider`}
            onClick={handleClick}
            className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-[var(--primary)] px-4 py-2 text-xs font-semibold text-white hover:opacity-90 transition-opacity"
          >
            Refer a Provider
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}
