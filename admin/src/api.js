// Simple API helper for the admin app
const API_BASE = import.meta.env.VITE_API_BASE || 'https://movies-hub-backend.onrender.com';

export const getToken = () => localStorage.getItem('token');
export const setToken = (t) => localStorage.setItem('token', t);
export const clearToken = () => localStorage.removeItem('token');

async function request(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth && getToken()) {
    headers['Authorization'] = `Bearer ${getToken()}`;
  }
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(errText || `Request failed with status ${res.status}`);
  }
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

export const api = {
  login: (email, password) => request('/api/login', { method: 'POST', body: { email, password }, auth: false }),
  me: () => request('/api/me', { method: 'GET' }),
  // Movies
  listMovies: async () => {
    const res = await request('/api/movies', { method: 'GET' })
    // backend may return array (old) or {items,...} (new with pagination)
    return Array.isArray(res) ? res : res.items
  },
  getMovie: (id) => request(`/api/movies/${id}`, { method: 'GET' }),
  deleteMovie: (id) => request(`/api/movies/${id}`, { method: 'DELETE' }),
  // Users
  listUsers: () => request('/api/admin/users', { method: 'GET' }),
  // Comments
  listComments: ({ q = '', page = 1, limit = 20 } = {}) => {
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    if (page) params.set('page', String(page))
    if (limit) params.set('limit', String(limit))
    const qs = params.toString()
    return request(`/api/admin/comments${qs ? `?${qs}` : ''}`, { method: 'GET' })
  },
  listCommentsForMovie: (movieId) => request(`/api/movies/${movieId}/comments`, { method: 'GET' }),
  updateComment: (id, body) => request(`/api/comments/${id}`, { method: 'PUT', body: { body } }),
  deleteComment: (id) => request(`/api/comments/${id}`, { method: 'DELETE' }),
};

export default api;
