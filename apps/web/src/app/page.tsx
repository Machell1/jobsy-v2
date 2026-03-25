import Link from 'next/link';
import { Suspense } from 'react';
import type { Service, Category, PaginatedResponse } from '@jobsy/shared';
import { DEFAULT_CATEGORIES } from '@jobsy/shared';
import { ServiceCard } from '@/components/ServiceCard';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { apiFetch } from '@/lib/api';

async function getFeaturedServices() {
  try {
    const res = await apiFetch<PaginatedResponse<Service & { provider?: { name: string }; category?: { name: string; slug: string } }>>(
      '/api/services?sort=rating&limit=8',
      { next: { revalidate: 300 } }
    );
    return res?.data ?? [];
  } catch {
    return [];
  }
}

async function getCategories() {
  try {
    const res = await apiFetch<(Category & { serviceCount?: number })[]>(
      '/api/categories',
      { next: { revalidate: 600 } }
    );
    return res ?? [];
  } catch {
    return [];
  }
}

const CATEGORY_ICONS: Record<string, string> = {
  'spray-can': '🧹', wrench: '🔧', zap: '⚡', trees: '🌳', paintbrush: '🎨',
  truck: '🚚', 'book-open': '📖', camera: '📷', utensils: '🍽️', scissors: '✂️',
  car: '🚗', monitor: '💻', 'paw-print': '🐾', dumbbell: '💪', calendar: '📅',
  'hard-hat': '👷', shirt: '👔', grid: '📦',
};

function HeroSection() {
  return (
    <section className="relative bg-gradient-to-br from-blue-600 to-blue-800 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 md:py-28">
        <div className="max-w-2xl">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight">
            Find Trusted Services in Jamaica
          </h1>
          <p className="mt-6 text-lg md:text-xl text-blue-100 leading-relaxed">
            From home cleaning to auto repair, Jobsy connects you with verified local
            professionals across all 14 parishes.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <Link
              href="/services"
              className="inline-flex items-center justify-center rounded-lg bg-white text-blue-700 font-semibold px-8 py-3.5 hover:bg-blue-50 transition-colors"
            >
              Browse Services
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-lg border-2 border-white text-white font-semibold px-8 py-3.5 hover:bg-white/10 transition-colors"
            >
              Become a Provider
            </Link>
          </div>
        </div>
      </div>
      <div className="absolute inset-0 bg-[url('/hero-pattern.svg')] opacity-10 pointer-events-none" />
    </section>
  );
}

async function FeaturedServicesSection() {
  const services = await getFeaturedServices();

  return (
    <section className="py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Featured Services</h2>
            <p className="mt-2 text-gray-600">Top-rated professionals ready to help</p>
          </div>
          <Link href="/services" className="text-[var(--primary)] font-medium hover:underline hidden sm:block">
            View all &rarr;
          </Link>
        </div>
        {services.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service: any) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 py-12">
            Services are loading soon. Check back shortly!
          </p>
        )}
      </div>
    </section>
  );
}

async function CategoriesSection() {
  const apiCategories = await getCategories();
  const categories =
    apiCategories.length > 0
      ? apiCategories
      : DEFAULT_CATEGORIES.map((c, i) => ({
          id: c.slug,
          name: c.name,
          slug: c.slug,
          icon: c.icon,
          sortOrder: i,
          isActive: true,
          createdAt: new Date(),
          serviceCount: 0,
        }));

  return (
    <section className="py-16 md:py-20 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-gray-900 text-center">Browse by Category</h2>
        <p className="mt-2 text-gray-600 text-center">Find exactly what you need</p>
        <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {categories.slice(0, 12).map((cat: any) => (
            <Link
              key={cat.slug}
              href={`/categories/${cat.slug}`}
              className="flex flex-col items-center gap-3 rounded-xl border border-[var(--border)] bg-white p-6 hover:shadow-md hover:border-[var(--primary)] transition-all group"
            >
              <span className="text-3xl">
                {CATEGORY_ICONS[(cat as any).icon ?? ''] ?? '📦'}
              </span>
              <span className="text-sm font-medium text-gray-700 group-hover:text-[var(--primary)] text-center">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link href="/categories" className="text-[var(--primary)] font-medium hover:underline">
            View all categories &rarr;
          </Link>
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  const steps = [
    {
      step: 1,
      title: 'Search',
      description: 'Browse services by category, location, or keyword to find the right professional.',
      icon: (
        <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
    },
    {
      step: 2,
      title: 'Book',
      description: 'Review profiles, compare prices, and book directly with secure online payment.',
      icon: (
        <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      step: 3,
      title: 'Review',
      description: 'After the job is done, leave a review to help others find great service providers.',
      icon: (
        <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      ),
    },
  ];

  return (
    <section className="py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-gray-900 text-center">How It Works</h2>
        <p className="mt-2 text-gray-600 text-center">Getting things done has never been easier</p>
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((s) => (
            <div key={s.step} className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-[var(--primary)]">
                {s.icon}
              </div>
              <h3 className="mt-6 text-xl font-semibold text-gray-900">{s.title}</h3>
              <p className="mt-3 text-gray-600 leading-relaxed">{s.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="bg-[var(--primary)] text-white py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold">Ready to Get Started?</h2>
        <p className="mt-4 text-lg text-blue-100 max-w-2xl mx-auto">
          Join thousands of Jamaicans who trust Jobsy to find reliable service providers.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
          <Link
            href="/services"
            className="inline-flex items-center justify-center rounded-lg bg-white text-blue-700 font-semibold px-8 py-3.5 hover:bg-blue-50 transition-colors"
          >
            Find a Service
          </Link>
          <Link
            href="/register"
            className="inline-flex items-center justify-center rounded-lg border-2 border-white text-white font-semibold px-8 py-3.5 hover:bg-white/10 transition-colors"
          >
            List Your Service
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <Suspense fallback={<div className="py-20 flex justify-center"><LoadingSpinner size="lg" /></div>}>
        <FeaturedServicesSection />
      </Suspense>
      <Suspense fallback={<div className="py-20 flex justify-center"><LoadingSpinner size="lg" /></div>}>
        <CategoriesSection />
      </Suspense>
      <HowItWorksSection />
      <CTASection />
    </>
  );
}
