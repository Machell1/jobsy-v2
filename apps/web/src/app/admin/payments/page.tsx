'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface AdminPayment {
  id: string;
  bookingId: string;
  serviceTitle?: string;
  customerName: string;
  providerName: string;
  amount: number;
  currency: string;
  status: string;
  platformFee?: number;
  providerPayout?: number;
  createdAt: string;
}

interface PaymentReport {
  totalRevenue: number;
  totalPlatformFees: number;
  totalPayouts: number;
  transactionCount: number;
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  PROCESSING: 'bg-blue-100 text-blue-800',
  SUCCEEDED: 'bg-green-100 text-green-800',
  FAILED: 'bg-red-100 text-red-800',
  REFUNDED: 'bg-gray-100 text-gray-800',
};

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<AdminPayment[]>([]);
  const [report, setReport] = useState<PaymentReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchData() {
      const [paymentsRes, reportRes] = await Promise.all([
        apiClient<AdminPayment[]>('/api/admin/payments'),
        apiClient<PaymentReport>('/api/admin/payments/report'),
      ]);
      if (paymentsRes.success) setPayments(paymentsRes.data);
      else setError(paymentsRes.error.message);
      if (reportRes.success) setReport(reportRes.data);
      setLoading(false);
    }
    fetchData();
  }, []);

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
        <h1 className="text-2xl font-bold text-gray-900">Payment Reports</h1>
        <p className="mt-1 text-gray-600">Financial overview and transaction history</p>
      </div>

      {/* Summary cards */}
      {report && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">Total Revenue</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">
              ${report.totalRevenue.toLocaleString()}
            </p>
          </div>
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">Platform Fees</p>
            <p className="mt-1 text-2xl font-bold text-emerald-600">
              ${report.totalPlatformFees.toLocaleString()}
            </p>
          </div>
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">Provider Payouts</p>
            <p className="mt-1 text-2xl font-bold text-blue-600">
              ${report.totalPayouts.toLocaleString()}
            </p>
          </div>
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">Transactions</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">
              {report.transactionCount}
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">{error}</div>
      )}

      {/* Payments table */}
      {payments.length === 0 ? (
        <div className="rounded-xl bg-white p-12 text-center shadow-sm">
          <p className="text-gray-500">No payments found</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Service</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Provider</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Fee</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {payments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                    {payment.serviceTitle || '#' + payment.bookingId.slice(0, 8)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                    {payment.customerName}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                    {payment.providerName}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                    ${payment.amount.toFixed(2)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                    {payment.platformFee != null ? `$${payment.platformFee.toFixed(2)}` : '-'}
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
