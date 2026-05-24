const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000/api';
const TOKEN_KEY = 'doti_token';

export function setToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

async function apiFetch(path: string, opts: RequestInit = {}) {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(opts.headers as Record<string, string> || {}),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    ...opts,
    headers,
    credentials: 'omit',
  });

  const text = await res.text();
  let body: any = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch (e) {
    body = text;
  }

  if (!res.ok) {
    const message = body?.message || res.statusText;
    throw new Error(message);
  }

  return body;
}

export async function loginApi(email: string, password: string) {
  return apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function signupApi(payload: any) {
  return apiFetch('/auth/signup', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function meApi() {
  return apiFetch('/auth/me');
}

export async function updateProfileApi(payload: any) {
  return apiFetch('/auth/profile', { method: 'PUT', body: JSON.stringify(payload) });
}

export async function getUsersApi() {
  return apiFetch('/users');
}

export async function getAuthLogsApi() {
  return apiFetch('/auth-logs');
}

export async function createUserApi(payload: any) {
  return apiFetch('/users', { method: 'POST', body: JSON.stringify(payload) });
}

export async function updateUserApi(id: string, payload: any) {
  return apiFetch(`/users/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
}

export async function deleteUserApi(id: string) {
  return apiFetch(`/users/${id}`, { method: 'DELETE' });
}
