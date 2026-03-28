'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.jobsyja.com';

export function ClaimCodeInput() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [step, setStep] = useState<'code' | 'password'>('code');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleClaim(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (step === 'code') {
      if (code.length < 6) {
        setError('Please enter your claim code');
        return;
      }
      setStep('password');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/claim/claim-with-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim(), password, name: name || undefined }),
      });
      const json = await res.json();
      if (json.success) {
        localStorage.setItem('claimSuccess', JSON.stringify({
          userName: json.data.user.name,
          servicesCreated: 0,
          accessToken: json.data.accessToken,
        }));
        router.push('/claim/success');
      } else {
        setError(json.error?.message || 'Invalid claim code');
        if (json.error?.message?.includes('Invalid')) setStep('code');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border-2 border-emerald-200 bg-emerald-50 p-6">
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-600">
          <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-gray-900">Have a claim code?</h3>
          <p className="mt-1 text-sm text-gray-600">
            If you received a claim code via email or message, enter it here to claim your profile instantly.
          </p>

          {error && (
            <div className="mt-3 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleClaim} className="mt-4">
            {step === 'code' ? (
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="Enter your claim code"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="flex-1 rounded-lg border border-gray-300 px-3 py-2.5 text-sm font-mono tracking-wider focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] outline-none"
                />
                <button
                  type="submit"
                  className="shrink-0 rounded-lg bg-[var(--primary)] px-6 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
                >
                  Continue
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-emerald-700 font-medium">Code: <span className="font-mono">{code}</span></p>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Display Name (optional)</label>
                  <input
                    type="text"
                    placeholder="Your name or business name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Set Your Password *</label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    placeholder="Minimum 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] outline-none"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep('code')}
                    className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 rounded-lg bg-[var(--primary)] py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {loading ? 'Claiming...' : 'Claim My Profile'}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
