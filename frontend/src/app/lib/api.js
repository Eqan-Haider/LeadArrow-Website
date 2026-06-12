const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

export const API_BASE = `${BASE}/api`;

export function apiUrl(path) {
  return `${API_BASE}${path.startsWith('/') ? path : '/' + path}`;
}

export async function apiFetch(path, options = {}) {
  const res = await fetch(apiUrl(path), {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  return res;
}
