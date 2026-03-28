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
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-xl font-bold text-emerald-700">
              {profile.businessName.charAt(0)}
            </div>
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

          {profile.contactName && (
            <p className="mt-3 text-sm text-gray-500">Contact: {profile.contactName}</p>
          )}
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
                        J${svc.priceMin?.toLocaleString()}{svc.priceMax ? ` — J$${svc.priceMax.toLocaleString()}` : ''}
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
