import { getSupabaseBrowser } from '@/lib/supabaseBrowser';

/**
 * API client helper that automatically attaches Supabase session token to requests.
 * Uses the browser-safe client (NEXT_PUBLIC_ env vars only).
 */
export async function apiRequest(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const headers = new Headers(options.headers || {});

  const supabase = getSupabaseBrowser();
  if (supabase) {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      headers.set('Authorization', `Bearer ${session.access_token}`);
    }
  }

  // Set Content-Type for JSON if body is provided, not FormData, and not already set
  if (options.body && !(options.body instanceof FormData) && !headers.get('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`/api/${endpoint}`, {
    ...options,
    headers,
  });

  return response;
}

/**
 * Convenience methods for common HTTP verbs
 */
export const api = {
  get: (endpoint: string, options?: RequestInit) =>
    apiRequest(endpoint, { ...options, method: 'GET' }),

  post: (endpoint: string, body?: any, options?: RequestInit) => {
    // Don't stringify FormData
    const processedBody = body instanceof FormData ? body : body ? JSON.stringify(body) : undefined;
    return apiRequest(endpoint, {
      ...options,
      method: 'POST',
      body: processedBody,
    });
  },

  delete: (endpoint: string, options?: RequestInit) =>
    apiRequest(endpoint, { ...options, method: 'DELETE' }),

  put: (endpoint: string, body?: any, options?: RequestInit) => {
    // Don't stringify FormData
    const processedBody = body instanceof FormData ? body : body ? JSON.stringify(body) : undefined;
    return apiRequest(endpoint, {
      ...options,
      method: 'PUT',
      body: processedBody,
    });
  },
};

