'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.jobsyja.com';

interface ProviderProfile {
  id: string;
  businessName: string;
  contactName: string | null;
  category: string;
  parish: string;
  address: string | null;
  description: string | null;
  imageUrl: string | null;
  email: string | null;
  phone: string | null;
  sourceUrl: string | null;
  maskedEmail: string | null;
  maskedPhone: string | null;
  services: Array<{
    id: string;
    title: string;
    description: string | null;
    priceMin: number | null;
    priceMax: number | null;
    parish: string;
    tags: string[];
  }>;
}

export function ClaimProfileClient({ id }: { id: string }) {
  const router = useRouter();
  const [profile, setProfile] = useState<ProviderProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Claim form
  const [email, setEmail] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [code, setCode] = useState('');
  const [sendingCode, setSendingCode] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${API_URL}/api/claim/profile/${id}`);
        const json = await res.json();
        if (json.success) {
          setProfile(json.data);
        } else {
          setError(json.error?.message || 'Provider not found');
        }
      } catch {
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault();
    setFormError('');
    setSendingCode(true);
    try {
      const res = await fetch(`${API_URL}/api/claim/request-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ unclaimedProviderId: id, contactMethod: 'email', contactValue: email }),
      });
      const json = await res.json();
      if (json.success) {
        setCodeSent(true);
      } else {
        setFormError(json.error?.message || 'Failed to send code');
      }
    } catch {
      setFormError('Network error. Please try again.');
    } finally {
      setSendingCode(false);
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setFormError('');
    setVerifying(true);
    try {
      const res = await fetch(`${API_URL}/api/claim/verify-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ unclaimedProviderId: id, code }),
      });
      const json = await res.json();
      if (json.success) {
        // Store claim token and redirect to setup
        localStorage.setItem('claimToken', json.data.claimToken);
        localStorage.setItem('claimProviderId', id);
        router.push('/claim/verify');
      } else {
        setFormError(json.error?.message || 'Invalid code');
      }
    } catch {
      setFormError('Network error. Please try again.');
    } finally {
      setVerifying(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">{error || 'Provider not found'}</p>
          <Link href="/claim" className="text-[var(--primary)] font-semibold hover:underline">Back to search</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Back link */}
        <Link href="/claim" className="text-sm text-[var(--primary)] hover:underline mb-6 inline-block">&larr; Back to search</Link>

        {/* Profile Card */}
        <div className="rounded-2xl border border-[var(--border)] bg-white p-8 shadow-sm">
          <div className="flex items-start gap-4">
            {profile.imageUrl ? (
              <img src={profile.imageUrl} alt={profile.businessName} className="h-16 w-16 shrink-0 rounded-xl object-cover" />
            ) : (
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-2xl font-bold text-emerald-700">
                {profile.businessName.charAt(0)}
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{profile.businessName}</h1>
              <div className="mt-1 flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                  {profile.category}
                </span>
                <span className="text-sm text-gray-500">{profile.parish}</span>
              </div>
            </div>
          </div>

          {profile.description && (
            <p className="mt-5 text-sm text-gray-600 leading-relaxed">{profile.description}</p>
          )}

          {/* Contact Information */}
          <div className="mt-5 space-y-2 border-t border-gray-100 pt-4">
            {profile.contactName && (
              <div className="flex items-center gap-2 text-sm">
                <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                <span className="text-gray-700">{profile.contactName}</span>
              </div>
            )}
            {profile.phone && (
              <div className="flex items-center gap-2 text-sm">
                <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                <a href={`tel:${profile.phone}`} className="text-[var(--primary)] hover:underline">{profile.phone}</a>
              </div>
            )}
            {profile.email && (
              <div className="flex items-center gap-2 text-sm">
                <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                <a href={`mailto:${profile.email}`} className="text-[var(--primary)] hover:underline">{profile.email}</a>
              </div>
            )}
            {profile.address && (
              <div className="flex items-center gap-2 text-sm">
                <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                <span className="text-gray-700">{profile.address}</span>
              </div>
            )}
          </div>
        </div>

        {/* Services */}
        {profile.services.length > 0 && (
          <div className="mt-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3">Services</h2>
            <div className="space-y-3">
              {profile.services.map((svc) => (
                <div key={svc.id} className="rounded-xl border border-[var(--border)] bg-white p-5">
                  <h3 className="font-semibold text-gray-900">{svc.title}</h3>
                  {svc.description && (
                    <p className="mt-1 text-sm text-gray-500">{svc.description}</p>
                  )}
                  <div className="mt-2 flex items-center gap-3">
                    {(svc.priceMin || svc.priceMax) && (
                      <span className="text-sm font-semibold text-emerald-700">
                        J${svc.priceMin?.toLocaleString()}{svc.priceMax ? ` - J$${svc.priceMax.toLocaleString()}` : ''}
                      </span>
                    )}
                    <span className="text-xs text-gray-400">{svc.parish}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Claim Section */}
        <div className="mt-8 rounded-2xl border-2 border-emerald-200 bg-emerald-50 p-8">
          <h2 className="text-lg font-bold text-gray-900">Is this your business?</h2>
          <p className="mt-1 text-sm text-gray-600">
            Verify your identity to claim this profile and manage your services on Jobsy.
          </p>

          {profile.maskedEmail && (
            <p className="mt-3 text-sm text-gray-500">
              We have an email on file: <strong>{profile.maskedEmail}</strong>
            </p>
          )}

          {formError && (
            <div className="mt-3 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
              {formError}
            </div>
          )}

          {!codeSent ? (
            <form onSubmit={handleSendCode} className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Enter your email to receive a verification code
              </label>
              <div className="flex gap-3">
                <input
                  type="email"
                  required
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] outline-none"
                />
                <button
                  type="submit"
                  disabled={sendingCode}
                  className="shrink-0 rounded-lg bg-[var(--primary)] px-6 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {sendingCode ? 'Sending...' : 'Send Code'}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerify} className="mt-4">
              <p className="text-sm text-emerald-700 font-medium mb-3">
                Code sent! Check your email inbox.
              </p>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Enter 6-digit verification code
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  required
                  maxLength={6}
                  pattern="[0-9]{6}"
                  placeholder="123456"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-40 rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-center tracking-widest font-mono focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] outline-none"
                />
                <button
                  type="submit"
                  disabled={verifying || code.length !== 6}
                  className="shrink-0 rounded-lg bg-[var(--primary)] px-6 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {verifying ? 'Verifying...' : 'Verify & Claim'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
