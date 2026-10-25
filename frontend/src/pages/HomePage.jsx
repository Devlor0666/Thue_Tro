import { useState } from 'react'
import RoomCard from '../components/RoomCard.jsx'

export default function HomePage({ rooms, pagination, loading, error, onSearch, onSelect, user, navigate }) {
  const [filters, setFilters] = useState({ q: '', tinh: '', minPrice: '', maxPrice: '' })
  const [sort, setSort] = useState('newest')
  const update = (event) => setFilters((current) => ({ ...current, [event.target.name]: event.target.value }))
  const submit = (event) => {
    event.preventDefault()
    onSearch({ ...filters, sort })
  }

  return (
    <main>
      <section className="hero-section">
        <div className="hero-pattern pattern-one" /><div className="hero-pattern pattern-two" />
        <div className="hero-inner">
          <div className="hero-copy">
            <div className="eyebrow light-eyebrow"><span /> TÌM NƠI THUỘC VỀ BẠN</div>
            <h1>Tìm phòng trọ dễ dàng.<br /><em>An cư</em> theo cách của bạn.</h1>
            <p className="hero-description">Khám phá nơi ở phù hợp, kết nối trực tiếp với chủ trọ và quản lý hành trình thuê phòng trong một nơi.</p>
            <div className="hero-points"><span><i>✓</i> Tin đăng minh bạch</span><span><i>✓</i> Tìm kiếm nhanh</span><span><i>✓</i> Chủ trọ trực tiếp</span></div>
          </div>
          <div className="hero-illustration" aria-hidden="true">
            <div className="sun-disc" /><div className="hero-house"><div className="house-roof" /><div className="house-body"><div className="house-window window-left" /><div className="house-door" /><div className="house-window window-right" /></div><div className="house-plant"><span /><span /><span /></div></div>
            <div className="float-note note-top"><span className="note-icon">⌂</span><span><b>Không gian phù hợp</b><small>Tìm theo nhu cầu của bạn</small></span></div>
            <div className="float-note note-bottom"><span className="note-check">✓</span><span><b>Ở an tâm hơn</b><small>Kết nối rõ ràng, minh bạch</small></span></div>
          </div>
        </div>
        <div className="hero-bottom"><span>01 — TÌM PHÒNG</span><span className="hero-bottom-line" /><span>AN TÂM TỪ BƯỚC ĐẦU TIÊN</span></div>
      </section>

      <section className="search-section" id="search-rooms">
        <div className="search-heading"><div><div className="eyebrow"><span /> KHÁM PHÁ PHÒNG TRỌ</div><h2>Bắt đầu từ nơi bạn muốn ở</h2><p>Lọc theo khu vực và ngân sách để tìm lựa chọn phù hợp.</p></div><span className="search-heading-number">01<span>/03</span></span></div>
        <form className="search-panel" onSubmit={submit}>
          <label className="search-field search-keyword"><span className="field-symbol">⌕</span><span className="field-content"><small>TỪ KHÓA</small><input name="q" value={filters.q} onChange={update} placeholder="Tên phòng, đường, địa điểm..." /></span></label>
          <label className="search-field"><span className="field-symbol">⌖</span><span className="field-content"><small>TỈNH / THÀNH PHỐ</small><input name="tinh" value={filters.tinh} onChange={update} placeholder="VD: Hà Nội" /></span></label>
          <label className="search-field price-filter"><span className="field-symbol">₫</span><span className="field-content"><small>GIÁ THUÊ TỪ</small><input type="number" min="0" name="minPrice" value={filters.minPrice} onChange={update} placeholder="0 đ" /></span></label>
          <label className="search-field price-filter"><span className="field-symbol">₫</span><span className="field-content"><small>ĐẾN GIÁ</small><input type="number" min="0" name="maxPrice" value={filters.maxPrice} onChange={update} placeholder="5.000.000 đ" /></span></label>
          <button className="search-submit" type="submit"><span>⌕</span> Tìm phòng</button>
        </form>
      </section>

      <section className="listing-section">
        <div className="section-topline"><div><div className="eyebrow"><span /> DÀNH CHO BẠN</div><h2>Phòng trọ nổi bật</h2><p>Những lựa chọn đang được đăng trên Trọ An.</p></div><label className="sort-control"><span>Sắp xếp</span><select value={sort} onChange={(event) => { setSort(event.target.value); onSearch({ ...filters, sort: event.target.value }) }}><option value="newest">Mới đăng</option><option value="price_asc">Giá thấp đến cao</option><option value="price_desc">Giá cao đến thấp</option></select></label></div>
        {error && <div className="inline-alert warning-alert"><b>Chưa kết nối được dữ liệu phòng.</b> {error} <span>Kiểm tra backend và cấu hình database.</span></div>}
        {loading ? <div className="loading-state"><span className="spinner" /> Đang tìm phòng phù hợp...</div> : rooms.length ? (
          <><div className="room-grid">{rooms.map((room) => <RoomCard key={room.id} room={room} onSelect={onSelect} />)}</div>
            {pagination?.total > rooms.length && <div className="results-note">Đang hiển thị {rooms.length} trong {pagination.total} phòng. Hãy dùng bộ lọc để thu hẹp kết quả.</div>}
          </>
        ) : <div className="empty-state"><div className="empty-illustration">⌂</div><h3>Chưa có phòng phù hợp</h3><p>Thử đổi từ khóa hoặc khu vực tìm kiếm. Tin đăng mới sẽ xuất hiện tại đây sau khi được duyệt.</p>{user && <button className="primary-button" onClick={() => navigate('add-room')}>Đăng phòng đầu tiên</button>}</div>}
      </section>

      <section className="steps-section"><div className="steps-intro"><div className="eyebrow"><span /> BẮT ĐẦU THẬT ĐƠN GIẢN</div><h2>Từ tìm kiếm<br />đến an cư.</h2><p>Mọi thứ bạn cần cho hành trình thuê phòng, bắt đầu từ ba bước nhỏ.</p><button className="text-arrow" onClick={() => onSearch({})}>Khám phá phòng trọ <span>↗</span></button></div><div className="steps-list"><div className="step-item"><span className="step-number">01</span><div><h3>Tìm nơi phù hợp</h3><p>Lọc phòng theo khu vực, giá thuê và diện tích. Xem thông tin trước khi liên hệ.</p></div><span className="step-mark">⌕</span></div><div className="step-item"><span className="step-number">02</span><div><h3>Kết nối trực tiếp</h3><p>Trao đổi với chủ trọ, gửi yêu cầu thuê và theo dõi trạng thái hợp đồng.</p></div><span className="step-mark">↗</span></div><div className="step-item"><span className="step-number">03</span><div><h3>Quản lý rõ ràng</h3><p>Lưu phòng yêu thích, xem hóa đơn và cập nhật thông tin ngay trong tài khoản.</p></div><span className="step-mark">✓</span></div></div></section>
      <section className="host-cta"><div><div className="eyebrow light-eyebrow"><span /> BẠN CÓ PHÒNG CHO THUÊ?</div><h2>Không gian tốt xứng đáng<br />được tìm thấy.</h2><p>Đăng tin, quản lý yêu cầu thuê và theo dõi hóa đơn tại một nơi.</p></div><button onClick={() => navigate(user ? 'add-room' : 'register')}>Bắt đầu đăng phòng <span>↗</span></button></section>
    </main>
  )
}
