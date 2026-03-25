'use client';

export default function MessagesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
        <p className="mt-1 text-gray-600">Chat with service providers and customers</p>
      </div>

      <div className="flex flex-col items-center justify-center rounded-xl bg-white p-16 shadow-sm">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-100">
          <svg className="h-10 w-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        </div>
        <h2 className="mt-6 text-xl font-semibold text-gray-900">Messages coming soon</h2>
        <p className="mt-2 max-w-sm text-center text-gray-500">
          Real-time messaging with Stream Chat is being set up. You&apos;ll be able to chat
          directly with providers and customers about your bookings.
        </p>
      </div>
    </div>
  );
}
