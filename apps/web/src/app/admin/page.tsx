'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface AdminStats {
  totalUsers: number;
  totalServices: number;
  totalBookings: number;
  totalRevenue: number;
  newUsersToday?: number;
  activeBookings?: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchStats() {
      const res = await apiClient<AdminStats>('/api/admin/stats');
      if (res.success) {
        setStats(res.data);
      } else {
        setError(res.error.message);
      }
      setLoading(false);
    }
    fetchStats();
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
      <div className="rounded-lg bg-red-50 p-6 text-center text-red-700">{error}</div>
    );
  }

  const cards = [
    {
      label: 'Total Users',
      value: stats?.totalUsers ?? 0,
      icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
      color: 'bg-blue-500',
      bgLight: 'bg-blue-50',
    },
    {
      label: 'Total Services',
      value: stats?.totalServices ?? 0,
      icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10',
      color: 'bg-indigo-500',
      bgLight: 'bg-indigo-50',
    },
    {
      label: 'Total Bookings',
      value: stats?.totalBookings ?? 0,
      icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
      color: 'bg-green-500',
      bgLight: 'bg-green-50',
    },
    {
      label: 'Total Revenue',
      value: `$${(stats?.totalRevenue ?? 0).toLocaleString()}`,
      icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
      color: 'bg-emerald-500',
      bgLight: 'bg-emerald-50',
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-1 text-gray-600">Platform overview and management</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="rounded-xl bg-white p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${card.color}`}>
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={card.icon} />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500">{card.label}</p>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick stats row */}
      {stats && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h3 className="font-semibold text-gray-900">New Users Today</h3>
            <p className="mt-2 text-3xl font-bold text-blue-600">{stats.newUsersToday ?? 0}</p>
          </div>
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h3 className="font-semibold text-gray-900">Active Bookings</h3>
            <p className="mt-2 text-3xl font-bold text-green-600">{stats.activeBookings ?? 0}</p>
          </div>
        </div>
      )}
    </div>
  );
}
