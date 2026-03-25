'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import Link from 'next/link';

interface DashboardData {
  recentBookings: Array<{
    id: string;
    serviceTitle: string;
    status: string;
    scheduledDate: string;
    totalAmount: number;
  }>;
  stats: {
    totalBookings: number;
    activeBookings: number;
    completedBookings: number;
    totalEarnings?: number;
    totalServices?: number;
    pendingRequests?: number;
    savedServices?: number;
  };
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  ACCEPTED: 'bg-blue-100 text-blue-800',
  IN_PROGRESS: 'bg-indigo-100 text-indigo-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-gray-100 text-gray-800',
  DECLINED: 'bg-red-100 text-red-800',
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchDashboard() {
      const res = await apiClient<DashboardData>('/api/users/dashboard');
      if (res.success) {
        setData(res.data);
      } else {
        setError(res.error.message);
      }
      setLoading(false);
    }
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-6 text-center text-red-700">
        <p className="font-medium">Failed to load dashboard</p>
        <p className="mt-1 text-sm">{error}</p>
      </div>
    );
  }

  const isProvider = user?.role === 'PROVIDER';

  const statCards = isProvider
    ? [
        { label: 'Total Bookings', value: data?.stats.totalBookings ?? 0, color: 'bg-blue-500' },
        { label: 'Pending Requests', value: data?.stats.pendingRequests ?? 0, color: 'bg-yellow-500' },
        { label: 'Active Services', value: data?.stats.totalServices ?? 0, color: 'bg-indigo-500' },
        { label: 'Total Earnings', value: `$${(data?.stats.totalEarnings ?? 0).toLocaleString()}`, color: 'bg-green-500' },
      ]
    : [
        { label: 'Total Bookings', value: data?.stats.totalBookings ?? 0, color: 'bg-blue-500' },
        { label: 'Active Bookings', value: data?.stats.activeBookings ?? 0, color: 'bg-indigo-500' },
        { label: 'Completed', value: data?.stats.completedBookings ?? 0, color: 'bg-green-500' },
        { label: 'Saved Services', value: data?.stats.savedServices ?? 0, color: 'bg-purple-500' },
      ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.firstName}
        </h1>
        <p className="mt-1 text-gray-600">
          {isProvider ? 'Manage your services and bookings' : 'Track your bookings and discover services'}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <div key={card.label} className="rounded-xl bg-white p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className={`h-12 w-12 rounded-lg ${card.color} flex items-center justify-center`}>
                <span className="text-lg font-bold text-white">
                  {typeof card.value === 'number' ? card.value : '$'}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-500">{card.label}</p>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Bookings */}
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            {isProvider ? 'Recent Booking Requests' : 'Recent Bookings'}
          </h2>
          <Link
            href="/dashboard/bookings"
            className="text-sm font-medium text-blue-600 hover:text-blue-500"
          >
            View all
          </Link>
        </div>

        {!data?.recentBookings?.length ? (
          <div className="mt-8 text-center text-gray-500">
            <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="mt-2 text-sm">No bookings yet</p>
          </div>
        ) : (
          <div className="mt-4 divide-y divide-gray-100">
            {data.recentBookings.map((booking) => (
              <Link
                key={booking.id}
                href={`/dashboard/bookings/${booking.id}`}
                className="flex items-center justify-between py-4 hover:bg-gray-50 -mx-2 px-2 rounded-lg transition-colors"
              >
                <div>
                  <p className="font-medium text-gray-900">{booking.serviceTitle}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(booking.scheduledDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {booking.totalAmount != null && (
                    <span className="text-sm font-medium text-gray-900">
                      ${booking.totalAmount.toFixed(2)}
                    </span>
                  )}
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[booking.status] || 'bg-gray-100 text-gray-800'}`}
                  >
                    {booking.status.replace('_', ' ')}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
