import { useCallback, useEffect, useState } from 'react'
import { api } from '../services/api.js'

const statusLabel = { cho_duyet: 'Chờ duyệt', da_dang: 'Đang hiển thị', da_an: 'Đã ẩn', tu_choi: 'Bị từ chối', cho_xu_ly: 'Chờ xử lý', da_xu_ly: 'Đã xử lý', hoat_dong: 'Hoạt động', khoa: 'Đã khóa' }
const money = (value) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(Number(value || 0))

export default function AdminPage({ user, notify }) {
  const [tab, setTab] = useState('listings')
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const load = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const path = { listings: '/listings', users: '/users', reports: '/reports' }[tab]
      const result = await api.get(path)
      setData(result.data || [])
    } catch (err) { setError(err.message); setData([]) }
    finally { setLoading(false) }
  }, [tab])
  useEffect(() => { void Promise.resolve().then(() => load()) }, [load])

  const updateListing = async (item, trangThai) => {
    try { await api.patch(`/listings/${item.id}/status`, { trangThai }); notify('Đã cập nhật tin đăng.', 'success'); await load() }
    catch (err) { notify(err.message, 'error') }
  }
  const updateUser = async (item, field, value) => {
    try { await api.patch(`/users/${item.id}/${field}`, { [field === 'role' ? 'vaiTro' : 'trangThai']: value }); notify('Đã cập nhật tài khoản.', 'success'); await load() }
    catch (err) { notify(err.message, 'error') }
  }
  const updateReport = async (item, trangThai) => {
    try { await api.patch(`/reports/${item.id}/status`, { trangThai }); notify('Đã cập nhật báo cáo.', 'success'); await load() }
    catch (err) { notify(err.message, 'error') }
  }
  const tabs = [{ key: 'listings', label: 'Duyệt tin đăng', icon: '▤' }, { key: 'users', label: 'Quản lý tài khoản', icon: '○' }, { key: 'reports', label: 'Báo cáo', icon: '!' }]
  const pendingCount = tab === 'listings' ? data.filter((item) => item.trangThai === 'cho_duyet').length : tab === 'reports' ? data.filter((item) => item.trangThai === 'cho_xu_ly').length : data.filter((item) => item.trangThai === 'khoa').length

  return <main className="admin-page"><div className="admin-heading"><div><div className="eyebrow"><span /> KHU VỰC QUẢN TRỊ</div><h1>Quản lý Trọ An</h1><p>Xin chào {user.hoTen}. Theo dõi nội dung và tài khoản của nền tảng.</p></div><span className="admin-stamp">ADMIN<br /><small>CONTROL CENTER</small></span></div>
    <div className="admin-summary-grid"><article><span>TIN ĐĂNG</span><b>{tab === 'listings' ? data.length : '—'}</b><small>Quản lý nội dung phòng</small></article><article><span>{tab === 'users' ? 'TÀI KHOẢN' : 'CẦN XỬ LÝ'}</span><b>{tab === 'users' ? data.length : pendingCount}</b><small>{tab === 'users' ? 'Tất cả tài khoản' : 'Mục chờ kiểm tra'}</small></article><article><span>VAI TRÒ</span><b>03</b><small>Khách thuê · Chủ trọ · Admin</small></article></div>
    <div className="admin-workspace"><aside className="admin-tabs">{tabs.map((item) => <button key={item.key} className={tab === item.key ? 'selected' : ''} onClick={() => setTab(item.key)}><span>{item.icon}</span>{item.label}<b>›</b></button>)}<div className="admin-sidebar-note"><b>Ghi chú quản trị</b><p>Chỉ duyệt tin có thông tin và địa chỉ rõ ràng. Tạm khóa tài khoản khi phát hiện dấu hiệu lạm dụng.</p></div></aside>
      <section className="admin-data"><div className="admin-data-heading"><div><h2>{tabs.find((item) => item.key === tab)?.label}</h2><p>{tab === 'listings' ? 'Kiểm tra thông tin trước khi tin hiển thị công khai.' : tab === 'users' ? 'Quản lý quyền và trạng thái tài khoản.' : 'Theo dõi phản ánh từ người dùng.'}</p></div><button className="small-outline" onClick={load}>↻ Làm mới</button></div>
        {error && <div className="inline-alert error-alert">{error}</div>}{loading ? <div className="loading-state"><span className="spinner" /> Đang tải...</div> : !data.length ? <div className="empty-state compact-empty"><div className="empty-illustration">✓</div><h3>Không có dữ liệu cần xử lý</h3><p>Các mục cần quản lý sẽ xuất hiện tại đây.</p></div> : <div className="admin-table-wrap">
          {tab === 'listings' && <table className="admin-table"><thead><tr><th>TIN ĐĂNG</th><th>CHỦ TRỌ</th><th>GIÁ / THÔNG TIN</th><th>TRẠNG THÁI</th><th>THAO TÁC</th></tr></thead><tbody>{data.map((item) => <tr key={item.id}><td><b>{item.tieuDe}</b><small>{item.diaChi}, {item.diaChiXa}, {item.diaChiTinh}</small><small>Mã tin #{item.id}</small></td><td>{item.tenChuTro}<small>{item.email}</small></td><td><b>{money(item.giaThue)} / tháng</b><small>{item.dienTich} m²</small></td><td><span className={`status-pill status-${item.trangThai}`}>{statusLabel[item.trangThai] || item.trangThai}</span></td><td><div className="table-actions">{item.trangThai !== 'da_dang' && <button className="small-success" onClick={() => updateListing(item, 'da_dang')}>Duyệt</button>}{item.trangThai !== 'tu_choi' && <button className="small-danger" onClick={() => updateListing(item, 'tu_choi')}>Từ chối</button>}{item.trangThai === 'da_dang' && <button className="small-outline" onClick={() => updateListing(item, 'da_an')}>Ẩn tin</button>}</div></td></tr>)}</tbody></table>}
          {tab === 'users' && <table className="admin-table"><thead><tr><th>NGƯỜI DÙNG</th><th>VAI TRÒ</th><th>TRẠNG THÁI</th><th>THAO TÁC</th></tr></thead><tbody>{data.map((item) => <tr key={item.id}><td><b>{item.hoTen} {Number(item.id) === Number(user.id) && <small>(Bạn)</small>}</b><small>{item.email}</small><small>{item.soDienThoai}</small></td><td><span className="status-pill">{item.vaiTro === 'admin' ? 'Quản trị viên' : 'Người dùng'}</span></td><td><span className={`status-pill status-${item.trangThai}`}>{statusLabel[item.trangThai] || item.trangThai}</span></td><td><div className="table-actions">{Number(item.id) !== Number(user.id) && <><button className="small-outline" onClick={() => updateUser(item, 'role', item.vaiTro === 'admin' ? 'user' : 'admin')}>{item.vaiTro === 'admin' ? 'Hạ quyền' : 'Cấp admin'}</button><button className={item.trangThai === 'khoa' ? 'small-success' : 'small-danger'} onClick={() => updateUser(item, 'status', item.trangThai === 'khoa' ? 'hoat_dong' : 'khoa')}>{item.trangThai === 'khoa' ? 'Mở khóa' : 'Khóa'}</button></>}</div></td></tr>)}</tbody></table>}
          {tab === 'reports' && <table className="admin-table"><thead><tr><th>BÁO CÁO</th><th>NGƯỜI GỬI</th><th>TRẠNG THÁI</th><th>THAO TÁC</th></tr></thead><tbody>{data.map((item) => <tr key={item.id}><td><b>{item.tieuDe}</b><small>{item.lyDo}</small><small>Mã báo cáo #{item.id}</small></td><td>{item.tenNguoiBaoCao}<small>{item.email}</small></td><td><span className={`status-pill status-${item.trangThai}`}>{statusLabel[item.trangThai] || item.trangThai}</span></td><td><div className="table-actions">{item.trangThai !== 'da_xu_ly' && <button className="small-success" onClick={() => updateReport(item, 'da_xu_ly')}>Đã xử lý</button>}{item.trangThai !== 'tu_choi' && <button className="small-danger" onClick={() => updateReport(item, 'tu_choi')}>Từ chối</button>}</div></td></tr>)}</tbody></table>}
        </div>}
      </section>
    </div>
  </main>
}
