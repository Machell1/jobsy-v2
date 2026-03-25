'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import Link from 'next/link';

interface AdminBooking {
  id: string;
  serviceTitle: string;
  customerName: string;
  providerName: string;
  status: string;
  scheduledDate: string;
  totalAmount?: number;
  createdAt: string;
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  ACCEPTED: 'bg-blue-100 text-blue-800',
  IN_PROGRESS: 'bg-indigo-100 text-indigo-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-gray-100 text-gray-800',
  DECLINED: 'bg-red-100 text-red-800',
  DISPUTED: 'bg-orange-100 text-orange-800',
  REVIEWED: 'bg-emerald-100 text-emerald-800',
};

const ALL_STATUSES = ['', 'PENDING', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'DECLINED', 'DISPUTED'];

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    async function fetchBookings() {
      setLoading(true);
      const query = statusFilter ? `?status=${statusFilter}` : '';
      const res = await apiClient<AdminBooking[]>(`/api/admin/bookings${query}`);
      if (res.success) {
        setBookings(res.data);
      } else {
        setError(res.error.message);
      }
      setLoading(false);
    }
    fetchBookings();
  }, [statusFilter]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">All Bookings</h1>
        <p className="mt-1 text-gray-600">View and monitor all platform bookings</p>
      </div>

      <div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">All Statuses</option>
          {ALL_STATUSES.filter(Boolean).map((s) => (
            <option key={s} value={s}>
              {s.replace('_', ' ')}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : error ? (
        <div className="rounded-lg bg-red-50 p-6 text-center text-red-700">{error}</div>
      ) : bookings.length === 0 ? (
        <div className="rounded-xl bg-white p-12 text-center shadow-sm">
          <p className="text-gray-500">No bookings found</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Service</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Provider</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {bookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                    {booking.serviceTitle}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                    {booking.customerName}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                    {booking.providerName}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                    {new Date(booking.scheduledDate).toLocaleDateString()}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                    {booking.totalAmount != null ? `$${booking.totalAmount.toFixed(2)}` : '-'}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[booking.status] || 'bg-gray-100 text-gray-800'}`}
                    >
                      {booking.status.replace('_', ' ')}
                    </span>
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
