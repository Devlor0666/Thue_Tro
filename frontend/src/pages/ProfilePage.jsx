import { useState } from 'react'
import { api } from '../services/api.js'

export default function ProfilePage({ user, onUpdated, notify }) {
  const [form, setForm] = useState({ hoTen: user.hoTen || '', email: user.email || '', soDienThoai: user.soDienThoai || '' })
  const [password, setPassword] = useState({ matKhauCu: '', matKhau: '' })
  const [loading, setLoading] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [error, setError] = useState('')
  const update = (event) => setForm((old) => ({ ...old, [event.target.name]: event.target.value }))
  const updatePasswordField = (event) => setPassword((old) => ({ ...old, [event.target.name]: event.target.value }))
  const submitProfile = async (event) => {
    event.preventDefault(); setError(''); setLoading(true)
    try { const data = await api.patch('/users/profile', form); onUpdated(data.user); notify('Đã cập nhật hồ sơ.', 'success') }
    catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }
  const submitPassword = async (event) => {
    event.preventDefault(); setError(''); setPasswordLoading(true)
    try { await api.patch('/users/update-password', password); setPassword({ matKhauCu: '', matKhau: '' }); notify('Đã đổi mật khẩu. Hệ thống có thể yêu cầu bạn đăng nhập lại.', 'success') }
    catch (err) { setError(err.message) }
    finally { setPasswordLoading(false) }
  }
  return <section className="profile-page"><div className="page-title-block"><div className="eyebrow"><span /> TÀI KHOẢN</div><h1>Thông tin cá nhân</h1><p>Quản lý thông tin liên hệ và bảo mật tài khoản của bạn.</p></div>{error && <div className="inline-alert error-alert">{error}</div>}
    <div className="profile-grid"><form className="panel-card profile-form" onSubmit={submitProfile}><div className="panel-heading"><div><h2>Hồ sơ của bạn</h2><p>Thông tin dùng để liên hệ trong quá trình thuê phòng.</p></div><span className="avatar big-avatar">{form.hoTen?.charAt(0)?.toUpperCase() || 'U'}</span></div><label>Họ và tên<input name="hoTen" value={form.hoTen} onChange={update} minLength="2" maxLength="100" required /></label><label>Email<input type="email" name="email" value={form.email} onChange={update} required /></label><label>Số điện thoại<input name="soDienThoai" value={form.soDienThoai} onChange={update} pattern="[0-9]{10}" maxLength="10" required /></label><div className="profile-account-type"><span>VAI TRÒ</span><b>{user.vaiTro === 'admin' ? 'Quản trị viên' : 'Tài khoản người dùng'}</b></div><button className="primary-button" disabled={loading}>{loading ? 'Đang lưu...' : 'Lưu thay đổi'}</button></form>
      <form className="panel-card profile-form" onSubmit={submitPassword}><div className="panel-heading"><div><h2>Đổi mật khẩu</h2><p>Dùng mật khẩu dài và không chia sẻ với người khác.</p></div><span className="security-symbol">⌑</span></div><label>Mật khẩu hiện tại<input type="password" name="matKhauCu" value={password.matKhauCu} onChange={updatePasswordField} minLength="8" required autoComplete="current-password" /></label><label>Mật khẩu mới<input type="password" name="matKhau" value={password.matKhau} onChange={updatePasswordField} minLength="8" maxLength="72" required autoComplete="new-password" /></label><div className="form-note"><span>i</span><p>Sau khi đổi mật khẩu, phiên refresh hiện tại sẽ bị thu hồi để bảo vệ tài khoản.</p></div><button className="secondary-button" disabled={passwordLoading}>{passwordLoading ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}</button></form></div>
  </section>
}
