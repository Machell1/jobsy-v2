import Link from 'next/link';
import { Suspense } from 'react';
import type { Service, Category } from '@jobsy/shared';
import { DEFAULT_CATEGORIES, JAMAICA_PARISHES } from '@jobsy/shared';
import { ServiceCard } from '@/components/ServiceCard';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { AdBanner } from '@/components/AdBanner';
import { apiFetch } from '@/lib/api';

async function getFeaturedServices() {
  try {
    const res = await apiFetch<(Service & { provider?: { name: string }; category?: { name: string; slug: string } })[]>(
      '/api/services/featured',
      { next: { revalidate: 300 } }
    );
    return res ?? [];
  } catch {
    return [];
  }
}

async function getCategories() {
  try {
    const res = await apiFetch<(Category & { serviceCount?: number })[]>(
      '/api/services/categories',
      { next: { revalidate: 600 } }
    );
    return res ?? [];
  } catch {
    return [];
  }
}

// Map category slugs to Lucide-compatible SVG paths (inline, no extra dependency)
const CATEGORY_ICON_PATHS: Record<string, { d: string; viewBox?: string }> = {
  'plumbing':         { d: 'M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z' },
  'electrical':       { d: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z' },
  'home-cleaning':    { d: 'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10' },
  'beauty-hair':      { d: 'M6 3a3 3 0 015.83 1 3 3 0 00.67.42A12 12 0 0121 14a2 2 0 01-4 0 8 8 0 00-9.11-7.91A3 3 0 016 3zM8 14a6 6 0 110 1H8z' },
  'landscaping':      { d: 'M17 8C8 10 5.9 16.17 3.82 22H2v-2a18 18 0 0118-18 2 2 0 010 4z' },
  'construction':     { d: 'M2 20h20M4 20V10l8-7 8 7v10M9 20v-5h6v5' },
  'auto-repair':      { d: 'M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h11a2 2 0 012 2v3m-7 14a2 2 0 100-4 2 2 0 000 4zm7-2a2 2 0 100-4 2 2 0 000 4z' },
  'catering':         { d: 'M3 2v7c0 1.1.9 2 2 2h4a2 2 0 002-2V2m0 0h6l2 5H9M3 2h6m6 13v7M9 22v-7m0 0H3m6 0h6' },
  'event-planning':   { d: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
  'photography':      { d: 'M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2v11zM12 17a4 4 0 100-8 4 4 0 000 8z' },
  'tutoring':         { d: 'M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2zM22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z' },
  'tech-support':     { d: 'M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18' },
  'fitness-training': { d: 'M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8zm4-4v4m8-4v4' },
  'painting':         { d: 'M2 13.5V19a1 1 0 001 1h1a1 1 0 001-1v-1h10v1a1 1 0 001 1h1a1 1 0 001-1v-5.5M2 13.5L11 2l9 11.5M2 13.5h20' },
  'pet-care':         { d: 'M10 5.172C10 3.443 8.55 2 6.5 2C5 2 4 3 4 4s1 2 3 3c.74.35 1.64.64 3 1v1M20 5.172C20 3.443 18.55 2 16.5 2C15 2 14 3 14 4s1 2 3 3c.74.35 1.64.64 3 1v1M12 12c-3 0-5 1.5-5 4s2 4 5 4 5-1.5 5-4-2-4-5-4z' },
  'tailoring':        { d: 'M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z M3 6h18M16 10a4 4 0 01-8 0' },
  'moving':           { d: 'M1 3h15v13H1zM16 8h4l3 3v5h-7V8zM5.5 21a2.5 2.5 0 100-5 2.5 2.5 0 000 5zm11 0a2.5 2.5 0 100-5 2.5 2.5 0 000 5z' },
  'other':            { d: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5' },
};

function CategoryIcon({ slug, className = 'h-6 w-6' }: { slug: string; className?: string }) {
  const icon = CATEGORY_ICON_PATHS[slug] ?? CATEGORY_ICON_PATHS['other'];
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d={icon.d} />
    </svg>
  );
}

const STAT_ITEMS = [
  { value: '14', label: 'Parishes Covered' },
  { value: '18+', label: 'Service Categories' },
  { value: '100%', label: 'Verified Providers' },
];

function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-emerald-700 via-emerald-800 to-emerald-900 text-white">
      {/* Decorative background circles */}
      <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-white/5 pointer-events-none" />
      <div className="absolute -bottom-32 -left-16 h-80 w-80 rounded-full bg-white/5 pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 md:py-28">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-emerald-100 mb-6 backdrop-blur-sm">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            Jamaica&apos;s #1 Service Marketplace
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.1] tracking-tight">
            Find Trusted Service{' '}
            <span className="text-emerald-300">Providers</span>{' '}
            Across Jamaica
          </h1>

          <p className="mt-6 text-lg md:text-xl text-emerald-100 leading-relaxed max-w-2xl">
            From home repairs to personal care — book verified professionals in your parish.
          </p>

          {/* Search bar */}
          <form action="/services" method="GET" className="mt-8 flex flex-col sm:flex-row gap-3 max-w-xl">
            <input
              type="text"
              name="q"
              placeholder="What service do you need?"
              className="flex-1 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 px-5 py-3.5 text-white placeholder-emerald-200 outline-none focus:border-white focus:bg-white/15 transition-colors text-base"
            />
            <select
              name="parish"
              className="rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-3.5 text-white outline-none focus:border-white transition-colors text-base appearance-none cursor-pointer min-w-[150px]"
              defaultValue=""
            >
              <option value="" className="text-gray-800 bg-white">All Parishes</option>
              {JAMAICA_PARISHES.map((p) => (
                <option key={p} value={p} className="text-gray-800 bg-white">{p}</option>
              ))}
            </select>
            <button
              type="submit"
              className="rounded-xl bg-white text-emerald-800 font-semibold px-6 py-3.5 hover:bg-emerald-50 transition-colors whitespace-nowrap"
            >
              Find Services
            </button>
          </form>

          {/* Stats row */}
          <div className="mt-12 flex flex-wrap gap-8">
            {STAT_ITEMS.map((s) => (
              <div key={s.label}>
                <p className="text-2xl font-bold text-white">{s.value}</p>
                <p className="text-sm text-emerald-200">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
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
            <p className="text-sm font-semibold uppercase tracking-wide text-[var(--primary)] mb-1">Featured</p>
            <h2 className="text-3xl font-bold text-gray-900">Top Services This Week</h2>
            <p className="mt-1 text-gray-500">Hand-picked professionals ready to help</p>
          </div>
          <Link href="/services" className="text-[var(--primary)] text-sm font-medium hover:underline hidden sm:block">
            View all →
          </Link>
        </div>

        {services.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service: any) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-[var(--border)] bg-white overflow-hidden animate-pulse">
                <div className="aspect-[16/9] bg-gray-100" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-100 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                  <div className="h-3 bg-gray-100 rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 text-center sm:hidden">
          <Link href="/services" className="text-[var(--primary)] text-sm font-medium hover:underline">
            View all services →
          </Link>
        </div>
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
          id: c.slug, name: c.name, slug: c.slug, icon: c.icon,
          sortOrder: i, isActive: true, createdAt: new Date(), serviceCount: 0,
        }));

  return (
    <section className="py-16 md:py-20 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <p className="text-sm font-semibold uppercase tracking-wide text-[var(--primary)] mb-1">Categories</p>
          <h2 className="text-3xl font-bold text-gray-900">Browse by Category</h2>
          <p className="mt-1 text-gray-500">Find exactly what you need across Jamaica</p>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 md:gap-4">
          {categories.map((cat: any) => {
            const slug = cat.slug ?? cat.name.toLowerCase().replace(/\s+/g, '-');
            return (
              <Link
                key={slug}
                href={`/services?category=${slug}`}
                className="flex flex-col items-center gap-3 rounded-2xl border border-[var(--border)] bg-white p-4 md:p-5 hover:shadow-md hover:border-[var(--primary)] hover:-translate-y-0.5 transition-all duration-200 group"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--primary-light)] text-[var(--primary)] group-hover:bg-[var(--primary)] group-hover:text-white transition-colors duration-200">
                  <CategoryIcon slug={slug} className="h-5 w-5" />
                </div>
                <span className="text-xs font-medium text-gray-700 group-hover:text-[var(--primary)] text-center leading-snug transition-colors">
                  {cat.name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  const steps = [
    {
      step: '01',
      title: 'Search',
      description: 'Browse services by category, parish, or keyword. Find verified professionals near you.',
      icon: (
        <svg className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
      ),
    },
    {
      step: '02',
      title: 'Book',
      description: 'Compare prices, read reviews, and book directly. Secure payment, no cash upfront needed.',
      icon: (
        <svg className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
        </svg>
      ),
    },
    {
      step: '03',
      title: 'Get It Done',
      description: 'Your provider shows up on time. Job done, then leave a review and help others.',
      icon: (
        <svg className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/>
        </svg>
      ),
    },
  ];

  return (
    <section className="py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-sm font-semibold uppercase tracking-wide text-[var(--primary)] mb-1">Simple Process</p>
          <h2 className="text-3xl font-bold text-gray-900">How Jobsy Works</h2>
          <p className="mt-1 text-gray-500">Getting things done has never been easier</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {steps.map((s, i) => (
            <div key={s.step} className="relative flex flex-col items-center text-center">
              {/* Connector line */}
              {i < steps.length - 1 && (
                <div className="absolute top-6 left-[calc(50%+3rem)] hidden md:block w-[calc(100%-3rem)] h-px border-t-2 border-dashed border-gray-200" />
              )}
              <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--primary-light)] text-[var(--primary)] mb-5">
                {s.icon}
                <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-[var(--primary)] text-[10px] font-bold text-white">
                  {s.step}
                </span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{s.title}</h3>
              <p className="text-gray-500 leading-relaxed text-[15px]">{s.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TrustSection() {
  const items = [
    {
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
      ),
      title: 'Verified Providers',
      desc: 'Every provider is ID-verified before listing services on Jobsy.',
    },
    {
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><path d="M12 22V7m0 0H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7zm0 0h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z"/>
        </svg>
      ),
      title: '100% Free to Use',
      desc: 'No fees, no commissions. Book any service on Jobsy at zero cost.',
    },
    {
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
        </svg>
      ),
      title: 'In-App Chat',
      desc: 'Message your provider directly to agree on details before booking.',
    },
  ];

  return (
    <section className="py-12 bg-emerald-50 border-y border-emerald-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {items.map((item) => (
            <div key={item.title} className="flex items-start gap-4">
              <div className="shrink-0 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--primary)] text-white">
                {item.icon}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{item.title}</h3>
                <p className="mt-1 text-sm text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ClaimCTASection() {
  return (
    <section className="py-14 md:py-20 bg-white">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 p-8 md:p-12 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-emerald-700 mb-2">For Service Providers</p>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Already serving customers in Jamaica?</h2>
          <p className="mt-3 text-gray-600 max-w-xl mx-auto">
            We may have already listed your business on Jobsy. Search for your name, verify your identity, and claim your free profile — your services will be ready to go.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="/claim"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-6 py-3 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
            >
              Claim Your Profile
            </a>
            <a
              href="/register"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Register as a New Provider
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="bg-gradient-to-br from-emerald-700 to-emerald-900 text-white py-16 md:py-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold">Ready to Get Started?</h2>
        <p className="mt-4 text-lg text-emerald-100 max-w-xl mx-auto leading-relaxed">
          Join thousands of Jamaicans who trust Jobsy to find reliable service providers across all 14 parishes.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
          <Link
            href="/services"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white text-emerald-800 font-semibold px-8 py-4 hover:bg-emerald-50 transition-colors shadow-lg"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            Find a Service
          </Link>
          <Link
            href="/register"
            className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-white text-white font-semibold px-8 py-4 hover:bg-white/10 transition-colors"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
            Become a Provider
          </Link>
        </div>
        <p className="mt-6 text-sm text-emerald-300">Free to join. No subscription fees. Pay only when you book.</p>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <TrustSection />
      <AdBanner slot="1234567890" className="mx-auto max-w-7xl px-4 py-2" />
      <Suspense fallback={<div className="py-20 flex justify-center"><LoadingSpinner size="lg" /></div>}>
        <FeaturedServicesSection />
      </Suspense>
      <Suspense fallback={<div className="py-20 flex justify-center"><LoadingSpinner size="lg" /></div>}>
        <CategoriesSection />
      </Suspense>
      <HowItWorksSection />
      <ClaimCTASection />
      <CTASection />
    </>
  );
}
