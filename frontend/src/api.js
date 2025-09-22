// Simple API helper for the frontend app
const API_BASE = import.meta.env.VITE_API_BASE || 'https://movies-hub-backend.onrender.com'

export const getToken = () => localStorage.getItem('token')
export const setToken = (t) => localStorage.setItem('token', t)
export const clearToken = () => localStorage.removeItem('token')

async function request(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  const token = getToken()
  if (auth && token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!res.ok) {
    const errText = await res.text().catch(() => '')
    throw new Error(errText || `Request failed with status ${res.status}`)
  }
  const text = await res.text()
  return text ? JSON.parse(text) : null
}

export const api = {
  // Auth
  register: (name, email, password) => request('/api/register', { method: 'POST', body: { name, email, password }, auth: false }),
  login: (email, password) => request('/api/login', { method: 'POST', body: { email, password }, auth: false }),
  me: () => request('/api/me', { method: 'GET' }),
  // Movies
  listMovies: ({ q = '', page = 1, limit = 20 } = {}) => {
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    if (page) params.set('page', String(page))
    if (limit) params.set('limit', String(limit))
    const qs = params.toString()
    return request(`/api/movies${qs ? `?${qs}` : ''}`)
  },
  getMovie: (id) => request(`/api/movies/${id}`, { method: 'GET', auth: false }),
  addMovie: (title, description) => request('/api/movies', { method: 'POST', body: { title, description } }),
  vote: (movieId, voteType) => request(`/api/movies/${movieId}/vote`, { method: 'POST', body: { voteType } }),
  // Comments
  listComments: (movieId) => request(`/api/movies/${movieId}/comments`, { method: 'GET', auth: false }),
  addComment: (movieId, body) => request(`/api/movies/${movieId}/comments`, { method: 'POST', body: { body } }),
  updateComment: (id, body) => request(`/api/comments/${id}`, { method: 'PUT', body: { body } }),
  deleteComment: (id) => request(`/api/comments/${id}`, { method: 'DELETE' }),
}

export default api
