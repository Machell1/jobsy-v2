'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ForgotPasswordSchema, type ForgotPasswordInput } from '@jobsy/shared';
import { apiClient } from '@/lib/api';
import Link from 'next/link';
import { LoadingSpinner } from '@/components/LoadingSpinner';

export default function ForgotPasswordPage() {
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(ForgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    setServerError('');
    const res = await apiClient('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (res.success) {
      setSuccess(true);
    } else {
      setServerError(res.error.message);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-8 shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Reset your password</h1>
          <p className="mt-2 text-gray-600">
            Enter your email and we&apos;ll send you a reset link
          </p>
        </div>

        {success ? (
          <div className="space-y-4">
            <div className="rounded-md bg-green-50 p-4 text-sm text-green-700">
              If an account exists with that email, you will receive a password reset link shortly.
            </div>
            <Link
              href="/login"
              className="block text-center text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              Back to sign in
            </Link>
          </div>
        ) : (
          <>
            {serverError && (
              <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">
                {serverError}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  {...register('email')}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="you@example.com"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {isSubmitting ? <LoadingSpinner size="sm" /> : 'Send reset link'}
              </button>
            </form>

            <p className="text-center text-sm text-gray-600">
              <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
                Back to sign in
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
