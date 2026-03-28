'use client';

import { useState } from 'react';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.jobsyja.com';

const PARISHES = [
  'Kingston', 'St. Andrew', 'St. Thomas', 'Portland', 'St. Mary', 'St. Ann', 'Trelawny',
  'St. James', 'Hanover', 'Westmoreland', 'St. Elizabeth', 'Manchester', 'Clarendon', 'St. Catherine',
];

const CATEGORIES = [
  'Home Cleaning', 'Plumbing', 'Electrical', 'Landscaping', 'Painting', 'Moving', 'Tutoring',
  'Photography', 'Catering', 'Beauty & Hair', 'Auto Repair', 'Tech Support', 'Pet Care',
  'Fitness Training', 'Event Planning', 'Construction', 'Tailoring', 'Other',
];

interface Provider {
  id: string;
  businessName: string;
  category: string;
  parish: string;
  description: string | null;
  imageUrl: string | null;
  maskedEmail: string | null;
  maskedPhone: string | null;
  serviceCount: number;
}

export function ClaimSearch() {
  const [query, setQuery] = useState('');
  const [parish, setParish] = useState('');
  const [category, setCategory] = useState('');
  const [results, setResults] = useState<Provider[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  async function handleSearch(e?: React.FormEvent) {
    e?.preventDefault();
    setLoading(true);
    setSearched(true);

    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (parish) params.set('parish', parish);
    if (category) params.set('category', category);
    params.set('limit', '20');

    try {
      const res = await fetch(`${API_URL}/api/claim/search?${params}`);
      const json = await res.json();
      if (json.success) {
        setResults(json.data);
        setTotal(json.pagination?.total || 0);
      }
    } catch {
      // Network error
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {/* Search Form */}
      <form onSubmit={handleSearch} className="rounded-xl border border-[var(--border)] bg-white p-6 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-gray-600 mb-1">Business Name</label>
            <input
              type="text"
              placeholder="Search by name..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Parish</label>
            <select
              value={parish}
              onChange={(e) => setParish(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] outline-none bg-white"
            >
              <option value="">All Parishes</option>
              {PARISHES.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] outline-none bg-white"
            >
              <option value="">All Categories</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="mt-4 w-full rounded-lg bg-[var(--primary)] py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {/* Results */}
      {searched && (
        <div className="mt-8">
          <p className="text-sm text-gray-500 mb-4">
            {total > 0 ? `${total} business${total === 1 ? '' : 'es'} found` : 'No businesses found'}
          </p>

          {results.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {results.map((p) => (
                <div key={p.id} className="rounded-xl border border-[var(--border)] bg-white p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-3">
                    {p.imageUrl ? (
                      <img src={p.imageUrl} alt={p.businessName} className="h-12 w-12 shrink-0 rounded-lg object-cover" />
                    ) : (
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-lg font-bold text-emerald-700">
                        {p.businessName.charAt(0)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">{p.businessName}</h3>
                      <div className="mt-1 flex flex-wrap gap-2">
                        <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                          {p.category}
                        </span>
                        <span className="text-xs text-gray-500">{p.parish}</span>
                        <span className="text-xs text-gray-400">{p.serviceCount} service{p.serviceCount !== 1 ? 's' : ''}</span>
                      </div>
                    </div>
                  </div>
                  {p.description && (
                    <p className="mt-2 text-xs text-gray-500 line-clamp-2">{p.description}</p>
                  )}
                  <Link
                    href={`/claim/${p.id}`}
                    className="mt-3 block rounded-lg border border-[var(--primary)] py-2 text-center text-sm font-semibold text-[var(--primary)] hover:bg-emerald-50 transition-colors"
                  >
                    View Profile
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center">
              <p className="text-sm text-gray-500">No businesses match your search. Try different keywords or filters.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
