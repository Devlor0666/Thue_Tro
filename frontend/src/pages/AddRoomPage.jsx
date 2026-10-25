import { useEffect, useState } from 'react'
import { api } from '../services/api.js'

const initial = { tieuDe: '', diaChi: '', diaChiTinh: '', diaChiXa: '', dienTich: '', giaThue: '', moTa: '', anhPhongText: '' }

export default function AddRoomPage({ navigate, notify, roomId }) {
  const [form, setForm] = useState(initial)
  const [currentRoom, setCurrentRoom] = useState(null)
  const [loadingRoom, setLoadingRoom] = useState(Boolean(roomId))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const editing = Boolean(roomId)
  const update = (event) => setForm((old) => ({ ...old, [event.target.name]: event.target.value }))

  useEffect(() => {
    if (!roomId) return undefined
    let active = true
    void Promise.resolve().then(() => api.get(`/rooms/mine/${roomId}`))
      .then(({ room }) => {
        if (!active) return
        setCurrentRoom(room)
        setForm({
          tieuDe: room.tieuDe || '',
          diaChi: room.diaChi || '',
          diaChiTinh: room.diaChiTinh || '',
          diaChiXa: room.diaChiXa || '',
          dienTich: String(room.dienTich ?? ''),
          giaThue: String(room.giaThue ?? ''),
          moTa: room.moTaPhong || room.moTaTinDang || '',
          anhPhongText: (room.anhPhong || []).map((image) => image.duongDan).join('\n'),
        })
      })
      .catch((err) => { if (active) setError(err.message) })
      .finally(() => { if (active) setLoadingRoom(false) })
    return () => { active = false }
  }, [roomId])

  const submit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    try {
      if (editing && currentRoom?.trangThaiPhong === 'da_thue') {
        throw new Error('Phòng đang có hợp đồng hiệu lực. Hãy kết thúc hợp đồng trước khi chỉnh sửa.')
      }
      const anhPhong = form.anhPhongText.split('\n').map((url) => url.trim()).filter(Boolean)
      if (anhPhong.length > 10) throw new Error('Tối đa 10 đường dẫn ảnh cho mỗi phòng.')
      const payload = {
        tieuDe: form.tieuDe,
        diaChi: form.diaChi,
        diaChiTinh: form.diaChiTinh,
        diaChiXa: form.diaChiXa,
        dienTich: Number(form.dienTich),
        giaThue: Number(form.giaThue),
        moTa: form.moTa,
        moTaTinDang: form.moTa,
        anhPhong,
      }
      if (editing) {
        await api.patch(`/rooms/${roomId}`, { ...payload, trangThai: 'trong' })
        notify('Đã cập nhật phòng. Tin đăng được chuyển sang chờ quản trị viên duyệt lại.', 'success')
      } else {
        await api.post('/rooms', payload)
        notify('Đã gửi tin đăng. Phòng sẽ hiển thị sau khi quản trị viên duyệt.', 'success')
      }
      navigate('dashboard')
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  if (loadingRoom) return <main className="form-page"><div className="loading-state"><span className="spinner" /> Đang tải thông tin phòng...</div></main>
  if (editing && !currentRoom) return <main className="form-page"><div className="inline-alert error-alert">{error || 'Không tải được thông tin phòng.'}</div><button className="back-link" onClick={() => navigate('dashboard')}>← Quay lại không gian của tôi</button></main>

  return <main className="form-page"><div className="form-page-heading"><button className="back-link" onClick={() => navigate('dashboard')}>← Quay lại không gian của tôi</button><div className="eyebrow"><span /> DÀNH CHO CHỦ TRỌ</div><h1>{editing ? 'Chỉnh sửa phòng cho thuê' : 'Đăng phòng cho thuê'}</h1><p>{editing ? 'Cập nhật nội dung phòng. Tin đăng sẽ cần được quản trị viên duyệt lại trước khi xuất hiện công khai.' : 'Chia sẻ đầy đủ thông tin để người thuê dễ dàng tìm thấy căn phòng của bạn.'}</p></div>
    <form className="listing-form" onSubmit={submit}>
      {error && <div className="inline-alert error-alert">{error}</div>}
      <div className="form-section-title"><span>01</span><div><h2>Thông tin phòng</h2><p>Thông tin cơ bản giúp người thuê hình dung nơi ở.</p></div></div>
      <div className="form-grid"><label className="span-two">Tiêu đề tin đăng<input name="tieuDe" value={form.tieuDe} onChange={update} placeholder="VD: Phòng thoáng sáng gần trường đại học" minLength="5" maxLength="255" required /></label><label className="span-two">Địa chỉ cụ thể<input name="diaChi" value={form.diaChi} onChange={update} placeholder="Số nhà, tên đường, khu phố..." required /></label><label>Tỉnh / thành phố<input name="diaChiTinh" value={form.diaChiTinh} onChange={update} placeholder="VD: Hà Nội" required /></label><label>Phường / xã<input name="diaChiXa" value={form.diaChiXa} onChange={update} placeholder="VD: Hà Đông" required /></label><label>Diện tích (m²)<input name="dienTich" type="number" min="1" step="0.1" value={form.dienTich} onChange={update} placeholder="25" required /></label><label>Giá thuê mỗi tháng (VNĐ)<input name="giaThue" type="number" min="0" step="10000" value={form.giaThue} onChange={update} placeholder="2500000" required /></label><label className="span-two">Mô tả phòng<textarea name="moTa" value={form.moTa} onChange={update} rows="5" maxLength="10000" placeholder="Tiện nghi, giờ giấc, chi phí khác, điều kiện thuê..." /></label></div>
      <div className="form-section-title next-form-section"><span>02</span><div><h2>Hình ảnh phòng</h2><p>Thêm tối đa 10 URL ảnh công khai, mỗi dòng một đường dẫn. Có thể bổ sung sau.</p></div></div>
      <label>Đường dẫn ảnh (không bắt buộc)<textarea name="anhPhongText" value={form.anhPhongText} onChange={update} rows="3" placeholder={'https://example.com/phong-1.jpg\nhttps://example.com/phong-2.jpg'} /></label>
      <div className="form-note"><span>i</span><p>{editing ? <>Lưu ý: nội dung tin đăng sẽ chuyển về trạng thái <b>Chờ duyệt</b> sau khi cập nhật. Nếu phòng đang bị ẩn/bảo trì, thao tác này sẽ đưa phòng về trạng thái còn trống.</> : <>Tin mới sẽ ở trạng thái <b>Chờ duyệt</b>. Chỉ tin được quản trị viên phê duyệt mới xuất hiện trong danh sách tìm kiếm công khai.</>}</p></div>
      <div className="form-actions"><button type="button" className="secondary-button" onClick={() => navigate('dashboard')}>Hủy</button><button type="submit" className="primary-button" disabled={loading}>{loading ? 'Đang lưu...' : editing ? 'Lưu thay đổi →' : 'Gửi tin để duyệt →'}</button></div>
    </form>
  </main>
}
