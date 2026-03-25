const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

interface ApiErrorResponse {
  success: false;
  error: { code: string; message: string; details?: any };
}

type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

interface PaginatedData<T> {
  success: true;
  data: T[];
  pagination: { page: number; limit: number; total: number; pages: number };
}

let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

export async function apiClient<T>(
  path: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers,
  });

  if (res.status === 401 && accessToken) {
    // Try refresh
    const refreshRes = await fetch(`${API_URL}/api/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    });
    if (refreshRes.ok) {
      const refreshData = await refreshRes.json();
      if (refreshData.success) {
        accessToken = refreshData.data.accessToken;
        headers['Authorization'] = `Bearer ${accessToken}`;
        const retryRes = await fetch(`${API_URL}${path}`, {
          ...options,
          credentials: 'include',
          headers,
        });
        return retryRes.json();
      }
    }
    accessToken = null;
  }

  return res.json();
}

export async function apiPaginated<T>(
  path: string,
  options: RequestInit = {}
): Promise<PaginatedData<T> | ApiErrorResponse> {
  return apiClient(path, options) as any;
}

// Server-side fetch helper (no auth, for SSR pages)
export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T | null> {
  try {
    const res = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
      },
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    if (json.success) return json.data;
    return null;
  } catch {
    return null;
  }
}

export type { ApiResponse, ApiSuccessResponse, ApiErrorResponse, PaginatedData };
