'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface AdminService {
  id: string;
  title: string;
  providerName: string;
  categoryName: string;
  parish: string;
  priceMin: number;
  isActive: boolean;
  isFeatured: boolean;
  averageRating?: number;
  totalReviews: number;
  createdAt: string;
}

export default function AdminServicesPage() {
  const [services, setServices] = useState<AdminService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchServices();
  }, []);

  async function fetchServices() {
    setLoading(true);
    const res = await apiClient<AdminService[]>('/api/admin/services');
    if (res.success) {
      setServices(res.data);
    } else {
      setError(res.error.message);
    }
    setLoading(false);
  }

  const handleFeatureToggle = async (id: string, isFeatured: boolean) => {
    setActionLoading(id);
    const res = await apiClient(`/api/admin/services/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ isFeatured: !isFeatured }),
    });
    if (res.success) {
      setServices((prev) =>
        prev.map((s) => (s.id === id ? { ...s, isFeatured: !isFeatured } : s))
      );
    }
    setActionLoading(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Service Management</h1>
        <p className="mt-1 text-gray-600">Manage platform service listings</p>
      </div>

      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : error ? (
        <div className="rounded-lg bg-red-50 p-6 text-center text-red-700">{error}</div>
      ) : services.length === 0 ? (
        <div className="rounded-xl bg-white p-12 text-center shadow-sm">
          <p className="text-gray-500">No services found</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Service</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Provider</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Rating</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {services.map((service) => (
                <tr key={service.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-6 py-4">
                    <p className="font-medium text-gray-900">{service.title}</p>
                    <p className="text-sm text-gray-500">{service.parish}</p>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                    {service.providerName}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                    {service.categoryName}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                    ${service.priceMin}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                    {service.averageRating != null
                      ? `${service.averageRating.toFixed(1)} (${service.totalReviews})`
                      : 'No reviews'}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          service.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {service.isActive ? 'Active' : 'Inactive'}
                      </span>
                      {service.isFeatured && (
                        <span className="rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
                          Featured
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right">
                    <button
                      onClick={() => handleFeatureToggle(service.id, service.isFeatured)}
                      disabled={actionLoading === service.id}
                      className={`text-sm font-medium disabled:opacity-50 ${
                        service.isFeatured
                          ? 'text-gray-600 hover:text-gray-500'
                          : 'text-yellow-600 hover:text-yellow-500'
                      }`}
                    >
                      {actionLoading === service.id ? (
                        <LoadingSpinner size="sm" />
                      ) : service.isFeatured ? (
                        'Unfeature'
                      ) : (
                        'Feature'
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
