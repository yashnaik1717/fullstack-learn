const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

let accessTokenMemory: string | null = null;
let refreshPromise: Promise<string | null> | null = null;

export const setAccessToken = (token: string | null) => {
  accessTokenMemory = token;
};

export const getAccessToken = () => {
  return accessTokenMemory;
};

async function executeRefresh(): Promise<string | null> {
  try {
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Important to send HttpOnly refreshToken cookie
    });

    if (!response.ok) {
      throw new Error('Refresh token invalid');
    }

    const data = await response.json();
    setAccessToken(data.accessToken);
    return data.accessToken;
  } catch (error) {
    setAccessToken(null);
    return null;
  } finally {
    refreshPromise = null;
  }
}

async function request(path: string, options: RequestInit = {}): Promise<Response> {
  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const token = getAccessToken();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    credentials: 'include', // Always send credentials/cookies
  });

  // Handle Token Expiration and Refresh rotation
  if (response.status === 401 && path !== '/auth/login' && path !== '/auth/refresh') {
    if (!refreshPromise) {
      refreshPromise = executeRefresh();
    }
    const newToken = await refreshPromise;

    if (newToken) {
      // Retry request with new token
      const retryHeaders = new Headers(options.headers || {});
      retryHeaders.set('Content-Type', 'application/json');
      retryHeaders.set('Authorization', `Bearer ${newToken}`);

      return fetch(`${API_URL}${path}`, {
        ...options,
        headers: retryHeaders,
        credentials: 'include',
      });
    }
  }

  return response;
}

export const api = {
  get: (path: string, options?: RequestInit) => request(path, { ...options, method: 'GET' }),
  post: (path: string, body?: any, options?: RequestInit) =>
    request(path, { ...options, method: 'POST', body: body ? JSON.stringify(body) : undefined }),
  put: (path: string, body?: any, options?: RequestInit) =>
    request(path, { ...options, method: 'PUT', body: body ? JSON.stringify(body) : undefined }),
  delete: (path: string, options?: RequestInit) => request(path, { ...options, method: 'DELETE' }),
};
