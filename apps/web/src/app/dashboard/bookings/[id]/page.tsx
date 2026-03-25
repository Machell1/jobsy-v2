'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import Link from 'next/link';

interface BookingDetail {
  id: string;
  serviceId: string;
  serviceTitle: string;
  serviceDescription?: string;
  customerId: string;
  customerName: string;
  providerId: string;
  providerName: string;
  status: string;
  scheduledDate: string;
  scheduledTime?: string;
  duration?: number;
  notes?: string;
  locationAddress?: string;
  totalAmount?: number;
  platformFee?: number;
  providerPayout?: number;
  cancellationReason?: string;
  createdAt: string;
  payment?: {
    id: string;
    status: string;
    amount: number;
    currency: string;
  };
}

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

export default function BookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState('');

  useEffect(() => {
    async function fetchBooking() {
      const res = await apiClient<BookingDetail>(`/api/bookings/${params.id}`);
      if (res.success) {
        setBooking(res.data);
      } else {
        setError(res.error.message);
      }
      setLoading(false);
    }
    fetchBooking();
  }, [params.id]);

  const handleStatusAction = async (status: string) => {
    setActionLoading(status);
    const res = await apiClient<BookingDetail>(`/api/bookings/${params.id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    if (res.success) {
      setBooking(res.data);
    } else {
      setError(res.error.message);
    }
    setActionLoading('');
  };

  const handleCancel = async () => {
    const reason = window.prompt('Reason for cancellation (optional):');
    setActionLoading('CANCELLED');
    const res = await apiClient<BookingDetail>(`/api/bookings/${params.id}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason: reason || undefined }),
    });
    if (res.success) {
      setBooking(res.data);
    } else {
      setError(res.error.message);
    }
    setActionLoading('');
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="rounded-lg bg-red-50 p-6 text-center text-red-700">
        <p className="font-medium">Failed to load booking</p>
        <p className="mt-1 text-sm">{error}</p>
        <button
          onClick={() => router.push('/dashboard/bookings')}
          className="mt-4 text-sm font-medium text-blue-600 hover:text-blue-500"
        >
          Back to bookings
        </button>
      </div>
    );
  }

  const isProvider = user?.id === booking.providerId;
  const isCustomer = user?.id === booking.customerId;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push('/dashboard/bookings')}
          className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Booking Details</h1>
          <p className="text-sm text-gray-500">#{booking.id.slice(0, 8)}</p>
        </div>
        <span
          className={`ml-auto rounded-full px-3 py-1 text-sm font-medium ${STATUS_COLORS[booking.status] || 'bg-gray-100 text-gray-800'}`}
        >
          {booking.status.replace('_', ' ')}
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main info */}
        <div className="space-y-6 lg:col-span-2">
          {/* Service info */}
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">Service</h2>
            <div className="mt-4 space-y-3">
              <div>
                <p className="font-medium text-gray-900">{booking.serviceTitle}</p>
                {booking.serviceDescription && (
                  <p className="mt-1 text-sm text-gray-600">{booking.serviceDescription}</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Date</p>
                  <p className="font-medium text-gray-900">
                    {new Date(booking.scheduledDate).toLocaleDateString()}
                  </p>
                </div>
                {booking.scheduledTime && (
                  <div>
                    <p className="text-gray-500">Time</p>
                    <p className="font-medium text-gray-900">{booking.scheduledTime}</p>
                  </div>
                )}
                {booking.duration && (
                  <div>
                    <p className="text-gray-500">Duration</p>
                    <p className="font-medium text-gray-900">{booking.duration} min</p>
                  </div>
                )}
                {booking.locationAddress && (
                  <div>
                    <p className="text-gray-500">Location</p>
                    <p className="font-medium text-gray-900">{booking.locationAddress}</p>
                  </div>
                )}
              </div>
              {booking.notes && (
                <div>
                  <p className="text-sm text-gray-500">Notes</p>
                  <p className="mt-1 text-sm text-gray-700">{booking.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* People */}
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">People</h2>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Customer</p>
                <p className="font-medium text-gray-900">{booking.customerName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Provider</p>
                <p className="font-medium text-gray-900">{booking.providerName}</p>
              </div>
            </div>
          </div>

          {/* Cancellation reason */}
          {booking.cancellationReason && (
            <div className="rounded-xl bg-red-50 p-6">
              <h2 className="text-lg font-semibold text-red-800">Cancellation Reason</h2>
              <p className="mt-2 text-sm text-red-700">{booking.cancellationReason}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Payment info */}
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">Payment</h2>
            <div className="mt-4 space-y-3">
              {booking.totalAmount != null ? (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Total</span>
                    <span className="font-medium text-gray-900">
                      ${booking.totalAmount.toFixed(2)}
                    </span>
                  </div>
                  {booking.platformFee != null && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Platform Fee</span>
                      <span className="text-gray-600">${booking.platformFee.toFixed(2)}</span>
                    </div>
                  )}
                  {booking.providerPayout != null && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Provider Payout</span>
                      <span className="text-gray-600">${booking.providerPayout.toFixed(2)}</span>
                    </div>
                  )}
                  {booking.payment && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Payment Status</span>
                      <span className="font-medium">{booking.payment.status}</span>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-sm text-gray-500">No payment information</p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">Actions</h2>
            <div className="mt-4 space-y-3">
              {isProvider && booking.status === 'PENDING' && (
                <>
                  <button
                    onClick={() => handleStatusAction('ACCEPTED')}
                    disabled={!!actionLoading}
                    className="flex w-full items-center justify-center rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                  >
                    {actionLoading === 'ACCEPTED' ? <LoadingSpinner size="sm" /> : 'Accept Booking'}
                  </button>
                  <button
                    onClick={() => handleStatusAction('DECLINED')}
                    disabled={!!actionLoading}
                    className="flex w-full items-center justify-center rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                  >
                    {actionLoading === 'DECLINED' ? <LoadingSpinner size="sm" /> : 'Decline Booking'}
                  </button>
                </>
              )}

              {isProvider && booking.status === 'ACCEPTED' && (
                <button
                  onClick={() => handleStatusAction('IN_PROGRESS')}
                  disabled={!!actionLoading}
                  className="flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {actionLoading === 'IN_PROGRESS' ? <LoadingSpinner size="sm" /> : 'Start Service'}
                </button>
              )}

              {isProvider && booking.status === 'IN_PROGRESS' && (
                <button
                  onClick={() => handleStatusAction('COMPLETED')}
                  disabled={!!actionLoading}
                  className="flex w-full items-center justify-center rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                >
                  {actionLoading === 'COMPLETED' ? <LoadingSpinner size="sm" /> : 'Mark Complete'}
                </button>
              )}

              {isCustomer && ['PENDING', 'ACCEPTED'].includes(booking.status) && (
                <button
                  onClick={handleCancel}
                  disabled={!!actionLoading}
                  className="flex w-full items-center justify-center rounded-lg border border-red-300 px-4 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
                >
                  {actionLoading === 'CANCELLED' ? <LoadingSpinner size="sm" /> : 'Cancel Booking'}
                </button>
              )}

              <Link
                href="/dashboard/messages"
                className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-center text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Open Chat
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
