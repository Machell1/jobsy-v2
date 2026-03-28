import Link from 'next/link';
import { Suspense } from 'react';
import type { Service, Category } from '@jobsy/shared';
import { ServiceCard } from '@/components/ServiceCard';
import { FilterSidebar } from '@/components/FilterSidebar';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { apiFetch } from '@/lib/api';

export const metadata = {
  title: 'Browse Services — Jobsy',
  description: 'Search and browse trusted service providers across Jamaica. Filter by category, parish, price, and more.',
};

type ServiceWithRelations = Service & {
  provider?: { name: string };
  category?: { name: string; slug: string };
};

async function getServices(params: Record<string, string | undefined>) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => { if (v) query.set(k, v); });
  const empty = { data: [] as ServiceWithRelations[], pagination: { page: 1, limit: 20, total: 0, pages: 0 } };
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.jobsyja.com';
    const res = await fetch(`${API_URL}/api/services?${query.toString()}`, {
      headers: { 'Content-Type': 'application/json' },
      next: { revalidate: 60 },
    });
    if (!res.ok) return empty;
    const json = await res.json();
    if (!json.success) return empty;
    return {
      data: (json.data ?? []) as ServiceWithRelations[],
      pagination: json.pagination ?? empty.pagination,
    };
  } catch {
    return empty;
  }
}

async function getCategories() {
  try {
    const res = await apiFetch<Category[]>('/api/services/categories', { next: { revalidate: 600 } });
    return res ?? [];
  } catch {
    return [];
  }
}

function Pagination({
  currentPage,
  totalPages,
  searchParams,
}: {
  currentPage: number;
  totalPages: number;
  searchParams: Record<string, string | undefined>;
}) {
  if (totalPages <= 1) return null;

  function pageUrl(page: number) {
    const params = new URLSearchParams();
    Object.entries(searchParams).forEach(([k, v]) => {
      if (v && k !== 'page') params.set(k, v);
    });
    params.set('page', String(page));
    return `/services?${params.toString()}`;
  }

  const pages = [];
  const start = Math.max(1, currentPage - 2);
  const end = Math.min(totalPages, currentPage + 2);
  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <nav className="mt-10 flex items-center justify-center gap-2">
      {currentPage > 1 && (
        <Link href={pageUrl(currentPage - 1)} className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
          ← Prev
        </Link>
      )}
      {start > 1 && <span className="text-gray-400 px-2">…</span>}
      {pages.map((page) => (
        <Link
          key={page}
          href={pageUrl(page)}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            page === currentPage
              ? 'bg-[var(--primary)] text-white'
              : 'border border-[var(--border)] text-gray-700 hover:bg-gray-50'
          }`}
        >
          {page}
        </Link>
      ))}
      {end < totalPages && <span className="text-gray-400 px-2">…</span>}
      {currentPage < totalPages && (
        <Link href={pageUrl(currentPage + 1)} className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
          Next →
        </Link>
      )}
    </nav>
  );
}

async function ServiceResults({ searchParams }: { searchParams: Record<string, string | undefined> }) {
  const [result, categories] = await Promise.all([getServices(searchParams), getCategories()]);
  const pagination = result.pagination ?? { page: 1, limit: 20, total: 0, pages: 0 };
  const services = result.data ?? [];

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Sidebar */}
      <div className="w-full lg:w-60 shrink-0">
        <FilterSidebar categories={categories} current={searchParams} />
      </div>

      {/* Results */}
      <div className="flex-1 min-w-0">
        <div className="mb-5 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            {pagination.total > 0
              ? `${pagination.total} service${pagination.total !== 1 ? 's' : ''} found`
              : 'No services found'}
          </p>
        </div>

        {services.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {services.map((service: any) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
              <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">No services found</h3>
            <p className="mt-2 text-gray-500 text-sm max-w-xs mx-auto">
              Try adjusting your filters or search terms, or{' '}
              <Link href="/services" className="text-[var(--primary)] hover:underline">clear all filters</Link>.
            </p>
          </div>
        )}

        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.pages}
          searchParams={searchParams}
        />
      </div>
    </div>
  );
}

export default async function ServicesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page header */}
      <div className="bg-white border-b border-[var(--border)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900">Browse Services</h1>
          <p className="mt-1 text-gray-500">Find and compare service providers across Jamaica</p>

          {/* Search bar */}
          <form action="/services" method="GET" className="mt-5 flex gap-3 max-w-2xl">
            <div className="relative flex-1">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                type="text"
                name="q"
                defaultValue={params.q}
                placeholder="Search services…"
                className="w-full rounded-xl border border-[var(--border)] pl-10 pr-4 py-3 text-sm outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 bg-white transition-colors"
              />
            </div>
            <button
              type="submit"
              className="rounded-xl bg-[var(--primary)] px-6 py-3 text-sm font-semibold text-white hover:bg-[var(--primary-dark)] transition-colors"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Suspense
          fallback={
            <div className="flex justify-center py-20">
              <LoadingSpinner size="lg" />
            </div>
          }
        >
          <ServiceResults searchParams={params} />
        </Suspense>
      </div>
    </div>
  );
}
