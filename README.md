# Trọ An — Quản lý phòng trọ

Dự án gồm API Node.js/Express + MySQL và giao diện React/Vite. Phần giao diện được thiết kế bằng tiếng Việt, responsive và dùng các API trong backend.

## 1. Chuẩn bị

- Node.js 20.19+ (hoặc phiên bản Node.js phù hợp với Vite 8)
- MySQL 8+
- npm

## 2. Tạo database

1. Mở MySQL Workbench.
2. Import và chạy `database/mysql.sql`.
3. Kiểm tra database `QuanLyPhongTro` đã có các bảng.
4. Tạo tài khoản bằng giao diện đăng ký. Để cấp quyền admin, chạy câu SQL ở cuối `database/mysql.sql` và thay email mẫu bằng email vừa đăng ký.

## 3. Chạy backend

Mở terminal ở thư mục `backend`:

```bash
npm install
```

Sao chép `.env.example` thành `.env`, sau đó điền mật khẩu MySQL và hai secret ngẫu nhiên đủ dài:

```env
PORT=3000
NODE_ENV=development
DB_NAME=QuanLyPhongTro
DB_USER=root
DB_PORT=3306
DB_HOST=localhost
DB_PASSWORD=mat_khau_mysql_cua_ban
ACCESS_SECRET_TOKEN=chuoi_bi_mat_dai_va_ngau_nhien
REFRESH_SECRET_TOKEN=chuoi_bi_mat_khac_va_ngau_nhien
FRONTEND_URL=http://localhost:5173
```

Khởi động API:

```bash
npm run dev
```

Kiểm tra `http://localhost:3000/health`. Nếu trả về `{"status":"ok","database":"connected"}` thì backend đã kết nối MySQL.

## 4. Chạy frontend React

Mở terminal thứ hai tại `frontend`:

```bash
npm install
npm run dev
```

Mở URL Vite in ra trong terminal, mặc định `http://localhost:5173`. Nếu API không chạy ở cổng 3000, tạo file `.env` từ `.env.example` và cập nhật `VITE_API_URL`, sau đó khởi động lại Vite.

## 5. Các chức năng đã triển khai

- Tài khoản: đăng ký, đăng nhập, đăng xuất, refresh access token bằng cookie httpOnly, hồ sơ, đổi mật khẩu, quản lý người dùng, phân quyền và khóa/mở khóa tài khoản.
- Phòng và tin đăng: tìm kiếm/lọc phòng công khai, chủ trọ đăng phòng, cập nhật/ẩn phòng, quản trị viên duyệt/ẩn/từ chối tin đăng.
- Tương tác: yêu thích phòng, báo cáo tin, hộp thư hội thoại hai chiều với chủ trọ/người thuê, đánh giá phòng (yêu cầu đã thuê phòng).
- Thuê phòng: gửi yêu cầu thuê, chủ trọ duyệt/hủy/kết thúc hợp đồng.
- Tài chính nội bộ: tạo hóa đơn, tạo bản ghi giao dịch, chủ trọ xác nhận hoặc từ chối giao dịch.
- React: trang tìm kiếm phòng, chi tiết phòng, đăng nhập/đăng ký, đăng/sửa/ẩn phòng, quản lý phòng yêu thích, hộp thư, hợp đồng, hóa đơn, giao dịch, hồ sơ và khu vực admin.

## 6. API chính

| Nhóm | Endpoint tiêu biểu |
| --- | --- |
| Auth / tài khoản | `POST /users/register`, `POST /users/login`, `POST /users/logout`, `POST /users/refresh-token`, `GET /users/profile` |
| Phòng | `GET /rooms`, `GET /rooms/:id`, `GET /rooms/mine`, `POST /rooms`, `PATCH /rooms/:id`, `DELETE /rooms/:id` |
| Duyệt tin | `GET /listings`, `PATCH /listings/:id/status` (admin) |
| Yêu thích | `GET /favorites`, `POST /favorites/:tinDangId`, `DELETE /favorites/:tinDangId` |
| Báo cáo / đánh giá | `POST /reports`, `GET /reports` (admin), `GET /reviews/room/:id`, `POST /reviews/room/:id` |
| Tin nhắn | `GET /messages` (hộp thư), `GET /messages/:phongId?doiTacId=...`, `POST /messages/:phongId` |
| Hợp đồng | `GET /contracts`, `POST /contracts`, `PATCH /contracts/:id/status` |
| Hóa đơn / giao dịch | `GET /invoices`, `POST /invoices`, `GET /transactions`, `POST /transactions/invoice/:hoaDonId`, `PATCH /transactions/:id/status` |

## Lưu ý phạm vi

- Mục giao dịch chỉ ghi nhận trạng thái nội bộ, chưa kết nối ngân hàng, ví điện tử hay cổng thanh toán thật.
- Ảnh phòng hiện nhận URL công khai; chưa có chức năng upload ảnh lên máy chủ.
- CORS đang cho phép địa chỉ localhost mặc định; cần cập nhật khi triển khai production.
- Nên bật HTTPS, đặt secret mạnh, cấu hình cookie `secure` và giới hạn CORS theo domain khi triển khai thật.
