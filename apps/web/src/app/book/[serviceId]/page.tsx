'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateBookingSchema, type CreateBookingInput } from '@jobsy/shared';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api';
import { useParams, useRouter } from 'next/navigation';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import Link from 'next/link';

interface ServiceInfo {
  id: string;
  title: string;
  description: string;
  priceMin: number;
  priceMax?: number;
  priceCurrency: string;
  priceUnit: string;
  providerName: string;
  parish: string;
  averageRating?: number;
  totalReviews: number;
}

export default function BookServicePage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [service, setService] = useState<ServiceInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bookingId, setBookingId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateBookingInput>({
    resolver: zodResolver(CreateBookingSchema),
    defaultValues: {
      serviceId: params.serviceId as string,
    },
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push(`/login?redirect=/book/${params.serviceId}`);
      return;
    }
    async function fetchService() {
      const res = await apiClient<ServiceInfo>(`/api/services/${params.serviceId}`);
      if (res.success) {
        setService(res.data);
      } else {
        setError(res.error.message);
      }
      setLoading(false);
    }
    if (isAuthenticated) fetchService();
  }, [params.serviceId, isAuthenticated, authLoading, router]);

  const onSubmit = async (data: CreateBookingInput) => {
    setError('');
    const res = await apiClient<{ id: string }>('/api/bookings', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (res.success) {
      setBookingId(res.data.id);
    } else {
      setError(res.error.message);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error && !service) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="rounded-xl bg-white p-8 text-center shadow-lg">
          <p className="text-red-600">{error}</p>
          <Link href="/" className="mt-4 inline-block text-sm font-medium text-[var(--primary)] hover:underline">
            Go home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="grid gap-8 lg:grid-cols-5">
        {/* Booking form */}
        <div className="lg:col-span-3">
          <h1 className="text-2xl font-bold text-gray-900">Request Booking</h1>
          <p className="mt-1 text-sm text-gray-500">Free to book - the provider will confirm your request.</p>

          {bookingId ? (
            <div className="mt-8 rounded-2xl bg-white p-8 shadow-sm text-center border border-[var(--border)]">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--primary-light)]">
                <svg className="h-8 w-8 text-[var(--primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="mt-4 text-xl font-bold text-gray-900">Booking Request Sent!</h2>
              <p className="mt-2 text-sm text-gray-600">
                The provider will review your request and confirm shortly. You'll receive a notification when they respond.
              </p>
              <p className="mt-1 text-xs text-gray-400">No payment required.</p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Link
                  href="/dashboard/bookings"
                  className="rounded-lg bg-[var(--primary)] px-6 py-3 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
                >
                  View My Bookings
                </Link>
                <Link
                  href="/services"
                  className="rounded-lg border border-[var(--border)] px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Browse More Services
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-6">
              {error && (
                <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">{error}</div>
              )}

              <input type="hidden" {...register('serviceId')} />

              <div className="rounded-xl bg-white p-6 shadow-sm border border-[var(--border)] space-y-5">
                <div>
                  <label htmlFor="scheduledDate" className="block text-sm font-medium text-gray-700">
                    Preferred Date
                  </label>
                  <input
                    id="scheduledDate"
                    type="date"
                    {...register('scheduledDate')}
                    min={new Date().toISOString().split('T')[0]}
                    className="mt-1 block w-full rounded-lg border border-[var(--border)] px-4 py-3 text-gray-900 focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20"
                  />
                  {errors.scheduledDate && (
                    <p className="mt-1 text-sm text-red-600">{errors.scheduledDate.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="scheduledTime" className="block text-sm font-medium text-gray-700">
                    Preferred Time
                  </label>
                  <input
                    id="scheduledTime"
                    type="time"
                    {...register('scheduledTime')}
                    className="mt-1 block w-full rounded-lg border border-[var(--border)] px-4 py-3 text-gray-900 focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20"
                  />
                </div>

                <div>
                  <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
                    Duration (minutes) <span className="text-gray-400">(optional)</span>
                  </label>
                  <input
                    id="duration"
                    type="number"
                    min={15}
                    step={15}
                    {...register('duration', { valueAsNumber: true })}
                    className="mt-1 block w-full rounded-lg border border-[var(--border)] px-4 py-3 text-gray-900 focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20"
                    placeholder="60"
                  />
                </div>

                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                    Additional Notes
                  </label>
                  <textarea
                    id="notes"
                    rows={3}
                    {...register('notes')}
                    className="mt-1 block w-full rounded-lg border border-[var(--border)] px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20"
                    placeholder="Any specific requirements or details..."
                  />
                </div>

                <div>
                  <label htmlFor="locationAddress" className="block text-sm font-medium text-gray-700">
                    Service Location <span className="text-gray-400">(optional)</span>
                  </label>
                  <input
                    id="locationAddress"
                    type="text"
                    {...register('locationAddress')}
                    className="mt-1 block w-full rounded-lg border border-[var(--border)] px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20"
                    placeholder="Address where service will be performed"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full items-center justify-center rounded-lg bg-[var(--primary)] px-4 py-3 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                {isSubmitting ? <LoadingSpinner size="sm" /> : 'Send Booking Request - Free'}
              </button>
              <p className="text-center text-xs text-gray-400">No payment required. The provider will confirm your booking.</p>
            </form>
          )}
        </div>

        {/* Service summary sidebar */}
        {service && (
          <div className="lg:col-span-2">
            <div className="sticky top-8 rounded-xl bg-white p-6 shadow-sm border border-[var(--border)]">
              <h2 className="text-lg font-semibold text-gray-900">{service.title}</h2>
              <p className="mt-1 text-sm text-gray-500">by {service.providerName}</p>

              <div className="mt-4 space-y-3 border-t border-gray-100 pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Price</span>
                  <span className="font-medium text-[var(--primary)]">
                    J${service.priceMin.toLocaleString()}
                    {service.priceMax ? ` - J$${service.priceMax.toLocaleString()}` : ''}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Location</span>
                  <span className="text-gray-900">{service.parish}</span>
                </div>
                {service.averageRating != null && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Rating</span>
                    <span className="text-gray-900">
                      {service.averageRating.toFixed(1)} ({service.totalReviews} reviews)
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-4 rounded-lg bg-[var(--primary-light)] p-3">
                <p className="text-xs font-medium text-[var(--primary)]">Free to book on Jobsy</p>
                <p className="text-xs text-emerald-700 mt-0.5">No platform fees, no payment upfront.</p>
              </div>

              <div className="mt-4 border-t border-gray-100 pt-4">
                <p className="text-sm text-gray-600 line-clamp-4">{service.description}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
