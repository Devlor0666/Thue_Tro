import { useCallback, useEffect, useState } from 'react'
import Header from './components/Header.jsx'
import HomePage from './pages/HomePage.jsx'
import AuthPage from './pages/AuthPage.jsx'
import AddRoomPage from './pages/AddRoomPage.jsx'
import RoomDetailPage from './pages/RoomDetailPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import AdminPage from './pages/AdminPage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'
import { getPathForPage, resolveRoute } from './routes/routeConfig.js'
import { api, clearSession, getAccessToken, readStoredUser, saveSession } from './services/api.js'
import './App.css'

export default function App() {
  const [pathname, setPathname] = useState(() => window.location.pathname)
  const route = resolveRoute(pathname)
  const page = route.page
  const [user, setUser] = useState(() => readStoredUser())
  const [rooms, setRooms] = useState([])
  const [pagination, setPagination] = useState(null)
  const [loadingRooms, setLoadingRooms] = useState(true)
  const [roomsError, setRoomsError] = useState('')
  const [notice, setNotice] = useState(null)
  const [noticeKey, setNoticeKey] = useState(0)

  const notify = useCallback((message, type = 'success') => {
    setNotice({ message, type })
    setNoticeKey((value) => value + 1)
  }, [])

  useEffect(() => {
    if (!notice) return undefined
    const timer = window.setTimeout(() => setNotice(null), 5000)
    return () => window.clearTimeout(timer)
  }, [notice, noticeKey])

  useEffect(() => {
    const handlePopState = () => setPathname(window.location.pathname)
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const navigate = useCallback((nextPage, params = {}) => {
    const nextPath = getPathForPage(nextPage, params)
    if (!nextPath) {
      console.warn(`Không thể điều hướng đến trang "${nextPage}" vì thiếu tham số hợp lệ.`)
      return
    }

    if (window.location.pathname !== nextPath) {
      window.history.pushState({}, '', nextPath)
    }
    setPathname(nextPath)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const loadRooms = useCallback(async (filters = {}) => {
    setLoadingRooms(true)
    setRoomsError('')
    const params = new URLSearchParams()
    for (const [key, value] of Object.entries(filters)) {
      if (value !== '' && value !== null && value !== undefined) params.set(key, value)
    }
    try {
      const result = await api.get(`/rooms${params.toString() ? `?${params.toString()}` : ''}`)
      setRooms(result.data || [])
      setPagination(result.pagination || null)
    } catch (error) {
      setRoomsError(error.message)
      setRooms([])
      setPagination(null)
    } finally { setLoadingRooms(false) }
  }, [])

  useEffect(() => { void Promise.resolve().then(() => loadRooms()) }, [loadRooms])

  useEffect(() => {
    let active = true
    if (!getAccessToken()) return undefined
    api.get('/users/profile')
      .then((result) => {
        if (!active) return
        setUser(result.user)
        saveSession(getAccessToken(), result.user)
      })
      .catch(() => {
        if (!active) return
        clearSession()
        setUser(null)
      })
    return () => { active = false }
  }, [])

  const handleLoginSuccess = (data) => {
    saveSession(data.accessToken, data.user)
    setUser(data.user)
    notify(`Xin chào ${data.user?.hoTen || 'bạn'}!`, 'success')
    navigate(data.user?.vaiTro === 'admin' ? 'admin' : 'dashboard')
  }

  const handleLogout = async () => {
    try { await api.post('/users/logout', {}) } catch { /* Xóa phiên phía giao diện kể cả khi API không phản hồi. */ }
    clearSession()
    setUser(null)
    navigate('home')
    notify('Bạn đã đăng xuất.', 'success')
  }

  const editRoom = (roomId) => navigate('edit-room', { roomId })

  const selectRoom = (room) => navigate('room', { roomId: room.id })

  const updateUser = (updated) => {
    setUser(updated)
    saveSession(getAccessToken(), updated)
  }

  const showFooter = !['login', 'register'].includes(page)

  return <div className="app-shell">
    <Header user={user} page={page} navigate={navigate} onLogout={handleLogout} />
    {notice && <div className={`toast toast-${notice.type}`} role="status"><span>{notice.type === 'error' ? '!' : notice.type === 'warning' ? 'i' : '✓'}</span><p>{notice.message}</p><button onClick={() => setNotice(null)} aria-label="Đóng thông báo">×</button></div>}
    {page === 'home' && <HomePage rooms={rooms} pagination={pagination} loading={loadingRooms} error={roomsError} onSearch={loadRooms} onSelect={selectRoom} user={user} navigate={navigate} />}
    {(page === 'login' || page === 'register') && <AuthPage key={page} initialMode={page} onSuccess={handleLoginSuccess} navigate={navigate} notify={notify} />}
    {page === 'add-room' && (user ? <AddRoomPage navigate={navigate} notify={notify} /> : <AuthPage initialMode="login" onSuccess={handleLoginSuccess} navigate={navigate} notify={notify} />)}
    {page === 'edit-room' && (user ? <AddRoomPage key={route.roomId} roomId={route.roomId} navigate={navigate} notify={notify} /> : <AuthPage initialMode="login" onSuccess={handleLoginSuccess} navigate={navigate} notify={notify} />)}
    {page === 'room' && <RoomDetailPage key={route.roomId} initialRoom={{ id: route.roomId }} user={user} navigate={navigate} notify={notify} />}
    {page === 'dashboard' && user && user.vaiTro !== 'admin' && <DashboardPage user={user} navigate={navigate} notify={notify} onUserUpdated={updateUser} onSelectRoom={selectRoom} onEditRoom={editRoom} />}
    {page === 'dashboard' && user?.vaiTro === 'admin' && <main className="form-page"><div className="inline-alert warning-alert">Tài khoản quản trị viên sử dụng khu vực quản trị riêng.</div><button className="primary-button" onClick={() => navigate('admin')}>Mở trang quản trị</button></main>}
    {page === 'admin' && user?.vaiTro === 'admin' && <AdminPage user={user} notify={notify} />}
    {page === 'dashboard' && !user && <AuthPage initialMode="login" onSuccess={handleLoginSuccess} navigate={navigate} notify={notify} />}
    {page === 'admin' && user?.vaiTro !== 'admin' && <main className="form-page"><div className="inline-alert warning-alert">Bạn cần đăng nhập bằng tài khoản quản trị viên để mở khu vực này.</div><button className="primary-button" onClick={() => navigate(user ? 'dashboard' : 'login')}>Tiếp tục</button></main>}
    {page === 'not-found' && <NotFoundPage navigate={navigate} />}
    {showFooter && <footer className="site-footer"><div className="footer-inner"><button className="brand footer-brand" onClick={() => navigate('home')}><span className="brand-mark">T</span><span>trọ<span className="brand-accent">an</span><small>Ở tốt, sống an tâm</small></span></button><p>Tìm nơi ở phù hợp. Kết nối minh bạch. An cư an tâm.</p><span className="footer-copy">© {new Date().getFullYear()} Trọ An · Dự án quản lý phòng trọ</span></div></footer>}
  </div>
}
