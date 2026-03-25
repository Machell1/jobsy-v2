'use client';

import Link from 'next/link';
import Image from 'next/image';
import type { Service } from '@jobsy/shared';
import { formatCurrency } from '@jobsy/shared';

function StarRating({ rating, count }: { rating?: number; count: number }) {
  const stars = rating ?? 0;
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          className={`h-4 w-4 ${i <= Math.round(stars) ? 'text-[var(--accent)]' : 'text-gray-300'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="text-xs text-gray-500 ml-1">({count})</span>
    </div>
  );
}

interface ServiceCardProps {
  service: Service & {
    provider?: { name: string };
    category?: { name: string; slug: string };
  };
}

export function ServiceCard({ service }: ServiceCardProps) {
  const imageUrl = service.images?.[0]?.url;

  return (
    <Link
      href={`/services/${service.id}`}
      className="group block rounded-xl border border-[var(--border)] bg-white overflow-hidden hover:shadow-lg transition-shadow"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] bg-gray-100">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={service.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        {/* Category badge */}
        {service.category && (
          <span className="absolute top-3 left-3 rounded-full bg-white/90 backdrop-blur-sm px-3 py-1 text-xs font-medium text-gray-700">
            {service.category.name}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-2">
        <h3 className="font-semibold text-gray-900 line-clamp-1 group-hover:text-[var(--primary)] transition-colors">
          {service.title}
        </h3>

        {service.provider && (
          <p className="text-sm text-gray-500">{service.provider.name}</p>
        )}

        <StarRating rating={service.averageRating} count={service.totalReviews} />

        <div className="flex items-center justify-between pt-1">
          <span className="font-bold text-[var(--primary)]">
            {formatCurrency(service.priceMin, service.priceCurrency)}
            {service.priceMax && (
              <span className="text-gray-400 font-normal text-sm">
                {' '}&ndash; {formatCurrency(service.priceMax, service.priceCurrency)}
              </span>
            )}
          </span>
          <span className="text-xs text-gray-500 flex items-center gap-1">
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {service.parish}
          </span>
        </div>
      </div>
    </Link>
  );
}
