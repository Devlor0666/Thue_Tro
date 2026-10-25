/**
 * A small client-side route table for the app.
 * Keeps the current page components intact while giving each screen its own URL.
 */
export function resolveRoute(pathname) {
  const normalizedPath = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname

  const fixedRoutes = {
    '/': { page: 'home' },
    '/login': { page: 'login' },
    '/register': { page: 'register' },
    '/dashboard': { page: 'dashboard' },
    '/admin': { page: 'admin' },
    '/rooms/new': { page: 'add-room' },
  }

  if (fixedRoutes[normalizedPath]) return fixedRoutes[normalizedPath]

  const editRoomMatch = normalizedPath.match(/^\/rooms\/(\d+)\/edit$/)
  if (editRoomMatch) return { page: 'edit-room', roomId: editRoomMatch[1] }

  const roomMatch = normalizedPath.match(/^\/rooms\/(\d+)$/)
  if (roomMatch) return { page: 'room', roomId: roomMatch[1] }

  return { page: 'not-found' }
}

export function getPathForPage(page, params = {}) {
  const fixedPaths = {
    home: '/',
    login: '/login',
    register: '/register',
    dashboard: '/dashboard',
    admin: '/admin',
    'add-room': '/rooms/new',
  }

  if (fixedPaths[page]) return fixedPaths[page]

  const roomId = String(params.roomId ?? '')
  if (page === 'room' && /^\d+$/.test(roomId)) return `/rooms/${roomId}`
  if (page === 'edit-room' && /^\d+$/.test(roomId)) return `/rooms/${roomId}/edit`

  // Do not navigate to an invalid URL if a room ID was not supplied.
  return null
}
