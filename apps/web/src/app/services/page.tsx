import Link from 'next/link';
import { Suspense } from 'react';
import type { Service, Category } from '@jobsy/shared';
import { DEFAULT_CATEGORIES, JAMAICA_PARISHES } from '@jobsy/shared';
import { ServiceCard } from '@/components/ServiceCard';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { apiFetch } from '@/lib/api';

export const metadata = {
  title: 'Browse Services',
  description:
    'Search and browse trusted service providers across Jamaica. Filter by category, parish, price, and more.',
};

type ServiceWithRelations = Service & {
  provider?: { name: string };
  category?: { name: string; slug: string };
};

async function getServices(params: Record<string, string | undefined>) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v) query.set(k, v);
  });
  const empty = { data: [] as ServiceWithRelations[], pagination: { page: 1, limit: 20, total: 0, pages: 0 } };
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
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
    const res = await apiFetch<Category[]>('/api/services/categories', {
      next: { revalidate: 600 },
    });
    return res ?? [];
  } catch {
    return [];
  }
}

function SearchBar({ defaultValue }: { defaultValue?: string }) {
  return (
    <form action="/services" method="GET" className="relative">
      <input
        type="text"
        name="q"
        defaultValue={defaultValue}
        placeholder="Search services..."
        className="w-full rounded-lg border border-[var(--border)] bg-white px-4 py-3 pl-11 text-sm outline-none transition-colors focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20"
      />
      <svg
        className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
    </form>
  );
}

function FilterSidebar({
  categories,
  current,
}: {
  categories: Category[];
  current: Record<string, string | undefined>;
}) {
  const cats = categories.length > 0 ? categories : DEFAULT_CATEGORIES.map((c) => ({ ...c, id: c.slug }));

  return (
    <aside className="space-y-6">
      {/* Category filter */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Category</h3>
        <div className="space-y-1.5">
          <Link
            href="/services"
            className={`block rounded-lg px-3 py-2 text-sm transition-colors ${
              !current.category ? 'bg-[var(--primary)] text-white' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            All Categories
          </Link>
          {cats.map((cat: any) => {
            const slug = 'slug' in cat ? cat.slug : cat.name.toLowerCase().replace(/\s+/g, '-');
            const isActive = current.category === slug;
            const params = new URLSearchParams();
            if (current.q) params.set('q', current.q);
            params.set('category', slug);
            if (current.sort) params.set('sort', current.sort);
            return (
              <Link
                key={slug}
                href={`/services?${params.toString()}`}
                className={`block rounded-lg px-3 py-2 text-sm transition-colors ${
                  isActive ? 'bg-[var(--primary)] text-white' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {cat.name}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Parish filter */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Parish</h3>
        <select
          name="parish"
          defaultValue={current.parish || ''}
          className="w-full rounded-lg border border-[var(--border)] px-3 py-2 text-sm outline-none focus:border-[var(--primary)]"
          onChange={(e) => {
            const params = new URLSearchParams(window.location.search);
            if (e.target.value) params.set('parish', e.target.value);
            else params.delete('parish');
            window.location.href = `/services?${params.toString()}`;
          }}
        >
          <option value="">All Parishes</option>
          {JAMAICA_PARISHES.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>

      {/* Price range */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Price Range (JMD)</h3>
        <div className="flex items-center gap-2">
          <input
            type="number"
            name="minPrice"
            defaultValue={current.minPrice}
            placeholder="Min"
            className="w-full rounded-lg border border-[var(--border)] px-3 py-2 text-sm outline-none focus:border-[var(--primary)]"
          />
          <span className="text-gray-400">&ndash;</span>
          <input
            type="number"
            name="maxPrice"
            defaultValue={current.maxPrice}
            placeholder="Max"
            className="w-full rounded-lg border border-[var(--border)] px-3 py-2 text-sm outline-none focus:border-[var(--primary)]"
          />
        </div>
      </div>

      {/* Sort */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Sort By</h3>
        <select
          name="sort"
          defaultValue={current.sort || 'relevance'}
          className="w-full rounded-lg border border-[var(--border)] px-3 py-2 text-sm outline-none focus:border-[var(--primary)]"
          onChange={(e) => {
            const params = new URLSearchParams(window.location.search);
            params.set('sort', e.target.value);
            window.location.href = `/services?${params.toString()}`;
          }}
        >
          <option value="relevance">Relevance</option>
          <option value="price_low">Price: Low to High</option>
          <option value="price_high">Price: High to Low</option>
          <option value="rating">Highest Rated</option>
          <option value="newest">Newest</option>
        </select>
      </div>
    </aside>
  );
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

  return (
    <nav className="mt-10 flex items-center justify-center gap-2">
      {currentPage > 1 && (
        <Link
          href={pageUrl(currentPage - 1)}
          className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Previous
        </Link>
      )}
      {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
        const page = i + 1;
        return (
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
        );
      })}
      {currentPage < totalPages && (
        <Link
          href={pageUrl(currentPage + 1)}
          className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Next
        </Link>
      )}
    </nav>
  );
}

async function ServiceResults({
  searchParams,
}: {
  searchParams: Record<string, string | undefined>;
}) {
  const [result, categories] = await Promise.all([getServices(searchParams), getCategories()]);

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Sidebar */}
      <div className="w-full lg:w-64 shrink-0">
        <FilterSidebar categories={categories} current={searchParams} />
      </div>

      {/* Results */}
      <div className="flex-1">
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            {result.pagination.total > 0
              ? `Showing ${(result.pagination.page - 1) * result.pagination.limit + 1}–${Math.min(
                  result.pagination.page * result.pagination.limit,
                  result.pagination.total
                )} of ${result.pagination.total} services`
              : 'No services found'}
          </p>
        </div>

        {result.data.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {result.data.map((service: any) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        ) : (
          <div className="py-16 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">No services found</h3>
            <p className="mt-2 text-gray-600">
              Try adjusting your filters or search terms.
            </p>
          </div>
        )}

        <Pagination
          currentPage={result.pagination.page}
          totalPages={result.pagination.pages}
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
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Page heading */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Browse Services</h1>
        <p className="mt-2 text-gray-600">
          Find and compare service providers across Jamaica
        </p>
      </div>

      {/* Search bar */}
      <div className="mb-8 max-w-xl">
        <SearchBar defaultValue={params.q} />
      </div>

      {/* Content with filters */}
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
  );
}
