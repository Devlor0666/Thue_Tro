import { useState } from 'react'
import { api } from '../services/api.js'

export default function AuthPage({ initialMode = 'login', onSuccess, navigate, notify }) {
  const [mode, setMode] = useState(initialMode)
  const [form, setForm] = useState({ hoTen: '', email: '', soDienThoai: '', matKhau: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const update = (event) => setForm((old) => ({ ...old, [event.target.name]: event.target.value }))

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (mode === 'register') {
        await api.post('/users/register', { hoTen: form.hoTen.trim(), email: form.email.trim(), soDienThoai: form.soDienThoai.trim(), matKhau: form.matKhau })
        notify('Tạo tài khoản thành công. Hãy đăng nhập để tiếp tục.', 'success')
        setMode('login')
        setForm((old) => ({ ...old, matKhau: '' }))
      } else {
        const data = await api.post('/users/login', { email: form.email.trim(), matKhau: form.matKhau })
        onSuccess(data)
      }
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  return (
    <main className="auth-page">
      <div className="auth-decoration"><div className="auth-circle circle-a" /><div className="auth-circle circle-b" /><div className="eyebrow light-eyebrow"><span /> TRỌ AN · Ở AN TÂM</div><div className="auth-decoration-copy"><span>Không chỉ là một căn phòng.</span><h2>Là nơi bắt đầu<br /><em>những điều tốt đẹp.</em></h2><p>Tìm chỗ ở phù hợp với nhịp sống, kế hoạch và ngân sách của bạn.</p></div><div className="auth-decoration-foot">TÌM KIẾM · KẾT NỐI · AN CƯ</div></div>
      <div className="auth-form-side"><button className="back-link" onClick={() => navigate('home')}>← Quay về trang chủ</button><div className="auth-form-wrap"><div className="eyebrow"><span /> TÀI KHOẢN TRỌ AN</div><h1>{mode === 'login' ? 'Chào mừng trở lại' : 'Tạo tài khoản mới'}</h1><p className="muted">{mode === 'login' ? 'Đăng nhập để tiếp tục hành trình tìm nơi ở.' : 'Một tài khoản để tìm phòng và quản lý tin đăng.'}</p>
        <div className="auth-mode-switch"><button className={mode === 'login' ? 'selected' : ''} onClick={() => { setMode('login'); setError('') }}>Đăng nhập</button><button className={mode === 'register' ? 'selected' : ''} onClick={() => { setMode('register'); setError('') }}>Tạo tài khoản</button></div>
        {error && <div className="inline-alert error-alert">{error}</div>}
        <form className="auth-form" onSubmit={submit}>
          {mode === 'register' && <label>Họ và tên<input name="hoTen" value={form.hoTen} onChange={update} minLength="2" maxLength="100" autoComplete="name" placeholder="Nguyễn Văn A" required /></label>}
          <label>Email<input name="email" type="email" value={form.email} onChange={update} autoComplete="email" placeholder="ban@email.com" required /></label>
          {mode === 'register' && <label>Số điện thoại<input name="soDienThoai" type="tel" value={form.soDienThoai} onChange={update} inputMode="numeric" pattern="[0-9]{10}" maxLength="10" placeholder="0123456789" required /></label>}
          <label>Mật khẩu<input name="matKhau" type="password" value={form.matKhau} onChange={update} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} minLength="8" maxLength="72" placeholder="Tối thiểu 8 ký tự" required /></label>
          <button type="submit" className="primary-button auth-submit" disabled={loading}>{loading ? 'Đang xử lý...' : mode === 'login' ? 'Đăng nhập →' : 'Tạo tài khoản →'}</button>
        </form>
        <p className="auth-terms">Bằng việc tiếp tục, bạn đồng ý sử dụng nền tảng theo các điều khoản và chính sách bảo mật.</p>
      </div></div>
    </main>
  )
}
