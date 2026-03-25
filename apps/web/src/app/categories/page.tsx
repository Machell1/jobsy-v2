import Link from 'next/link';
import type { Category } from '@jobsy/shared';
import { DEFAULT_CATEGORIES } from '@jobsy/shared';
import { apiFetch } from '@/lib/api';

export const metadata = {
  title: 'Categories',
  description: 'Browse service categories on Jobsy. Find home cleaning, plumbing, electrical, landscaping, and more across Jamaica.',
};

const CATEGORY_ICONS: Record<string, string> = {
  'spray-can': '🧹', wrench: '🔧', zap: '⚡', trees: '🌳', paintbrush: '🎨',
  truck: '🚚', 'book-open': '📖', camera: '📷', utensils: '🍽️', scissors: '✂️',
  car: '🚗', monitor: '💻', 'paw-print': '🐾', dumbbell: '💪', calendar: '📅',
  'hard-hat': '👷', shirt: '👔', grid: '📦',
};

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

export default async function CategoriesPage() {
  const apiCategories = await getCategories();

  const categories =
    apiCategories.length > 0
      ? apiCategories
      : DEFAULT_CATEGORIES.map((c, i) => ({
          id: c.slug,
          name: c.name,
          slug: c.slug,
          description: undefined as string | undefined,
          icon: c.icon as string | undefined,
          sortOrder: i,
          isActive: true,
          createdAt: new Date(),
          serviceCount: 0,
        }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">Service Categories</h1>
        <p className="mt-3 text-lg text-gray-600">
          Explore all the ways Jobsy can connect you with local professionals
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {categories.map((cat: any) => (
          <Link
            key={cat.slug}
            href={`/categories/${cat.slug}`}
            className="group flex flex-col items-center rounded-xl border border-[var(--border)] bg-white p-8 text-center transition-all hover:border-[var(--primary)] hover:shadow-lg"
          >
            <span className="text-5xl mb-4">
              {CATEGORY_ICONS[cat.icon ?? ''] ?? '📦'}
            </span>
            <h2 className="text-lg font-semibold text-gray-900 group-hover:text-[var(--primary)] transition-colors">
              {cat.name}
            </h2>
            {cat.description && (
              <p className="mt-2 text-sm text-gray-500 line-clamp-2">{cat.description}</p>
            )}
            {'serviceCount' in cat && typeof cat.serviceCount === 'number' && (
              <p className="mt-3 text-xs text-gray-400">
                {cat.serviceCount} {cat.serviceCount === 1 ? 'service' : 'services'}
              </p>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
