const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000'
const NO_REFRESH_PATHS = ['/users/login', '/users/register', '/users/refresh-token', '/users/logout']

export function getAccessToken() {
  return localStorage.getItem('thueTroAccessToken') || ''
}

export function saveSession(accessToken, user) {
  if (accessToken) localStorage.setItem('thueTroAccessToken', accessToken)
  if (user) localStorage.setItem('thueTroUser', JSON.stringify(user))
}

export function readStoredUser() {
  try {
    return JSON.parse(localStorage.getItem('thueTroUser') || 'null')
  } catch {
    return null
  }
}

export function clearSession() {
  localStorage.removeItem('thueTroAccessToken')
  localStorage.removeItem('thueTroUser')
}

async function readResponse(response) {
  const text = await response.text()
  let data = {}
  if (text) {
    try { data = JSON.parse(text) } catch { data = { message: text } }
  }
  if (!response.ok) {
    const error = new Error(data.message || `Lỗi HTTP ${response.status}`)
    error.status = response.status
    throw error
  }
  return data
}

async function refreshAccessToken() {
  const response = await fetch(`${API_BASE}/users/refresh-token`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: '{}',
  })
  const data = await readResponse(response)
  saveSession(data.accessToken, data.user)
  return data.accessToken
}

export async function request(path, options = {}, allowRefresh = true) {
  const token = getAccessToken()
  const headers = new Headers(options.headers || {})
  if (options.body && !(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }
  if (token && !headers.has('Authorization')) headers.set('Authorization', `Bearer ${token}`)

  let response
  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
      credentials: 'include',
    })
  } catch {
    throw new Error('Không kết nối được API. Hãy kiểm tra backend tại http://localhost:3000.')
  }

  if (response.status === 401 && allowRefresh && token && !NO_REFRESH_PATHS.includes(path)) {
    try {
      await refreshAccessToken()
      return request(path, options, false)
    } catch {
      clearSession()
    }
  }
  return readResponse(response)
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body ?? {}) }),
  patch: (path, body) => request(path, { method: 'PATCH', body: JSON.stringify(body ?? {}) }),
  delete: (path) => request(path, { method: 'DELETE' }),
}

export { API_BASE }
