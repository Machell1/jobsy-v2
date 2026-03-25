'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface AdminReview {
  id: string;
  reviewerName: string;
  subjectName: string;
  serviceName: string;
  rating: number;
  comment: string;
  isReported: boolean;
  reportReason?: string;
  isVisible: boolean;
  createdAt: string;
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showReportedOnly, setShowReportedOnly] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchReviews();
  }, [showReportedOnly]);

  async function fetchReviews() {
    setLoading(true);
    const query = showReportedOnly ? '?reported=true' : '';
    const res = await apiClient<AdminReview[]>(`/api/admin/reviews${query}`);
    if (res.success) {
      setReviews(res.data);
    } else {
      setError(res.error.message);
    }
    setLoading(false);
  }

  const handleToggleVisibility = async (id: string, isVisible: boolean) => {
    setActionLoading(id);
    const res = await apiClient(`/api/admin/reviews/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ isVisible: !isVisible }),
    });
    if (res.success) {
      setReviews((prev) =>
        prev.map((r) => (r.id === id ? { ...r, isVisible: !isVisible } : r))
      );
    }
    setActionLoading(null);
  };

  const handleDismissReport = async (id: string) => {
    setActionLoading(id);
    const res = await apiClient(`/api/admin/reviews/${id}/dismiss-report`, {
      method: 'POST',
    });
    if (res.success) {
      setReviews((prev) =>
        prev.map((r) => (r.id === id ? { ...r, isReported: false, reportReason: undefined } : r))
      );
    }
    setActionLoading(null);
  };

  const renderStars = (rating: number) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`h-4 w-4 ${star <= rating ? 'text-yellow-400' : 'text-gray-200'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Review Management</h1>
          <p className="mt-1 text-gray-600">Manage reported and flagged reviews</p>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={showReportedOnly}
            onChange={(e) => setShowReportedOnly(e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-gray-700">Reported only</span>
        </label>
      </div>

      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : error ? (
        <div className="rounded-lg bg-red-50 p-6 text-center text-red-700">{error}</div>
      ) : reviews.length === 0 ? (
        <div className="rounded-xl bg-white p-12 text-center shadow-sm">
          <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="mt-4 text-gray-500">
            {showReportedOnly ? 'No reported reviews' : 'No reviews found'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className={`rounded-xl bg-white p-6 shadow-sm ${
                review.isReported ? 'border-l-4 border-red-400' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <p className="font-medium text-gray-900">{review.reviewerName}</p>
                    <span className="text-gray-400">reviewed</span>
                    <p className="font-medium text-gray-900">{review.subjectName}</p>
                  </div>
                  <p className="mt-0.5 text-sm text-gray-500">{review.serviceName}</p>
                  <div className="mt-1">{renderStars(review.rating)}</div>
                </div>
                <div className="flex items-center gap-2">
                  {!review.isVisible && (
                    <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                      Hidden
                    </span>
                  )}
                  <span className="text-xs text-gray-400">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <p className="mt-3 text-sm text-gray-700">{review.comment}</p>

              {review.isReported && review.reportReason && (
                <div className="mt-3 rounded-lg bg-red-50 p-3">
                  <p className="text-xs font-medium text-red-800">Report reason:</p>
                  <p className="mt-1 text-sm text-red-700">{review.reportReason}</p>
                </div>
              )}

              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => handleToggleVisibility(review.id, review.isVisible)}
                  disabled={actionLoading === review.id}
                  className={`rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-50 ${
                    review.isVisible
                      ? 'border border-red-200 text-red-600 hover:bg-red-50'
                      : 'border border-green-200 text-green-600 hover:bg-green-50'
                  }`}
                >
                  {review.isVisible ? 'Hide Review' : 'Show Review'}
                </button>
                {review.isReported && (
                  <button
                    onClick={() => handleDismissReport(review.id)}
                    disabled={actionLoading === review.id}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Dismiss Report
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
