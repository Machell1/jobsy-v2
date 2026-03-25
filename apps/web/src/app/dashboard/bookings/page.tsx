'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import Link from 'next/link';

interface BookingListItem {
  id: string;
  serviceTitle: string;
  providerName?: string;
  customerName?: string;
  status: string;
  scheduledDate: string;
  scheduledTime?: string;
  totalAmount?: number;
}

const TABS = ['All', 'Pending', 'Active', 'Completed'] as const;

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  ACCEPTED: 'bg-blue-100 text-blue-800',
  IN_PROGRESS: 'bg-indigo-100 text-indigo-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-gray-100 text-gray-800',
  DECLINED: 'bg-red-100 text-red-800',
  REVIEWED: 'bg-emerald-100 text-emerald-800',
  DISPUTED: 'bg-orange-100 text-orange-800',
};

function statusForTab(tab: string): string {
  switch (tab) {
    case 'Pending':
      return 'PENDING';
    case 'Active':
      return 'ACCEPTED,IN_PROGRESS';
    case 'Completed':
      return 'COMPLETED,REVIEWED';
    default:
      return '';
  }
}

export default function BookingsPage() {
  const [activeTab, setActiveTab] = useState<string>('All');
  const [bookings, setBookings] = useState<BookingListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchBookings() {
      setLoading(true);
      const statusFilter = statusForTab(activeTab);
      const query = statusFilter ? `?status=${statusFilter}` : '';
      const res = await apiClient<BookingListItem[]>(`/api/bookings${query}`);
      if (res.success) {
        setBookings(res.data);
      } else {
        setError(res.error.message);
      }
      setLoading(false);
    }
    fetchBookings();
  }, [activeTab]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
        <p className="mt-1 text-gray-600">Manage your bookings</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg bg-gray-100 p-1">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : error ? (
        <div className="rounded-lg bg-red-50 p-6 text-center text-red-700">{error}</div>
      ) : bookings.length === 0 ? (
        <div className="rounded-xl bg-white p-12 text-center shadow-sm">
          <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="mt-4 text-gray-500">No bookings found</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Service</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Price</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {bookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-6 py-4">
                    <p className="font-medium text-gray-900">{booking.serviceTitle}</p>
                    <p className="text-sm text-gray-500">
                      {booking.providerName || booking.customerName || ''}
                    </p>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                    {new Date(booking.scheduledDate).toLocaleDateString()}
                    {booking.scheduledTime && (
                      <span className="ml-1 text-gray-400">{booking.scheduledTime}</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[booking.status] || 'bg-gray-100 text-gray-800'}`}
                    >
                      {booking.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                    {booking.totalAmount != null ? `$${booking.totalAmount.toFixed(2)}` : '-'}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right">
                    <Link
                      href={`/dashboard/bookings/${booking.id}`}
                      className="text-sm font-medium text-blue-600 hover:text-blue-500"
                    >
                      View
                    </Link>
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
