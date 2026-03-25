'use client';

import { Suspense, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiClient } from '@/lib/api';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { LoadingSpinner } from '@/components/LoadingSpinner';

const ResetPasswordFormSchema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type ResetPasswordFormData = z.infer<typeof ResetPasswordFormSchema>;

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(ResetPasswordFormSchema),
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      setServerError('Missing reset token. Please use the link from your email.');
      return;
    }
    setServerError('');
    const res = await apiClient('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password: data.password }),
    });
    if (res.success) {
      setSuccess(true);
    } else {
      setServerError(res.error.message);
    }
  };

  if (!token) {
    return (
      <div className="w-full max-w-md space-y-6 rounded-xl bg-white p-8 shadow-lg text-center">
        <h1 className="text-2xl font-bold text-gray-900">Invalid reset link</h1>
        <p className="text-gray-600">This password reset link is invalid or has expired.</p>
        <Link href="/forgot-password" className="inline-block rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700">
          Request new link
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-8 shadow-lg">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Set new password</h1>
        <p className="mt-2 text-gray-600">Enter your new password below</p>
      </div>

      {success ? (
        <div className="space-y-4">
          <div className="rounded-md bg-green-50 p-4 text-sm text-green-700">Your password has been reset successfully.</div>
          <Link href="/login" className="block w-full rounded-lg bg-blue-600 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-blue-700">
            Sign in with new password
          </Link>
        </div>
      ) : (
        <>
          {serverError && <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">{serverError}</div>}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">New password</label>
              <input id="password" type="password" autoComplete="new-password" {...register('password')} className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="At least 8 characters" />
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm new password</label>
              <input id="confirmPassword" type="password" autoComplete="new-password" {...register('confirmPassword')} className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="Confirm your password" />
              {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>}
            </div>
            <button type="submit" disabled={isSubmitting} className="flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">
              {isSubmitting ? <LoadingSpinner size="sm" /> : 'Reset password'}
            </button>
          </form>
        </>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <Suspense fallback={<LoadingSpinner />}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
