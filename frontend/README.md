# Trọ An - Frontend

Frontend React + Vite cho ứng dụng quản lý phòng trọ.

## Chạy dự án

```bash
npm install
npm run dev
```

Mặc định frontend gọi API tại `http://localhost:3000`. Có thể đổi bằng biến `VITE_API_URL` trong file `.env`.

## Các đường dẫn giao diện

- `/` - Tìm phòng
- `/rooms/:id` - Chi tiết phòng
- `/login` và `/register` - Đăng nhập / đăng ký
- `/rooms/new` - Đăng phòng
- `/rooms/:id/edit` - Chỉnh sửa phòng
- `/dashboard` - Không gian tài khoản
- `/admin` - Quản trị

Điều hướng được quản lý trong `src/routes/routeConfig.js`; các trang và component giao diện hiện có được giữ nguyên. Khi triển khai lên hosting, cần bật SPA fallback để những URL như `/rooms/12` cũng trả về `index.html` khi người dùng tải lại trang.
