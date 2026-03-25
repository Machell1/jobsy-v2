'use client';

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { apiClient, type ApiResponse } from '@/lib/api';

export function useApi<T>(
  queryKey: string[],
  path: string,
  options?: Omit<UseQueryOptions<ApiResponse<T>>, 'queryKey' | 'queryFn'>
) {
  return useQuery<ApiResponse<T>>({
    queryKey,
    queryFn: () => apiClient<T>(path),
    ...options,
  });
}
