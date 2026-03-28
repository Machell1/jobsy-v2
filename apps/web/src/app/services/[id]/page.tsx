import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import type { Service, Review, User, Category, PaginatedResponse } from '@jobsy/shared';
import { formatCurrency, formatDate } from '@jobsy/shared';
import { apiFetch } from '@/lib/api';

type ServiceDetail = Service & {
  provider?: User;
  category?: Category;
};

async function getService(id: string): Promise<ServiceDetail | null> {
  try {
    return await apiFetch<ServiceDetail>(`/api/services/${id}`, {
      next: { revalidate: 60 },
    });
  } catch {
    return null;
  }
}

async function getReviews(serviceId: string) {
  try {
    const res = await apiFetch<PaginatedResponse<Review & { reviewer?: { name: string; avatarUrl?: string } }>>(
      `/api/services/${serviceId}/reviews?limit=10`,
      { next: { revalidate: 120 } }
    );
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
  const service = await getService(id);
  if (!service) return { title: 'Service Not Found' };
  return {
    title: service.title,
    description: service.description.slice(0, 160),
    openGraph: {
      title: service.title,
      description: service.description.slice(0, 160),
      images: service.images?.[0]?.url ? [service.images[0].url] : [],
    },
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

function ImageGallery({ images, categorySlug }: { images: Service['images']; categorySlug?: string }) {
  const CATEGORY_GRADIENTS: Record<string, string> = {
    'plumbing': 'from-blue-400 to-blue-600', 'electrical': 'from-yellow-400 to-amber-500',
    'home-cleaning': 'from-teal-400 to-emerald-500', 'beauty-hair': 'from-pink-400 to-rose-500',
    'landscaping': 'from-green-400 to-emerald-600', 'construction': 'from-orange-400 to-amber-600',
    'auto-repair': 'from-slate-400 to-gray-600', 'catering': 'from-red-400 to-orange-500',
    'event-planning': 'from-purple-400 to-violet-500', 'photography': 'from-indigo-400 to-blue-500',
    'tutoring': 'from-cyan-400 to-sky-500', 'tech-support': 'from-blue-500 to-indigo-600',
    'fitness-training': 'from-lime-400 to-green-500', 'painting': 'from-yellow-300 to-orange-400',
    'pet-care': 'from-amber-300 to-yellow-500', 'tailoring': 'from-fuchsia-400 to-pink-500',
    'moving': 'from-gray-400 to-slate-500', 'other': 'from-emerald-400 to-teal-500',
  };

  if (!images || images.length === 0) {
    const gradient = CATEGORY_GRADIENTS[categorySlug ?? 'other'] ?? 'from-emerald-400 to-teal-500';
    return (
      <div className={`flex aspect-video items-center justify-center rounded-2xl bg-gradient-to-br ${gradient}`}>
        <svg className="h-20 w-20 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Main image */}
      <div className="relative aspect-video overflow-hidden rounded-xl bg-gray-100">
        <Image
          src={images[0].url}
          alt="Service main image"
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 60vw"
          priority
        />
      </div>
      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-3">
          {images.slice(1, 5).map((img) => (
            <div key={img.id} className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
              <Image
                src={img.url}
                alt="Service image"
                fill
                className="object-cover"
                sizes="15vw"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ReviewCard({
  review,
}: {
  review: Review & { reviewer?: { name: string; avatarUrl?: string } };
}) {
  return (
    <div className="border-b border-[var(--border)] py-5 last:border-0">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-200 text-sm font-bold text-gray-600">
          {review.reviewer?.name?.charAt(0) ?? '?'}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900">{review.reviewer?.name ?? 'Anonymous'}</span>
            <span className="text-xs text-gray-500">{formatDate(review.createdAt)}</span>
          </div>
          <div className="mt-1">
            <StarRating rating={review.rating} />
          </div>
          <p className="mt-2 text-sm text-gray-700 leading-relaxed">{review.comment}</p>
        </div>
      </div>
    </div>
  );
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [service, reviews] = await Promise.all([getService(id), getReviews(id)]);

  if (!service) notFound();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumbs */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-gray-500">
        <Link href="/services" className="hover:text-[var(--primary)]">
          Services
        </Link>
        <span>/</span>
        {service.category && (
          <>
            <Link href={`/categories/${service.category.slug}`} className="hover:text-[var(--primary)]">
              {service.category.name}
            </Link>
            <span>/</span>
          </>
        )}
        <span className="text-gray-900">{service.title}</span>
      </nav>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-5">
        {/* Left column: images + description */}
        <div className="lg:col-span-3 space-y-8">
          <ImageGallery images={service.images} categorySlug={service.category?.slug} />

          {/* Title + rating */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">{service.title}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-4">
              {service.averageRating != null && (
                <div className="flex items-center gap-2">
                  <StarRating rating={service.averageRating} />
                  <span className="text-sm text-gray-600">
                    {service.averageRating.toFixed(1)} ({service.totalReviews} reviews)
                  </span>
                </div>
              )}
              <span className="flex items-center gap-1 text-sm text-gray-500">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {service.parish}
              </span>
              {service.category && (
                <Link
                  href={`/categories/${service.category.slug}`}
                  className="rounded-full bg-[var(--primary-light)] px-3 py-1 text-xs font-semibold text-[var(--primary)]"
                >
                  {service.category.name}
                </Link>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">About This Service</h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">{service.description}</p>
            {service.tags && service.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {service.tags.map((tag: any) => (
                  <span
                    key={tag}
                    className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Map placeholder */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Location</h2>
            <div className="flex aspect-[2/1] items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 text-gray-400">
              <div className="text-center">
                <svg className="mx-auto h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <p className="mt-2 text-sm">{service.parish}{service.address ? ` - ${service.address}` : ''}</p>
              </div>
            </div>
          </div>

          {/* Reviews */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Reviews ({service.totalReviews})
            </h2>
            {reviews.length > 0 ? (
              <div className="divide-y divide-[var(--border)]">
                {reviews.map((review: any) => (
                  <ReviewCard key={review.id} review={review} />
                ))}
              </div>
            ) : (
              <p className="py-8 text-center text-gray-500">No reviews yet. Be the first to leave one!</p>
            )}
          </div>
        </div>

        {/* Right column: booking sidebar */}
        <div className="lg:col-span-2">
          <div className="sticky top-24 space-y-6">
            {/* Price card */}
            <div className="rounded-xl border border-[var(--border)] bg-white p-6 shadow-sm">
              <div className="mb-4">
                <span className="text-2xl font-bold text-gray-900">
                  {formatCurrency(service.priceMin, service.priceCurrency)}
                </span>
                {service.priceMax && (
                  <span className="text-gray-500">
                    {' '}&ndash; {formatCurrency(service.priceMax, service.priceCurrency)}
                  </span>
                )}
                <span className="ml-1 text-sm text-gray-500">/ {service.priceUnit.replace('_', ' ')}</span>
              </div>

              <Link
                href={`/booking/new?service=${service.id}`}
                className="block w-full rounded-lg bg-[var(--primary)] px-6 py-3 text-center font-semibold text-white transition-colors hover:opacity-90"
              >
                Book Now
              </Link>

              <p className="mt-3 text-center text-xs text-gray-500">
                Free cancellation up to 24 hours before
              </p>
            </div>

            {/* Provider card */}
            {service.provider && (
              <div className="rounded-xl border border-[var(--border)] bg-white p-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">About the Provider</h3>
                <Link
                  href={`/providers/${service.provider.id}`}
                  className="flex items-center gap-3 group"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--primary)] text-lg font-bold text-white">
                    {service.provider.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 group-hover:text-[var(--primary)] transition-colors">
                      {service.provider.name}
                    </p>
                    {service.provider.verificationStatus === 'APPROVED' && (
                      <span className="inline-flex items-center gap-1 text-xs text-green-600">
                        <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Verified
                      </span>
                    )}
                  </div>
                </Link>
                {service.provider.bio && (
                  <p className="mt-3 text-sm text-gray-600 line-clamp-3">{service.provider.bio}</p>
                )}
                <Link
                  href={`/providers/${service.provider.id}`}
                  className="mt-4 block text-center rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  View Full Profile
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
