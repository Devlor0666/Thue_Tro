export default function Header({ user, page, navigate, onLogout }) {
  return (
    <header className="site-header">
      <div className="header-inner">
        <button className="brand" onClick={() => navigate('home')} aria-label="Về trang chủ">
          <span className="brand-mark">T</span>
          <span>trọ<span className="brand-accent">an</span><small>Ở tốt, sống an tâm</small></span>
        </button>
        <nav className="main-nav" aria-label="Điều hướng chính">
          <button className={page === 'home' ? 'nav-link active' : 'nav-link'} onClick={() => navigate('home')}>Tìm phòng</button>
          {user && <button className={(user.vaiTro === 'admin' ? page === 'admin' : page === 'dashboard') ? 'nav-link active' : 'nav-link'} onClick={() => navigate(user.vaiTro === 'admin' ? 'admin' : 'dashboard')}>{user.vaiTro === 'admin' ? 'Quản trị' : 'Không gian của tôi'}</button>}
        </nav>
        <div className="header-actions">
          {user ? (
            <>
              <button className="header-post" onClick={() => navigate('add-room')}>+ Đăng phòng</button>
              <button className="user-chip" onClick={() => navigate(user.vaiTro === 'admin' ? 'admin' : 'dashboard')} title="Mở tài khoản">
                <span className="avatar">{user.hoTen?.trim()?.charAt(0)?.toUpperCase() || 'U'}</span>
                <span className="user-chip-name">{user.hoTen}</span>
              </button>
              <button className="text-button logout-button" onClick={onLogout}>Đăng xuất</button>
            </>
          ) : (
            <>
              <button className="text-button" onClick={() => navigate('login')}>Đăng nhập</button>
              <button className="primary-button header-register" onClick={() => navigate('register')}>Tạo tài khoản</button>
            </>
          )}
        </div>
        <button className="mobile-post" onClick={() => navigate(user ? 'add-room' : 'login')}>+</button>
      </div>
    </header>
  )
}
