function formatMoney(value) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(Number(value || 0))
}

export default function RoomCard({ room, onSelect }) {
  return (
    <article className="room-card">
      <button className="room-image-button" onClick={() => onSelect(room)} aria-label={`Xem ${room.tieuDe}`}>
        {room.anhDaiDien ? (
          <img className="room-image" src={room.anhDaiDien} alt={room.tieuDe} loading="lazy" onError={(event) => { event.currentTarget.style.display = 'none' }} />
        ) : null}
        <span className="image-placeholder"><span className="placeholder-building">⌂</span><small>KHÔNG GIAN SỐNG TỐT HƠN</small></span>
        <span className="room-tag">Đang cho thuê</span>
      </button>
      <div className="room-card-body">
        <div className="room-location"><span>⌖</span> {room.diaChiXa}, {room.diaChiTinh}</div>
        <button className="room-title" onClick={() => onSelect(room)}>{room.tieuDe}</button>
        <p className="room-address">{room.diaChi}</p>
        <div className="room-facts">
          <span><b>↗</b> {Number(room.dienTich).toLocaleString('vi-VN')} m²</span>
          <span><b>☆</b> {room.diemDanhGia ? `${room.diemDanhGia} (${room.soDanhGia || 0})` : 'Chưa có đánh giá'}</span>
        </div>
        <div className="room-card-bottom">
          <div><strong className="room-price">{formatMoney(room.giaThue)}</strong><span className="price-unit"> / tháng</span></div>
          <button className="round-arrow" onClick={() => onSelect(room)} aria-label="Xem chi tiết">↗</button>
        </div>
      </div>
    </article>
  )
}
