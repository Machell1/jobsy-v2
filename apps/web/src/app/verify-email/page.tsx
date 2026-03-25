'use client';

import { useRef, useState, type KeyboardEvent, type ClipboardEvent } from 'react';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { LoadingSpinner } from '@/components/LoadingSpinner';

export default function VerifyEmailPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [code, setCode] = useState<string[]>(Array(6).fill(''));
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);

    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }

    // Auto-submit when all digits entered
    if (newCode.every((d) => d !== '') && newCode.join('').length === 6) {
      submitCode(newCode.join(''));
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      const digits = pasted.split('');
      setCode(digits);
      inputsRef.current[5]?.focus();
      submitCode(pasted);
    }
  };

  const submitCode = async (verificationCode: string) => {
    if (!user) {
      setServerError('Please log in first.');
      return;
    }
    setIsSubmitting(true);
    setServerError('');
    const res = await apiClient('/api/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ userId: user.id, code: verificationCode }),
    });
    setIsSubmitting(false);
    if (res.success) {
      router.push('/dashboard');
    } else {
      setServerError(res.error.message);
      setCode(Array(6).fill(''));
      inputsRef.current[0]?.focus();
    }
  };

  const handleResend = async () => {
    setResendSuccess(false);
    setServerError('');
    const res = await apiClient('/api/auth/resend-verification', {
      method: 'POST',
    });
    if (res.success) {
      setResendSuccess(true);
    } else {
      setServerError(res.error.message);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-8 shadow-lg">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
            <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="mt-4 text-3xl font-bold text-gray-900">Verify your email</h1>
          <p className="mt-2 text-gray-600">
            Enter the 6-digit code sent to your email address
          </p>
        </div>

        {serverError && (
          <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">
            {serverError}
          </div>
        )}

        {resendSuccess && (
          <div className="rounded-md bg-green-50 p-4 text-sm text-green-700">
            Verification code resent! Check your email.
          </div>
        )}

        <div className="flex justify-center gap-3">
          {code.map((digit, index) => (
            <input
              key={index}
              ref={(el) => { inputsRef.current[index] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={index === 0 ? handlePaste : undefined}
              className="h-14 w-12 rounded-lg border border-gray-300 text-center text-2xl font-bold text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          ))}
        </div>

        {isSubmitting && (
          <div className="flex justify-center">
            <LoadingSpinner size="md" />
          </div>
        )}

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Didn&apos;t receive a code?{' '}
            <button
              type="button"
              onClick={handleResend}
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Resend
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
