'use client';

import Link from 'next/link';
import Image from 'next/image';
import type { Service } from '@jobsy/shared';
import { formatCurrency } from '@jobsy/shared';

const CATEGORY_GRADIENTS: Record<string, string> = {
  'plumbing':        'from-blue-400 to-blue-600',
  'electrical':      'from-yellow-400 to-amber-500',
  'home-cleaning':   'from-teal-400 to-emerald-500',
  'beauty-hair':     'from-pink-400 to-rose-500',
  'landscaping':     'from-green-400 to-emerald-600',
  'construction':    'from-orange-400 to-amber-600',
  'auto-repair':     'from-slate-400 to-gray-600',
  'catering':        'from-red-400 to-orange-500',
  'event-planning':  'from-purple-400 to-violet-500',
  'photography':     'from-indigo-400 to-blue-500',
  'tutoring':        'from-cyan-400 to-sky-500',
  'tech-support':    'from-blue-500 to-indigo-600',
  'fitness-training':'from-lime-400 to-green-500',
  'painting':        'from-yellow-300 to-orange-400',
  'pet-care':        'from-amber-300 to-yellow-500',
  'tailoring':       'from-fuchsia-400 to-pink-500',
  'moving':          'from-gray-400 to-slate-500',
  'other':           'from-emerald-400 to-teal-500',
};

const CATEGORY_INITIALS: Record<string, string> = {
  'plumbing': 'PL', 'electrical': 'EL', 'home-cleaning': 'HC',
  'beauty-hair': 'BH', 'landscaping': 'LS', 'construction': 'CO',
  'auto-repair': 'AR', 'catering': 'CA', 'event-planning': 'EP',
  'photography': 'PH', 'tutoring': 'TU', 'tech-support': 'TS',
  'fitness-training': 'FT', 'painting': 'PA', 'pet-care': 'PC',
  'tailoring': 'TL', 'moving': 'MV', 'other': 'OT',
};

function StarRating({ rating, count }: { rating?: number | null; count: number }) {
  if (rating == null) {
    return (
      <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
        New
      </span>
    );
  }
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          className={`h-3.5 w-3.5 ${i <= Math.round(rating) ? 'text-amber-400' : 'text-gray-200'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="text-xs text-gray-400 ml-0.5">({count})</span>
    </div>
  );
}

interface ServiceCardProps {
  service: Service & {
    provider?: { name: string; verificationStatus?: string };
    category?: { name: string; slug: string };
  };
}

export function ServiceCard({ service }: ServiceCardProps) {
  const imageUrl = service.images?.[0]?.url;
  const catSlug = service.category?.slug ?? 'other';
  const gradient = CATEGORY_GRADIENTS[catSlug] ?? 'from-emerald-400 to-teal-500';
  const initials = CATEGORY_INITIALS[catSlug] ?? '??';

  return (
    <Link
      href={`/services/${service.id}`}
      className="group block rounded-2xl border border-[var(--border)] bg-white overflow-hidden hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
    >
      {/* Image / gradient placeholder */}
      <div className="relative aspect-[16/9]">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={service.title ?? 'Service'}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className={`flex h-full items-center justify-center bg-gradient-to-br ${gradient}`}>
            <span className="text-4xl font-black text-white/30 select-none">{initials}</span>
          </div>
        )}

        {/* Category badge */}
        {service.category?.name && (
          <span className="absolute top-3 left-3 rounded-full bg-white/90 backdrop-blur-sm px-2.5 py-0.5 text-xs font-semibold text-gray-800 shadow-sm">
            {service.category.name}
          </span>
        )}

        {/* Unverified badge */}
        {service.provider?.verificationStatus !== 'APPROVED' && (
          <span className="absolute top-3 right-3 rounded-full bg-orange-100/90 backdrop-blur-sm px-2.5 py-0.5 text-xs font-medium text-orange-700 shadow-sm">
            Unverified
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 line-clamp-1 group-hover:text-[var(--primary)] transition-colors text-[15px]">
          {service.title ?? 'Untitled Service'}
        </h3>

        {service.provider?.name && (
          <p className="mt-0.5 text-xs text-gray-500">{service.provider.name}</p>
        )}

        <div className="mt-2">
          <StarRating
            rating={service.averageRating}
            count={(service as any).reviewCount ?? (service as any).totalReviews ?? 0}
          />
        </div>

        <div className="mt-3 flex items-center justify-between">
          <div className="text-sm font-bold text-[var(--primary)]">
            {service.priceMin != null
              ? formatCurrency(service.priceMin, service.priceCurrency ?? 'JMD')
              : 'Contact for price'}
            {service.priceMax != null && (
              <span className="font-normal text-gray-400">
                {' - '}{formatCurrency(service.priceMax, service.priceCurrency ?? 'JMD')}
              </span>
            )}
          </div>
          {service.parish && (
            <span className="flex items-center gap-1 text-[11px] text-gray-400">
              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {service.parish}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
