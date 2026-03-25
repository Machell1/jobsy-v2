'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import Link from 'next/link';

interface ServiceListItem {
  id: string;
  title: string;
  categoryName?: string;
  priceMin: number;
  priceMax?: number;
  parish: string;
  averageRating?: number;
  totalReviews: number;
  isActive: boolean;
  createdAt: string;
}

export default function ServicesPage() {
  const [services, setServices] = useState<ServiceListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchServices() {
      const res = await apiClient<ServiceListItem[]>('/api/services/my');
      if (res.success) {
        setServices(res.data);
      } else {
        setError(res.error.message);
      }
      setLoading(false);
    }
    fetchServices();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this service?')) return;
    const res = await apiClient(`/api/services/${id}`, { method: 'DELETE' });
    if (res.success) {
      setServices((prev) => prev.filter((s) => s.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Services</h1>
          <p className="mt-1 text-gray-600">Manage your service listings</p>
        </div>
        <Link
          href="/dashboard/services/new"
          className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Create New Service
        </Link>
      </div>

      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : error ? (
        <div className="rounded-lg bg-red-50 p-6 text-center text-red-700">{error}</div>
      ) : services.length === 0 ? (
        <div className="rounded-xl bg-white p-12 text-center shadow-sm">
          <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <p className="mt-4 text-gray-500">No services yet</p>
          <Link
            href="/dashboard/services/new"
            className="mt-4 inline-block rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Create your first service
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <div key={service.id} className="rounded-xl bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{service.title}</h3>
                  {service.categoryName && (
                    <p className="mt-0.5 text-sm text-gray-500">{service.categoryName}</p>
                  )}
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    service.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {service.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="mt-4 flex items-center gap-4 text-sm text-gray-600">
                <span>{service.parish}</span>
                <span>
                  ${service.priceMin}
                  {service.priceMax ? ` - $${service.priceMax}` : ''}
                </span>
              </div>

              {service.averageRating != null && (
                <div className="mt-2 flex items-center gap-1 text-sm">
                  <svg className="h-4 w-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="font-medium text-gray-900">{service.averageRating.toFixed(1)}</span>
                  <span className="text-gray-400">({service.totalReviews})</span>
                </div>
              )}

              <div className="mt-4 flex gap-2">
                <Link
                  href={`/dashboard/services/${service.id}/edit`}
                  className="flex-1 rounded-lg border border-gray-300 py-2 text-center text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(service.id)}
                  className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
