export default function NotFoundPage({ navigate }) {
  return (
    <main className="form-page">
      <div className="eyebrow"><span /> KHÔNG TÌM THẤY TRANG</div>
      <h1>Trang này không tồn tại</h1>
      <p className="muted">Đường dẫn có thể đã thay đổi hoặc trang bạn tìm không có sẵn.</p>
      <button className="primary-button" onClick={() => navigate('home')}>
        ← Quay về trang chủ
      </button>
    </main>
  )
}
