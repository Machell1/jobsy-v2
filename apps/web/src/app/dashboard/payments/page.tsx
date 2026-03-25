'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface PaymentItem {
  id: string;
  bookingId: string;
  serviceTitle?: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
}

interface EarningsSummary {
  totalEarnings: number;
  pendingPayouts: number;
  completedPayouts: number;
  stripeOnboarded: boolean;
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  PROCESSING: 'bg-blue-100 text-blue-800',
  SUCCEEDED: 'bg-green-100 text-green-800',
  FAILED: 'bg-red-100 text-red-800',
  REFUNDED: 'bg-gray-100 text-gray-800',
};

export default function PaymentsPage() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [earnings, setEarnings] = useState<EarningsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [connectLoading, setConnectLoading] = useState(false);

  const isProvider = user?.role === 'PROVIDER';

  useEffect(() => {
    async function fetchData() {
      const [paymentsRes, earningsRes] = await Promise.all([
        apiClient<PaymentItem[]>('/api/payments'),
        isProvider
          ? apiClient<EarningsSummary>('/api/payments/earnings')
          : Promise.resolve(null),
      ]);
      if (paymentsRes.success) {
        setPayments(paymentsRes.data);
      } else {
        setError(paymentsRes.error.message);
      }
      if (earningsRes && earningsRes.success) {
        setEarnings(earningsRes.data);
      }
      setLoading(false);
    }
    fetchData();
  }, [isProvider]);

  const handleStripeConnect = async () => {
    setConnectLoading(true);
    const res = await apiClient<{ url: string }>('/api/payments/connect-onboard', {
      method: 'POST',
    });
    if (res.success) {
      window.location.href = res.data.url;
    } else {
      setError(res.error.message);
    }
    setConnectLoading(false);
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
        <p className="mt-1 text-gray-600">
          {isProvider ? 'Track your earnings and payouts' : 'View your payment history'}
        </p>
      </div>

      {/* Provider earnings summary */}
      {isProvider && earnings && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">Total Earnings</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">
              ${earnings.totalEarnings.toLocaleString()}
            </p>
          </div>
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">Pending Payouts</p>
            <p className="mt-1 text-2xl font-bold text-yellow-600">
              ${earnings.pendingPayouts.toLocaleString()}
            </p>
          </div>
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">Completed Payouts</p>
            <p className="mt-1 text-2xl font-bold text-green-600">
              ${earnings.completedPayouts.toLocaleString()}
            </p>
          </div>
        </div>
      )}

      {/* Stripe Connect CTA */}
      {isProvider && earnings && !earnings.stripeOnboarded && (
        <div className="rounded-xl border-2 border-dashed border-indigo-200 bg-indigo-50 p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-100">
              <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-indigo-900">Set up payouts</h3>
              <p className="text-sm text-indigo-700">
                Connect your Stripe account to start receiving payments for your services.
              </p>
            </div>
            <button
              onClick={handleStripeConnect}
              disabled={connectLoading}
              className="rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {connectLoading ? <LoadingSpinner size="sm" /> : 'Connect Stripe'}
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">{error}</div>
      )}

      {/* Payment history table */}
      {payments.length === 0 ? (
        <div className="rounded-xl bg-white p-12 text-center shadow-sm">
          <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <p className="mt-4 text-gray-500">No payment history</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Service</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {payments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                    {payment.serviceTitle || 'Booking #' + payment.bookingId.slice(0, 8)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                    ${payment.amount.toFixed(2)} {payment.currency}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[payment.status] || 'bg-gray-100 text-gray-800'}`}
                    >
                      {payment.status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {new Date(payment.createdAt).toLocaleDateString()}
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
