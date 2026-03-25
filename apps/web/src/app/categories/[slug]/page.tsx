import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';
import type { Metadata } from 'next';
import type { Service, Category, PaginatedResponse } from '@jobsy/shared';
import { DEFAULT_CATEGORIES } from '@jobsy/shared';
import { ServiceCard } from '@/components/ServiceCard';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { apiFetch } from '@/lib/api';

type ServiceWithRelations = Service & {
  provider?: { name: string };
  category?: { name: string; slug: string };
};

async function getCategoryBySlug(slug: string): Promise<(Category & { serviceCount?: number }) | null> {
  try {
    const res = await apiFetch<Category & { serviceCount?: number }>(
      `/api/categories/${slug}`,
      { next: { revalidate: 600 } }
    );
    return res ?? null;
  } catch {
    // Fall back to default categories
    const def = DEFAULT_CATEGORIES.find((c) => c.slug === slug);
    if (def) {
      return {
        id: def.slug,
        name: def.name,
        slug: def.slug,
        icon: def.icon,
        sortOrder: 0,
        isActive: true,
        createdAt: new Date(),
      };
    }
    return null;
  }
}

async function getServicesByCategory(slug: string, page: number = 1) {
  try {
    const res = await apiFetch<PaginatedResponse<ServiceWithRelations>>(
      `/api/services?category=${slug}&page=${page}&limit=12`,
      { next: { revalidate: 60 } }
    );
    return res ?? { data: [], pagination: { page: 1, limit: 12, total: 0, pages: 0 } };
  } catch {
    return { data: [], pagination: { page: 1, limit: 12, total: 0, pages: 0 } };
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return { title: 'Category Not Found' };
  return {
    title: `${category.name} Services`,
    description: `Browse ${category.name.toLowerCase()} services on Jobsy. Find trusted local providers across Jamaica.`,
  };
}

async function CategoryServices({ slug, page }: { slug: string; page: number }) {
  const result = await getServicesByCategory(slug, page);

  if (result.data.length === 0) {
    return (
      <div className="py-16 text-center">
        <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
        <h3 className="mt-4 text-lg font-semibold text-gray-900">No services yet</h3>
        <p className="mt-2 text-gray-600">
          Be the first to list a service in this category.
        </p>
        <Link
          href="/register"
          className="mt-6 inline-block rounded-lg bg-[var(--primary)] px-6 py-2.5 text-sm font-medium text-white hover:opacity-90 transition-colors"
        >
          Become a Provider
        </Link>
      </div>
    );
  }

  return (
    <>
      <p className="mb-6 text-sm text-gray-600">
        {result.pagination.total} {result.pagination.total === 1 ? 'service' : 'services'} found
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {result.data.map((service: any) => (
          <ServiceCard key={service.id} service={service} />
        ))}
      </div>

      {/* Pagination */}
      {result.pagination.pages > 1 && (
        <nav className="mt-10 flex items-center justify-center gap-2">
          {page > 1 && (
            <Link
              href={`/categories/${slug}?page=${page - 1}`}
              className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Previous
            </Link>
          )}
          {Array.from({ length: Math.min(result.pagination.pages, 7) }, (_, i) => i + 1).map(
            (p) => (
              <Link
                key={p}
                href={`/categories/${slug}?page=${p}`}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  p === page
                    ? 'bg-[var(--primary)] text-white'
                    : 'border border-[var(--border)] text-gray-700 hover:bg-gray-50'
                }`}
              >
                {p}
              </Link>
            )
          )}
          {page < result.pagination.pages && (
            <Link
              href={`/categories/${slug}?page=${page + 1}`}
              className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Next
            </Link>
          )}
        </nav>
      )}
    </>
  );
}

export default async function CategoryDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { slug } = await params;
  const { page: pageStr } = await searchParams;
  const category = await getCategoryBySlug(slug);

  if (!category) notFound();

  const page = Math.max(1, parseInt(pageStr ?? '1', 10) || 1);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumbs */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-gray-500">
        <Link href="/categories" className="hover:text-[var(--primary)]">
          Categories
        </Link>
        <span>/</span>
        <span className="text-gray-900">{category.name}</span>
      </nav>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{category.name}</h1>
        {category.description && (
          <p className="mt-2 text-gray-600">{category.description}</p>
        )}
      </div>

      <Suspense
        fallback={
          <div className="flex justify-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        }
      >
        <CategoryServices slug={slug} page={page} />
      </Suspense>
    </div>
  );
}
