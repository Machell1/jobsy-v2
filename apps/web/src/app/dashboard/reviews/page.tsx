'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface ReviewItem {
  id: string;
  rating: number;
  comment: string;
  reviewerName: string;
  serviceName?: string;
  createdAt: string;
}

export default function ReviewsPage() {
  const [activeTab, setActiveTab] = useState<'received' | 'given'>('received');
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchReviews() {
      setLoading(true);
      setError('');
      const res = await apiClient<ReviewItem[]>(
        `/api/reviews?type=${activeTab}`
      );
      if (res.success) {
        setReviews(res.data);
      } else {
        setError(res.error.message);
      }
      setLoading(false);
    }
    fetchReviews();
  }, [activeTab]);

  const renderStars = (rating: number) => {
    return (
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
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reviews</h1>
        <p className="mt-1 text-gray-600">See feedback from your transactions</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg bg-gray-100 p-1">
        <button
          onClick={() => setActiveTab('received')}
          className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
            activeTab === 'received'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Received
        </button>
        <button
          onClick={() => setActiveTab('given')}
          className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
            activeTab === 'given'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Given
        </button>
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
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
          <p className="mt-4 text-gray-500">No reviews yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="rounded-xl bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-gray-900">{review.reviewerName}</p>
                  {review.serviceName && (
                    <p className="text-sm text-gray-500">{review.serviceName}</p>
                  )}
                </div>
                <div className="text-right">
                  {renderStars(review.rating)}
                  <p className="mt-1 text-xs text-gray-400">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <p className="mt-3 text-sm text-gray-700">{review.comment}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
