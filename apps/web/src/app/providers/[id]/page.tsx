import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';
import type { Metadata } from 'next';
import type { User, Service, Review, PaginatedResponse } from '@jobsy/shared';
import { formatDate } from '@jobsy/shared';
import { ServiceCard } from '@/components/ServiceCard';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { apiFetch } from '@/lib/api';

async function getProvider(id: string): Promise<User | null> {
  try {
    return await apiFetch<User>(`/api/providers/${id}`, {
      next: { revalidate: 120 },
    });
  } catch {
    return null;
  }
}

async function getProviderServices(providerId: string) {
  try {
    const res = await apiFetch<
      PaginatedResponse<
        Service & { provider?: { name: string }; category?: { name: string; slug: string } }
      >
    >(`/api/services?providerId=${providerId}&limit=12`, { next: { revalidate: 120 } });
    return res?.data ?? [];
  } catch {
    return [];
  }
}

async function getProviderReviews(providerId: string) {
  try {
    const res = await apiFetch<
      PaginatedResponse<Review & { reviewer?: { name: string; avatarUrl?: string } }>
    >(`/api/providers/${providerId}/reviews?limit=10`, { next: { revalidate: 120 } });
    return res?.data ?? [];
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const provider = await getProvider(id);
  if (!provider) return { title: 'Provider Not Found' };
  return {
    title: `${provider.name} - Service Provider`,
    description: provider.bio?.slice(0, 160) ?? `View ${provider.name}'s services and reviews on Jobsy.`,
  };
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          className={`h-5 w-5 ${i <= Math.round(rating) ? 'text-[var(--accent)]' : 'text-gray-300'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

async function ProviderContent({ id }: { id: string }) {
  const [provider, services, reviews] = await Promise.all([
    getProvider(id),
    getProviderServices(id),
    getProviderReviews(id),
  ]);

  if (!provider) notFound();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Profile header */}
      <div className="rounded-xl border border-[var(--border)] bg-white p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          {/* Avatar */}
          <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-[var(--primary)] text-3xl font-bold text-white">
            {provider.name.charAt(0)}
          </div>

          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{provider.name}</h1>
              {provider.verificationStatus === 'APPROVED' && (
                <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
                  <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Verified Provider
                </span>
              )}
            </div>

            {provider.parish && (
              <p className="mt-1 flex items-center gap-1 text-sm text-gray-500">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {provider.parish}
              </p>
            )}

            <p className="mt-1 text-sm text-gray-500">
              Member since {formatDate(provider.createdAt)}
            </p>

            {provider.bio && (
              <p className="mt-4 text-gray-700 leading-relaxed">{provider.bio}</p>
            )}
          </div>
        </div>
      </div>

      {/* Services */}
      <section className="mt-10">
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          Services ({services.length})
        </h2>
        {services.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {services.map((service: any) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        ) : (
          <p className="py-8 text-center text-gray-500">
            This provider hasn&apos;t listed any services yet.
          </p>
        )}
      </section>

      {/* Reviews */}
      <section className="mt-10">
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          Reviews ({reviews.length})
        </h2>
        {reviews.length > 0 ? (
          <div className="space-y-0 divide-y divide-[var(--border)] rounded-xl border border-[var(--border)] bg-white">
            {reviews.map((review: any) => (
              <div key={review.id} className="p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-200 text-sm font-bold text-gray-600">
                    {review.reviewer?.name?.charAt(0) ?? '?'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">
                        {review.reviewer?.name ?? 'Anonymous'}
                      </span>
                      <span className="text-xs text-gray-500">{formatDate(review.createdAt)}</span>
                    </div>
                    <div className="mt-1">
                      <StarRating rating={review.rating} />
                    </div>
                    <p className="mt-2 text-sm text-gray-700 leading-relaxed">{review.comment}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="py-8 text-center text-gray-500">No reviews yet.</p>
        )}
      </section>
    </div>
  );
}

export default async function ProviderProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      }
    >
      <ProviderContent id={id} />
    </Suspense>
  );
}
