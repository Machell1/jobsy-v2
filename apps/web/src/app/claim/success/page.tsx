'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ClaimSuccessPage() {
  const [userName, setUserName] = useState('');
  const [servicesCreated, setServicesCreated] = useState(0);

  useEffect(() => {
    const data = localStorage.getItem('claimSuccess');
    if (data) {
      try {
        const parsed = JSON.parse(data);
        setUserName(parsed.userName || '');
        setServicesCreated(parsed.servicesCreated || 0);
      } catch {}
      localStorage.removeItem('claimSuccess');
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-full max-w-lg mx-auto px-4 py-10 text-center">
        <div className="rounded-2xl border border-[var(--border)] bg-white p-10 shadow-sm">
          {/* Success Icon */}
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
            <svg className="h-8 w-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-gray-900">
            Welcome to Jobsy{userName ? `, ${userName}` : ''}!
          </h1>
          <p className="mt-2 text-gray-600">
            Your profile is now live.
            {servicesCreated > 0 && (
              <> We've loaded <strong>{servicesCreated} service{servicesCreated !== 1 ? 's' : ''}</strong> onto your account.</>
            )}
          </p>

          {/* Action Cards */}
          <div className="mt-8 grid gap-3">
            <Link
              href="/dashboard/services"
              className="flex items-center gap-3 rounded-xl border border-[var(--border)] p-4 hover:bg-gray-50 transition-colors text-left"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100">
                <svg className="h-5 w-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">Edit Your Services</p>
                <p className="text-xs text-gray-500">Update descriptions, prices, and add photos</p>
              </div>
            </Link>

            <Link
              href="/dashboard/settings"
              className="flex items-center gap-3 rounded-xl border border-[var(--border)] p-4 hover:bg-gray-50 transition-colors text-left"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100">
                <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">Complete Your Profile</p>
                <p className="text-xs text-gray-500">Add a photo, bio, and contact details</p>
              </div>
            </Link>

            <Link
              href="/dashboard"
              className="flex items-center gap-3 rounded-xl border border-[var(--border)] p-4 hover:bg-gray-50 transition-colors text-left"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-100">
                <svg className="h-5 w-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">Go to Dashboard</p>
                <p className="text-xs text-gray-500">View bookings, messages, and analytics</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
