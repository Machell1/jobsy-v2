'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import type { Category } from '@jobsy/shared';
import { DEFAULT_CATEGORIES, JAMAICA_PARISHES } from '@jobsy/shared';

interface FilterSidebarProps {
  categories: Category[];
  current: Record<string, string | undefined>;
}

export function FilterSidebar({ categories, current }: FilterSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const cats = categories.length > 0
    ? categories
    : DEFAULT_CATEGORIES.map((c) => ({ ...c, id: c.slug }));

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete('page');
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <aside className="space-y-6">
      {/* Category filter */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Category</h3>
        <div className="space-y-1">
          <Link
            href="/services"
            className={`block rounded-lg px-3 py-2 text-sm transition-colors ${
              !current.category
                ? 'bg-[var(--primary)] text-white font-medium'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            All Categories
          </Link>
          {cats.map((cat: any) => {
            const slug = 'slug' in cat ? cat.slug : cat.name.toLowerCase().replace(/\s+/g, '-');
            const isActive = current.category === slug;
            return (
              <button
                key={slug}
                onClick={() => updateFilter('category', isActive ? '' : slug)}
                className={`w-full text-left block rounded-lg px-3 py-2 text-sm transition-colors ${
                  isActive ? 'bg-[var(--primary)] text-white font-medium' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Parish filter */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Parish</h3>
        <select
          value={current.parish ?? ''}
          onChange={(e) => updateFilter('parish', e.target.value)}
          className="w-full rounded-lg border border-[var(--border)] px-3 py-2.5 text-sm outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 bg-white"
        >
          <option value="">All Parishes</option>
          {JAMAICA_PARISHES.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>

      {/* Sort */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Sort By</h3>
        <select
          value={current.sort ?? 'relevance'}
          onChange={(e) => updateFilter('sort', e.target.value)}
          className="w-full rounded-lg border border-[var(--border)] px-3 py-2.5 text-sm outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 bg-white"
        >
          <option value="relevance">Most Relevant</option>
          <option value="price_low">Price: Low to High</option>
          <option value="price_high">Price: High to Low</option>
          <option value="rating">Highest Rated</option>
          <option value="newest">Newest First</option>
        </select>
      </div>

      {/* Price range */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Price Range (JMD)</h3>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            const params = new URLSearchParams(searchParams.toString());
            const min = fd.get('minPrice') as string;
            const max = fd.get('maxPrice') as string;
            if (min) params.set('minPrice', min); else params.delete('minPrice');
            if (max) params.set('maxPrice', max); else params.delete('maxPrice');
            params.delete('page');
            router.push(`${pathname}?${params.toString()}`);
          }}
          className="space-y-2"
        >
          <div className="flex items-center gap-2">
            <input
              type="number"
              name="minPrice"
              defaultValue={current.minPrice}
              placeholder="Min"
              className="w-full rounded-lg border border-[var(--border)] px-3 py-2 text-sm outline-none focus:border-[var(--primary)]"
            />
            <span className="text-gray-400 shrink-0">–</span>
            <input
              type="number"
              name="maxPrice"
              defaultValue={current.maxPrice}
              placeholder="Max"
              className="w-full rounded-lg border border-[var(--border)] px-3 py-2 text-sm outline-none focus:border-[var(--primary)]"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-lg bg-[var(--primary)] py-2 text-sm font-medium text-white hover:bg-[var(--primary-dark)] transition-colors"
          >
            Apply
          </button>
        </form>
      </div>

      {/* Clear filters */}
      {(current.category || current.parish || current.sort || current.minPrice || current.maxPrice) && (
        <Link
          href="/services"
          className="block text-center text-sm text-[var(--primary)] hover:underline"
        >
          Clear all filters
        </Link>
      )}
    </aside>
  );
}
