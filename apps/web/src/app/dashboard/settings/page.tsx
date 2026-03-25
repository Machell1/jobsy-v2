'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { UpdateProfileSchema, type UpdateProfileInput, JAMAICA_PARISHES } from '@jobsy/shared';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api';
import { LoadingSpinner } from '@/components/LoadingSpinner';

const ChangePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type ChangePasswordData = z.infer<typeof ChangePasswordSchema>;

export default function SettingsPage() {
  const { user } = useAuth();
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [profileLoading, setProfileLoading] = useState(true);

  const {
    register: profileRegister,
    handleSubmit: handleProfileSubmit,
    reset: resetProfile,
    formState: { errors: profileErrors, isSubmitting: profileSubmitting },
  } = useForm<UpdateProfileInput>({
    resolver: zodResolver(UpdateProfileSchema),
  });

  const {
    register: passwordRegister,
    handleSubmit: handlePasswordSubmit,
    reset: resetPassword,
    formState: { errors: passwordErrors, isSubmitting: passwordSubmitting },
  } = useForm<ChangePasswordData>({
    resolver: zodResolver(ChangePasswordSchema),
  });

  useEffect(() => {
    async function fetchProfile() {
      const res = await apiClient<UpdateProfileInput>('/api/users/profile');
      if (res.success) {
        resetProfile(res.data);
      }
      setProfileLoading(false);
    }
    fetchProfile();
  }, [resetProfile]);

  const onProfileSubmit = async (data: UpdateProfileInput) => {
    setProfileError('');
    setProfileSuccess(false);
    const res = await apiClient('/api/users/profile', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    if (res.success) {
      setProfileSuccess(true);
    } else {
      setProfileError(res.error.message);
    }
  };

  const onPasswordSubmit = async (data: ChangePasswordData) => {
    setPasswordError('');
    setPasswordSuccess(false);
    const res = await apiClient('/api/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      }),
    });
    if (res.success) {
      setPasswordSuccess(true);
      resetPassword();
    } else {
      setPasswordError(res.error.message);
    }
  };

  if (profileLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-gray-600">Manage your account settings and preferences</p>
      </div>

      {/* Profile Form */}
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Profile</h2>

        {profileSuccess && (
          <div className="mt-4 rounded-md bg-green-50 p-3 text-sm text-green-700">
            Profile updated successfully.
          </div>
        )}
        {profileError && (
          <div className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
            {profileError}
          </div>
        )}

        <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="mt-6 space-y-5">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              {...profileRegister('name')}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {profileErrors.name && (
              <p className="mt-1 text-sm text-red-600">{profileErrors.name.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              Phone
            </label>
            <input
              id="phone"
              type="tel"
              {...profileRegister('phone')}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
              Bio
            </label>
            <textarea
              id="bio"
              rows={3}
              {...profileRegister('bio')}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Tell us a bit about yourself..."
            />
          </div>

          <div>
            <label htmlFor="parish" className="block text-sm font-medium text-gray-700">
              Parish
            </label>
            <select
              id="parish"
              {...profileRegister('parish')}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Select a parish</option>
              {JAMAICA_PARISHES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700">
              Address
            </label>
            <input
              id="address"
              type="text"
              {...profileRegister('address')}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={profileSubmitting}
              className="flex items-center justify-center rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {profileSubmitting ? <LoadingSpinner size="sm" /> : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>

      {/* Password Change */}
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Change Password</h2>

        {passwordSuccess && (
          <div className="mt-4 rounded-md bg-green-50 p-3 text-sm text-green-700">
            Password changed successfully.
          </div>
        )}
        {passwordError && (
          <div className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
            {passwordError}
          </div>
        )}

        <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="mt-6 space-y-5">
          <div>
            <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
              Current Password
            </label>
            <input
              id="currentPassword"
              type="password"
              {...passwordRegister('currentPassword')}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {passwordErrors.currentPassword && (
              <p className="mt-1 text-sm text-red-600">{passwordErrors.currentPassword.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
              New Password
            </label>
            <input
              id="newPassword"
              type="password"
              {...passwordRegister('newPassword')}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {passwordErrors.newPassword && (
              <p className="mt-1 text-sm text-red-600">{passwordErrors.newPassword.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-gray-700">
              Confirm New Password
            </label>
            <input
              id="confirmNewPassword"
              type="password"
              {...passwordRegister('confirmPassword')}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {passwordErrors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">{passwordErrors.confirmPassword.message}</p>
            )}
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={passwordSubmitting}
              className="flex items-center justify-center rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {passwordSubmitting ? <LoadingSpinner size="sm" /> : 'Change Password'}
            </button>
          </div>
        </form>
      </div>

      {/* Notification Preferences */}
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Notification Preferences</h2>
        <div className="mt-6 space-y-4">
          {[
            { id: 'email_bookings', label: 'Booking updates', desc: 'Get notified about booking status changes' },
            { id: 'email_messages', label: 'New messages', desc: 'Receive email when you get a new message' },
            { id: 'email_reviews', label: 'New reviews', desc: 'Get notified when someone leaves a review' },
            { id: 'email_marketing', label: 'Marketing emails', desc: 'Tips, promotions, and product updates' },
          ].map((pref) => (
            <div key={pref.id} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">{pref.label}</p>
                <p className="text-sm text-gray-500">{pref.desc}</p>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input type="checkbox" defaultChecked className="peer sr-only" />
                <div className="h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:ring-2 peer-focus:ring-blue-300" />
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
