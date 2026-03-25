'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './query-client';
import { AuthProvider } from './auth-context';
import type { ReactNode } from 'react';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  );
}
