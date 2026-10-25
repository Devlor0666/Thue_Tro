import { useCallback, useEffect, useState } from 'react'
import { api } from '../services/api.js'
import ProfilePage from './ProfilePage.jsx'

const money = (value) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(Number(value || 0))
const statusLabel = { cho_duyet: 'Chờ duyệt', da_dang: 'Đang hiển thị', da_an: 'Đã ẩn', tu_choi: 'Bị từ chối', trong: 'Còn trống', da_thue: 'Đã thuê', bao_tri: 'Bảo trì', cho_hieu_luc: 'Chờ xác nhận', hieu_luc: 'Đang hiệu lực', het_han: 'Đã kết thúc', da_huy: 'Đã hủy', chua_thanh_toan: 'Chưa thanh toán', da_thanh_toan: 'Đã thanh toán', qua_han: 'Quá hạn', cho_xu_ly: 'Chờ xử lý', thanh_cong: 'Thành công', that_bai: 'Thất bại', hoan_tien: 'Đã hoàn tiền' }

export default function DashboardPage({ user, navigate, notify, onUserUpdated, onSelectRoom, onEditRoom }) {
  const [tab, setTab] = useState('rooms')
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [invoiceTarget, setInvoiceTarget] = useState(null)
  const [invoiceForm, setInvoiceForm] = useState({ thang: String(new Date().getMonth() + 1), nam: String(new Date().getFullYear()), tienDien: '0', tienNuoc: '0', khoanKhac: '0', hanThanhToan: '' })
  const [invoiceLoading, setInvoiceLoading] = useState(false)
  const [activeChat, setActiveChat] = useState(null)
  const [chatMessages, setChatMessages] = useState([])
  const [chatDraft, setChatDraft] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [chatSending, setChatSending] = useState(false)

  const load = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const path = { rooms: '/rooms/mine', favorites: '/favorites', messages: '/messages', contracts: '/contracts', invoices: '/invoices', transactions: '/transactions' }[tab]
      const result = await api.get(path)
      setData(result.data || [])
    } catch (err) { setError(err.message); setData([]) }
    finally { setLoading(false) }
  }, [tab])
  useEffect(() => { if (tab !== 'profile') void Promise.resolve().then(() => load()) }, [tab, load])

  const changeContract = async (contract, trangThai) => {
    try { await api.patch(`/contracts/${contract.id}/status`, { trangThai }); notify('Đã cập nhật hợp đồng.', 'success'); await load() }
    catch (err) { notify(err.message, 'error') }
  }
  const removeFavorite = async (item) => {
    try { await api.delete(`/favorites/${item.tinDangId}`); notify('Đã bỏ phòng khỏi danh sách yêu thích.', 'success'); await load() }
    catch (err) { notify(err.message, 'error') }
  }
  const hideRoom = async (item) => {
    if (!window.confirm(`Ẩn phòng #${item.id}? Người thuê sẽ không còn thấy tin này.`)) return
    try { await api.delete(`/rooms/${item.id}`); notify('Đã ẩn phòng. Bạn có thể chỉnh sửa để gửi duyệt lại.', 'success'); await load() }
    catch (err) { notify(err.message, 'error') }
  }
  const submitInvoice = async (event) => {
    event.preventDefault(); if (!invoiceTarget) return
    setInvoiceLoading(true)
    try {
      await api.post('/invoices', { hopDongId: invoiceTarget.id, thang: Number(invoiceForm.thang), nam: Number(invoiceForm.nam), tienDien: Number(invoiceForm.tienDien), tienNuoc: Number(invoiceForm.tienNuoc), khoanKhac: Number(invoiceForm.khoanKhac), hanThanhToan: invoiceForm.hanThanhToan })
      notify('Đã tạo hóa đơn tháng.', 'success'); setInvoiceTarget(null); setTab('invoices')
    } catch (err) { notify(err.message, 'error') }
    finally { setInvoiceLoading(false) }
  }
  const startPayment = async (invoice) => {
    try { await api.post(`/transactions/invoice/${invoice.id}`, { phuongThuc: 'chuyen_khoan', soTien: Number(invoice.tongTien) }); notify('Đã tạo yêu cầu ghi nhận thanh toán. Đây chưa phải giao dịch chuyển tiền thật.', 'success'); await load() }
    catch (err) { notify(err.message, 'error') }
  }
  const confirmTransaction = async (transaction, trangThai) => {
    try { await api.patch(`/transactions/${transaction.id}/status`, { trangThai }); notify('Đã cập nhật giao dịch.', 'success'); await load() }
    catch (err) { notify(err.message, 'error') }
  }
  const openChat = async (conversation) => {
    setActiveChat(conversation)
    setChatMessages([])
    setChatDraft('')
    setChatLoading(true)
    try {
      const result = await api.get(`/messages/${conversation.phongId}?doiTacId=${conversation.doiTacId}`)
      setChatMessages(result.data || [])
      if (tab === 'messages') await load()
    } catch (err) { notify(err.message, 'error'); setActiveChat(null) }
    finally { setChatLoading(false) }
  }
  const sendChat = async (event) => {
    event.preventDefault()
    if (!activeChat || !chatDraft.trim()) return
    setChatSending(true)
    try {
      await api.post(`/messages/${activeChat.phongId}`, { nguoiNhanId: Number(activeChat.doiTacId), noiDung: chatDraft.trim() })
      setChatDraft('')
      const result = await api.get(`/messages/${activeChat.phongId}?doiTacId=${activeChat.doiTacId}`)
      setChatMessages(result.data || [])
      await load()
    } catch (err) { notify(err.message, 'error') }
    finally { setChatSending(false) }
  }

  const tabs = [
    { key: 'rooms', icon: '⌂', label: 'Tin phòng của tôi' },
    { key: 'favorites', icon: '♡', label: 'Phòng yêu thích' },
    { key: 'messages', icon: '✉', label: 'Tin nhắn' },
    { key: 'contracts', icon: '▤', label: 'Hợp đồng thuê' },
    { key: 'invoices', icon: '₫', label: 'Hóa đơn' },
    { key: 'transactions', icon: '↗', label: 'Giao dịch' },
    { key: 'profile', icon: '○', label: 'Thông tin cá nhân' },
  ]
  const tabTitle = tabs.find((item) => item.key === tab)?.label || 'Không gian của tôi'

  return <main className="dashboard-page"><aside className="dashboard-sidebar"><div className="dashboard-user"><span className="avatar dashboard-avatar">{user.hoTen?.charAt(0)?.toUpperCase() || 'U'}</span><div><b>{user.hoTen}</b><small>{user.email}</small></div></div><div className="sidebar-caption">KHÔNG GIAN CỦA BẠN</div><nav className="dashboard-nav">{tabs.map((item) => <button key={item.key} className={tab === item.key ? 'selected' : ''} onClick={() => setTab(item.key)}><span>{item.icon}</span>{item.label}{tab === item.key && <b>›</b>}</button>)}</nav><div className="sidebar-help"><span>i</span><p>Cần cập nhật thông tin? Hồ sơ và bảo mật tài khoản nằm trong phần thông tin cá nhân.</p></div></aside>
    <section className="dashboard-content"><div className="dashboard-topbar"><div><div className="eyebrow"><span /> KHÔNG GIAN CỦA BẠN</div><h1>{tab === 'profile' ? 'Thông tin cá nhân' : `Xin chào, ${user.hoTen?.split(' ').slice(-1)[0] || 'bạn'}`}</h1><p>{tab === 'profile' ? 'Quản lý hồ sơ và mật khẩu.' : 'Theo dõi tin đăng, yêu cầu thuê và các khoản thanh toán tại đây.'}</p></div>{tab !== 'profile' && <button className="primary-button" onClick={() => navigate('add-room')}>+ Đăng phòng mới</button>}</div>
      {tab === 'profile' ? <ProfilePage user={user} onUpdated={onUserUpdated} notify={notify} /> : <>
        <div className="dashboard-page-title"><h2>{tabTitle}</h2><span>{data.length} mục</span></div>
        {error && <div className="inline-alert error-alert">{error}</div>}
        {loading ? <div className="loading-state"><span className="spinner" /> Đang tải dữ liệu...</div> : !data.length ? <div className="empty-state dashboard-empty"><div className="empty-illustration">{tabs.find((item) => item.key === tab)?.icon}</div><h3>Chưa có dữ liệu</h3><p>{tab === 'rooms' ? 'Bạn chưa đăng phòng nào. Bắt đầu bằng cách đăng tin đầu tiên.' : tab === 'favorites' ? 'Lưu những phòng phù hợp để xem lại sau.' : tab === 'messages' ? 'Khi bạn liên hệ chủ trọ hoặc có người thuê nhắn tin, hội thoại sẽ xuất hiện tại đây.' : 'Thông tin sẽ xuất hiện khi có phát sinh trong tài khoản của bạn.'}</p>{tab === 'rooms' && <button className="primary-button" onClick={() => navigate('add-room')}>Đăng phòng mới</button>}{tab === 'favorites' && <button className="secondary-button" onClick={() => navigate('home')}>Tìm phòng</button>}</div> : <div className="dashboard-list">
          {tab === 'rooms' && data.map((item) => <article className="dashboard-item" key={item.id}><div className="dashboard-item-thumb">{item.anhDaiDien ? <img src={item.anhDaiDien} alt="" /> : '⌂'}</div><div className="dashboard-item-main"><h3>{item.tieuDe || `Phòng #${item.id}`}</h3><p>{item.diaChi}, {item.diaChiXa}, {item.diaChiTinh}</p><div className="item-meta"><span>{money(item.giaThue)} / tháng</span><span>{Number(item.dienTich).toLocaleString('vi-VN')} m²</span><span className={`status-pill status-${item.trangThaiTinDang}`}>{statusLabel[item.trangThaiTinDang] || item.trangThaiTinDang || 'Chưa có tin'}</span><span className={`status-pill status-${item.trangThaiPhong}`}>{statusLabel[item.trangThaiPhong] || item.trangThaiPhong}</span></div></div><div className="dashboard-item-actions"><button className="small-outline" disabled={item.trangThaiTinDang !== 'da_dang' || item.trangThaiPhong !== 'trong'} onClick={() => onSelectRoom({ id: item.id })}>{item.trangThaiTinDang === 'da_dang' && item.trangThaiPhong === 'trong' ? 'Xem tin' : 'Chưa công khai'}</button>{item.trangThaiPhong !== 'da_thue' && <><button className="small-outline" onClick={() => onEditRoom(item.id)}>{item.trangThaiPhong === 'bao_tri' ? 'Sửa / đăng lại' : 'Chỉnh sửa'}</button>{item.trangThaiPhong !== 'bao_tri' && <button className="small-danger" onClick={() => hideRoom(item)}>Ẩn phòng</button>}</>}{item.trangThaiTinDang === 'cho_duyet' && <small>Đang chờ admin duyệt</small>}</div></article>)}
          {tab === 'favorites' && data.map((item) => <article className="dashboard-item" key={item.yeuThichId}><div className="dashboard-item-thumb">{item.anhDaiDien ? <img src={item.anhDaiDien} alt="" /> : '⌂'}</div><div className="dashboard-item-main"><h3>{item.tieuDe}</h3><p>{item.diaChi}, {item.diaChiXa}, {item.diaChiTinh}</p><div className="item-meta"><span>{money(item.giaThue)} / tháng</span><span>{Number(item.dienTich).toLocaleString('vi-VN')} m²</span></div></div><div className="dashboard-item-actions"><button className="small-outline" onClick={() => onSelectRoom({ id: item.phongId })}>Xem phòng</button><button className="small-danger" onClick={() => removeFavorite(item)}>Bỏ lưu</button></div></article>)}
          {tab === 'messages' && data.map((item) => <article className="dashboard-item" key={`${item.phongId}-${item.doiTacId}`}><div className="contract-icon message-icon">✉</div><div className="dashboard-item-main"><h3>{item.tenDoiTac} · {item.tieuDe || `Phòng #${item.phongId}`}</h3><p>{item.diaChi}</p><div className="item-meta"><span>{item.tinNhanCuoi || 'Chưa có nội dung'}</span>{Number(item.soTinChuaDoc) > 0 && <span className="status-pill status-cho_xu_ly">{item.soTinChuaDoc} tin chưa đọc</span>}</div><small className="invoice-breakdown">Cập nhật: {item.ngayCapNhat ? new Date(item.ngayCapNhat).toLocaleString('vi-VN') : '—'}</small></div><div className="dashboard-item-actions"><button className="small-outline" onClick={() => openChat(item)}>Mở hội thoại →</button></div></article>)}
          {tab === 'contracts' && data.map((item) => { const owner = Number(item.chuTroId) === Number(user.id); return <article className="dashboard-item contract-item" key={item.id}><div className="contract-icon">▤</div><div className="dashboard-item-main"><h3>Hợp đồng #{item.id} · {item.diaChi}</h3><p>{owner ? `Người thuê: ${item.tenNguoiThue}` : `Chủ trọ: ${item.tenChuTro}`} · {item.ngayBatDau} đến {item.ngayKetThuc}</p><div className="item-meta"><span>{money(item.giaThue)} / tháng</span><span>Cọc: {money(item.tienCoc)}</span><span className={`status-pill status-${item.trangThai}`}>{statusLabel[item.trangThai] || item.trangThai}</span></div></div><div className="dashboard-item-actions">{item.trangThai === 'cho_hieu_luc' && owner && <><button className="small-success" onClick={() => changeContract(item, 'hieu_luc')}>Duyệt</button><button className="small-danger" onClick={() => changeContract(item, 'da_huy')}>Từ chối</button></>}{item.trangThai === 'cho_hieu_luc' && !owner && <button className="small-danger" onClick={() => changeContract(item, 'da_huy')}>Hủy yêu cầu</button>}{item.trangThai === 'hieu_luc' && owner && <><button className="small-outline" onClick={() => { setInvoiceTarget(item); setInvoiceForm((old) => ({ ...old, thang: String(new Date().getMonth() + 1), nam: String(new Date().getFullYear()) })) }}>+ Tạo hóa đơn</button><button className="small-danger" onClick={() => changeContract(item, 'het_han')}>Kết thúc</button></>}</div></article>})}
          {tab === 'invoices' && data.map((item) => { const isTenant = Number(item.nguoiThueId) === Number(user.id); return <article className="dashboard-item" key={item.id}><div className="contract-icon invoice-icon">₫</div><div className="dashboard-item-main"><h3>Hóa đơn tháng {item.thang}/{item.nam}</h3><p>{item.diaChi} · Hạn thanh toán: {new Date(item.hanThanhToan).toLocaleDateString('vi-VN')}</p><div className="item-meta"><span className="invoice-amount">{money(item.tongTien)}</span><span className={`status-pill status-${item.trangThai}`}>{statusLabel[item.trangThai] || item.trangThai}</span></div><small className="invoice-breakdown">Phòng {money(item.tienPhong)} · Điện {money(item.tienDien)} · Nước {money(item.tienNuoc)} · Khác {money(item.khoanKhac)}</small></div><div className="dashboard-item-actions">{isTenant && item.trangThai !== 'da_thanh_toan' && <button className="small-outline" onClick={() => startPayment(item)}>Gửi xác nhận thanh toán</button>}</div></article>})}
          {tab === 'transactions' && data.map((item) => { const owner = Number(item.nguoiNhanId) === Number(user.id); return <article className="dashboard-item" key={item.id}><div className="contract-icon invoice-icon">↗</div><div className="dashboard-item-main"><h3>Giao dịch #{item.id} · Hóa đơn {item.thang}/{item.nam}</h3><p>{owner ? `Người gửi: ${item.tenNguoiGui}` : `Người nhận: ${item.tenNguoiNhan}`} · {item.phuongThuc.replaceAll('_', ' ')}</p><div className="item-meta"><span className="invoice-amount">{money(item.soTien)}</span><span className={`status-pill status-${item.trangThai}`}>{statusLabel[item.trangThai] || item.trangThai}</span></div></div><div className="dashboard-item-actions">{owner && item.trangThai === 'cho_xu_ly' && <><button className="small-success" onClick={() => confirmTransaction(item, 'thanh_cong')}>Xác nhận</button><button className="small-danger" onClick={() => confirmTransaction(item, 'that_bai')}>Từ chối</button></>}</div></article>})}
        </div>}
      </>}
    </section>
    {invoiceTarget && <div className="modal-backdrop" onClick={() => setInvoiceTarget(null)}><form className="modal-card" onSubmit={submitInvoice} onClick={(event) => event.stopPropagation()}><button type="button" className="modal-close" onClick={() => setInvoiceTarget(null)}>×</button><div className="eyebrow"><span /> HỢP ĐỒNG #{invoiceTarget.id}</div><h2>Tạo hóa đơn tháng</h2><p>Tiền phòng mặc định lấy theo hợp đồng. Nhập thêm các khoản phát sinh.</p><div className="form-grid"><label>Tháng<input type="number" min="1" max="12" value={invoiceForm.thang} onChange={(event) => setInvoiceForm((old) => ({ ...old, thang: event.target.value }))} required /></label><label>Năm<input type="number" min="2000" max="2200" value={invoiceForm.nam} onChange={(event) => setInvoiceForm((old) => ({ ...old, nam: event.target.value }))} required /></label><label>Tiền điện<input type="number" min="0" value={invoiceForm.tienDien} onChange={(event) => setInvoiceForm((old) => ({ ...old, tienDien: event.target.value }))} required /></label><label>Tiền nước<input type="number" min="0" value={invoiceForm.tienNuoc} onChange={(event) => setInvoiceForm((old) => ({ ...old, tienNuoc: event.target.value }))} required /></label><label>Khoản khác<input type="number" min="0" value={invoiceForm.khoanKhac} onChange={(event) => setInvoiceForm((old) => ({ ...old, khoanKhac: event.target.value }))} required /></label><label>Hạn thanh toán<input type="date" value={invoiceForm.hanThanhToan} onChange={(event) => setInvoiceForm((old) => ({ ...old, hanThanhToan: event.target.value }))} required /></label></div><div className="form-actions"><button type="button" className="secondary-button" onClick={() => setInvoiceTarget(null)}>Hủy</button><button className="primary-button" disabled={invoiceLoading}>{invoiceLoading ? 'Đang tạo...' : 'Tạo hóa đơn'}</button></div></form></div>}
    {activeChat && <div className="modal-backdrop" onClick={() => setActiveChat(null)}><section className="modal-card chat-modal" onClick={(event) => event.stopPropagation()}><button type="button" className="modal-close" onClick={() => setActiveChat(null)}>×</button><div className="eyebrow"><span /> TIN NHẮN PHÒNG #{activeChat.phongId}</div><h2>{activeChat.tenDoiTac}</h2><p>{activeChat.tieuDe || activeChat.diaChi} · {activeChat.diaChi}</p><div className="chat-history">{chatLoading ? <div className="loading-state"><span className="spinner" /> Đang tải hội thoại...</div> : chatMessages.length ? chatMessages.map((item) => <article className={`chat-bubble ${Number(item.nguoiGuiId) === Number(user.id) ? 'chat-mine' : 'chat-other'}`} key={item.id}><b>{Number(item.nguoiGuiId) === Number(user.id) ? 'Bạn' : item.tenNguoiGui}</b><p>{item.noiDung}</p><small>{new Date(item.ngayGui).toLocaleString('vi-VN')}</small></article>) : <p className="muted">Chưa có tin nhắn.</p>}</div><form className="chat-compose" onSubmit={sendChat}><textarea rows="2" maxLength="5000" value={chatDraft} onChange={(event) => setChatDraft(event.target.value)} placeholder="Nhập tin nhắn..." required /><button className="primary-button" disabled={chatSending || !chatDraft.trim()}>{chatSending ? 'Đang gửi...' : 'Gửi tin nhắn →'}</button></form></section></div>}
  </main>
}
