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
  const [bookingCreated, setBookingCreated] = useState<string | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);

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
      setBookingCreated(res.data.id);
    } else {
      setError(res.error.message);
    }
  };

  const handlePayment = async () => {
    if (!bookingCreated || !service) return;
    setPaymentLoading(true);
    const res = await apiClient<{ clientSecret: string }>('/api/payments/create-intent', {
      method: 'POST',
      body: JSON.stringify({
        bookingId: bookingCreated,
        amount: service.priceMin,
      }),
    });
    if (res.success) {
      // In a full implementation, Stripe Elements would be mounted here
      // For now, redirect to booking detail
      router.push(`/dashboard/bookings/${bookingCreated}`);
    } else {
      setError(res.error.message);
    }
    setPaymentLoading(false);
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
          <Link href="/" className="mt-4 inline-block text-sm font-medium text-blue-600 hover:text-blue-500">
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
          <h1 className="text-2xl font-bold text-gray-900">Book Service</h1>

          {bookingCreated ? (
            <div className="mt-6 space-y-6">
              <div className="rounded-lg bg-green-50 p-4 text-green-700">
                <p className="font-medium">Booking created successfully!</p>
                <p className="mt-1 text-sm">Complete the payment to confirm your booking.</p>
              </div>

              <div className="rounded-xl bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900">Payment</h2>
                <p className="mt-2 text-sm text-gray-600">
                  Stripe Elements payment form will be integrated here.
                </p>
                <div className="mt-6 rounded-lg border-2 border-dashed border-gray-200 p-8 text-center text-gray-400">
                  <p className="text-sm">Stripe payment form placeholder</p>
                </div>
                <button
                  onClick={handlePayment}
                  disabled={paymentLoading}
                  className="mt-6 flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {paymentLoading ? <LoadingSpinner size="sm" /> : 'Proceed to Payment'}
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-6">
              {error && (
                <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">{error}</div>
              )}

              <input type="hidden" {...register('serviceId')} />

              <div className="rounded-xl bg-white p-6 shadow-sm space-y-5">
                <div>
                  <label htmlFor="scheduledDate" className="block text-sm font-medium text-gray-700">
                    Preferred Date
                  </label>
                  <input
                    id="scheduledDate"
                    type="date"
                    {...register('scheduledDate')}
                    min={new Date().toISOString().split('T')[0]}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Address where service will be performed"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {isSubmitting ? <LoadingSpinner size="sm" /> : 'Create Booking'}
              </button>
            </form>
          )}
        </div>

        {/* Service summary sidebar */}
        {service && (
          <div className="lg:col-span-2">
            <div className="sticky top-8 rounded-xl bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900">{service.title}</h2>
              <p className="mt-1 text-sm text-gray-500">by {service.providerName}</p>

              <div className="mt-4 space-y-3 border-t border-gray-100 pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Price</span>
                  <span className="font-medium text-gray-900">
                    ${service.priceMin}
                    {service.priceMax ? ` - $${service.priceMax}` : ''}{' '}
                    {service.priceCurrency}
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
