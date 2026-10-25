import { useEffect, useState } from 'react'
import { api } from '../services/api.js'

const money = (value) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(Number(value || 0))
const today = () => new Date().toLocaleDateString('sv-SE')
const futureDate = () => { const value = new Date(); value.setFullYear(value.getFullYear() + 1); return value.toLocaleDateString('sv-SE') }

export default function RoomDetailPage({ initialRoom, user, navigate, notify }) {
  const [room, setRoom] = useState(initialRoom)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('Chào anh/chị, phòng này hiện còn cho thuê không ạ?')
  const [lyDo, setLyDo] = useState('')
  const [review, setReview] = useState({ soSao: 5, binhLuan: '' })
  const [contract, setContract] = useState({ ngayBatDau: today(), ngayKetThuc: futureDate(), tienCoc: '' })
  const [busy, setBusy] = useState('')
  const [error, setError] = useState('')
  const isOwner = Boolean(user && room && Number(user.id) === Number(room.chuTroId))

  useEffect(() => {
    let active = true
    Promise.all([api.get(`/rooms/${initialRoom.id}`), api.get(`/reviews/room/${initialRoom.id}`)])
      .then(([roomData, reviewData]) => { if (active) { setRoom(roomData.room); setReviews(reviewData.data || []) } })
      .catch((err) => { if (active) setError(err.message) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [initialRoom.id])

  const requireLogin = () => { notify('Bạn cần đăng nhập để sử dụng chức năng này.', 'warning'); navigate('login') }
  const favorite = async () => {
    if (!user) return requireLogin()
    setBusy('favorite')
    try { await api.post(`/favorites/${room.tinDangId}`); notify('Đã lưu phòng vào danh sách yêu thích.', 'success') }
    catch (err) { notify(err.message, 'error') }
    finally { setBusy('') }
  }
  const sendMessage = async (event) => {
    event.preventDefault()
    if (!user) return requireLogin()
    setBusy('message')
    try { await api.post(`/messages/${room.id}`, { noiDung: message }); notify('Đã gửi lời nhắn đến chủ trọ.', 'success'); setMessage('') }
    catch (err) { notify(err.message, 'error') }
    finally { setBusy('') }
  }
  const requestContract = async (event) => {
    event.preventDefault()
    if (!user) return requireLogin()
    setBusy('contract')
    try {
      await api.post('/contracts', { phongId: room.id, ngayBatDau: contract.ngayBatDau, ngayKetThuc: contract.ngayKetThuc, tienCoc: Number(contract.tienCoc || 0) })
      notify('Đã gửi yêu cầu thuê. Theo dõi trạng thái trong Không gian của tôi.', 'success')
      navigate('dashboard')
    } catch (err) { notify(err.message, 'error') }
    finally { setBusy('') }
  }
  const submitReport = async (event) => {
    event.preventDefault()
    if (!user) return requireLogin()
    setBusy('report')
    try { await api.post('/reports', { tinDangId: room.tinDangId, lyDo }); notify('Đã gửi báo cáo đến quản trị viên.', 'success'); setLyDo('') }
    catch (err) { notify(err.message, 'error') }
    finally { setBusy('') }
  }
  const submitReview = async (event) => {
    event.preventDefault()
    if (!user) return requireLogin()
    setBusy('review')
    try {
      await api.post(`/reviews/room/${room.id}`, review)
      const response = await api.get(`/reviews/room/${room.id}`)
      setReviews(response.data || [])
      notify('Đã lưu đánh giá của bạn.', 'success')
      setReview({ soSao: 5, binhLuan: '' })
    } catch (err) { notify(err.message, 'error') }
    finally { setBusy('') }
  }

  if (loading) return <main className="detail-loading"><span className="spinner" /> Đang tải thông tin phòng...</main>
  if (error && !room) return <main className="form-page"><div className="inline-alert error-alert">{error}</div><button className="back-link" onClick={() => navigate('home')}>← Quay lại danh sách</button></main>

  return <main className="detail-page">
    <button className="back-link detail-back" onClick={() => navigate('home')}>← Quay lại danh sách phòng</button>
    <div className="detail-header"><div><div className="eyebrow"><span /> THÔNG TIN PHÒNG</div><h1>{room.tieuDe}</h1><p className="detail-address"><span>⌖</span>{room.diaChi}, {room.diaChiXa}, {room.diaChiTinh}</p></div><div className="detail-price-box"><strong>{money(room.giaThue)}</strong><span>/ tháng</span></div></div>
    <div className="detail-layout"><div className="detail-main">
      <div className="detail-image-large">{room.anhPhong?.[0]?.duongDan ? <img src={room.anhPhong[0].duongDan} alt={room.tieuDe} /> : room.anhDaiDien ? <img src={room.anhDaiDien} alt={room.tieuDe} /> : <div className="detail-placeholder"><span>⌂</span><small>KHÔNG GIAN SỐNG TỐT HƠN</small></div>}<span className="room-tag">{room.trangThaiPhong === 'trong' ? 'Đang cho thuê' : room.trangThaiPhong}</span></div>
      <div className="detail-facts"><div><span>DIỆN TÍCH</span><b>{Number(room.dienTich).toLocaleString('vi-VN')} m²</b></div><div><span>KHU VỰC</span><b>{room.diaChiXa}</b></div><div><span>ĐÁNH GIÁ</span><b>★ {room.diemDanhGia || 'Chưa có'} <small>({room.soDanhGia || reviews.length} đánh giá)</small></b></div></div>
      <section className="detail-content-section"><div className="eyebrow"><span /> GIỚI THIỆU</div><h2>Về căn phòng này</h2><p className="room-description">{room.moTaTinDang || room.moTaPhong || 'Chủ trọ chưa bổ sung mô tả chi tiết cho căn phòng này.'}</p></section>
      {room.anhPhong?.length > 1 && <section className="detail-content-section"><div className="eyebrow"><span /> HÌNH ẢNH</div><h2>Không gian phòng</h2><div className="detail-gallery">{room.anhPhong.slice(1).map((image) => <img key={image.id} src={image.duongDan} alt="Ảnh phòng trọ" loading="lazy" />)}</div></section>}
      <section className="detail-content-section reviews-section"><div className="eyebrow"><span /> CỘNG ĐỒNG</div><h2>Đánh giá từ người thuê</h2>{reviews.length ? <div className="review-list">{reviews.map((item) => <article className="review-item" key={item.id}><span className="avatar">{item.hoTen?.charAt(0)?.toUpperCase() || 'U'}</span><div><div className="review-name">{item.hoTen} <span>{'★'.repeat(item.soSao)}{'☆'.repeat(5-item.soSao)}</span></div><p>{item.binhLuan || 'Người thuê không để lại bình luận.'}</p><small>{new Date(item.ngayTao).toLocaleDateString('vi-VN')}</small></div></article>)}</div> : <p className="muted">Chưa có đánh giá. Hãy là người đầu tiên chia sẻ trải nghiệm sau khi thuê phòng.</p>}
        {user && <form className="mini-form review-form" onSubmit={submitReview}><label>Đánh giá của bạn<select value={review.soSao} onChange={(event) => setReview((old) => ({ ...old, soSao: Number(event.target.value) }))}><option value="5">5 sao — Rất tốt</option><option value="4">4 sao — Tốt</option><option value="3">3 sao — Bình thường</option><option value="2">2 sao — Chưa tốt</option><option value="1">1 sao — Không hài lòng</option></select></label><label>Bình luận<textarea value={review.binhLuan} onChange={(event) => setReview((old) => ({ ...old, binhLuan: event.target.value }))} maxLength="2000" rows="3" placeholder="Chia sẻ trải nghiệm của bạn..." /></label><button className="secondary-button" disabled={busy === 'review'}>{busy === 'review' ? 'Đang gửi...' : 'Gửi đánh giá'}</button></form>}
      </section>
    </div>
    <aside className="detail-sidebar">{isOwner ? <div className="contact-card"><div className="eyebrow"><span /> KHÔNG GIAN CHỦ TRỌ</div><h3>Đây là tin đăng của bạn</h3><p className="muted">Bạn có thể quản lý trạng thái tin, theo dõi yêu cầu thuê và hóa đơn trong không gian của mình.</p><button className="primary-button full-width" onClick={() => navigate('dashboard')}>Quản lý tin đăng →</button></div> : <><div className="contact-card"><div className="contact-card-heading"><span className="avatar landlord-avatar">{room.tenChuTro?.charAt(0)?.toUpperCase() || 'C'}</span><div><small>NGƯỜI CHO THUÊ</small><h3>{room.tenChuTro || 'Chủ trọ'}</h3><p>Thành viên Trọ An</p></div></div><button className="outline-button full-width" onClick={favorite} disabled={busy === 'favorite'}>{busy === 'favorite' ? 'Đang lưu...' : '♡ Lưu phòng yêu thích'}</button><div className="contact-separator" /><form className="mini-form" onSubmit={sendMessage}><label>Nhắn tin cho chủ trọ<textarea rows="3" value={message} onChange={(event) => setMessage(event.target.value)} maxLength="5000" required /></label><button className="primary-button full-width" disabled={busy === 'message'}>{busy === 'message' ? 'Đang gửi...' : 'Gửi lời nhắn →'}</button></form><div className="contact-note"><span>i</span> Trọ An không thu phí liên hệ. Hãy xem phòng trực tiếp trước khi đặt cọc.</div></div>
      <form className="contact-card rent-card" onSubmit={requestContract}><div className="eyebrow"><span /> GỬI YÊU CẦU</div><h3>Muốn thuê phòng này?</h3><p>Gửi đề nghị đến chủ trọ để theo dõi việc xác nhận hợp đồng.</p><label>Ngày dự kiến bắt đầu<input type="date" min={today()} value={contract.ngayBatDau} onChange={(event) => setContract((old) => ({ ...old, ngayBatDau: event.target.value }))} required /></label><label>Ngày kết thúc<input type="date" min={contract.ngayBatDau} value={contract.ngayKetThuc} onChange={(event) => setContract((old) => ({ ...old, ngayKetThuc: event.target.value }))} required /></label><label>Tiền cọc (VNĐ)<input type="number" min="0" step="100000" value={contract.tienCoc} onChange={(event) => setContract((old) => ({ ...old, tienCoc: event.target.value }))} placeholder="VD: 2500000" required /></label><button className="primary-button full-width" disabled={busy === 'contract'}>{busy === 'contract' ? 'Đang gửi...' : 'Gửi yêu cầu thuê'}</button></form>
      <form className="report-card" onSubmit={submitReport}><label>Báo cáo tin đăng<textarea rows="2" value={lyDo} onChange={(event) => setLyDo(event.target.value)} minLength="5" maxLength="255" placeholder="Nêu lý do nếu tin có dấu hiệu không chính xác..." required /></label><button type="submit" disabled={busy === 'report'}>{busy === 'report' ? 'Đang gửi...' : 'Gửi báo cáo'}</button></form></>}</aside></div>
  </main>
}
