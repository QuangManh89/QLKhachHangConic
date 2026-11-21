# Hướng dẫn kết nối Google Sheets cho ConicComputer (~2 phút)

Hệ thống lưu trữ dữ liệu trực tiếp vào **2 bảng (2 Sheet)** trong file Google Sheets của riêng bạn:
- `KhachHang`: Hồ sơ khách hàng (ID, Tên khách hàng, SĐT, Ghi chú, Ngày tạo).
- `LichSuThayThe`: Lịch sử thay linh kiện theo đơn hàng (hỗ trợ nhiều linh kiện trong 1 đơn, tự tính ngày hết bảo hành).

---

## Bước 1: Tạo file Google Sheets mới
1. Truy cập [sheets.google.com](https://sheets.google.com) và tạo một bảng tính trống mới.
2. Đặt tên file, ví dụ: `ConicComputer - QuanLyKhachHang`.

## Bước 2: Cài đặt Google Apps Script
1. Trên thanh menu Google Sheets, chọn **Tiện ích mở rộng (Extensions)** → **Apps Script**.
2. Xóa toàn bộ đoạn code mẫu `function myFunction() {}` đang có.
3. Mở file `google-apps-script/Code.gs` (hoặc bấm nút **Copy mã Code.gs** trong mục **Cài đặt** của website ConicComputer) rồi dán vào trình soạn thảo Apps Script.
4. Sửa dòng đầu tiên:
   ```javascript
   const SECRET_KEY = 'CONIC_SECRET_2026';
   ```
   thành một mã bí mật của riêng bạn (ví dụ: `Conic@2026#99`).
5. Bấm **Lưu (Ctrl + S)**.

## Bước 3: Triển khai thành Ứng dụng web (Web App)
1. Bấm nút **Triển khai (Deploy)** ở góc trên bên phải → chọn **Tùy chọn triển khai mới (New deployment)**.
2. Bấm biểu tượng bánh răng bên cạnh "Chọn loại" → chọn **Ứng dụng web (Web app)**.
3. Cấu hình như sau:
   - **Mô tả:** `ConicComputer API`
   - **Thực thi với tư cách (Execute as):** `Tôi (Me)`
   - **Ai có quyền truy cập (Who has access):** `Bất kỳ ai (Anyone)` *(yên tâm vì mọi yêu cầu đều bị chặn nếu thiếu `SECRET_KEY`)*
4. Bấm **Triển khai (Deploy)** → cấp quyền cho tài khoản Google của bạn (nếu hiện cảnh báo "Ứng dụng chưa được xác minh", bấm **Nâng cao (Advanced)** → **Đi tới ... (không an toàn)** → **Cho phép**).
5. Sao chép **URL ứng dụng web** (có dạng `https://script.google.com/macros/s/.../exec`).

## Bước 4: Dán vào Website ConicComputer
1. Mở website **ConicComputer** → bấm nút **Cài đặt** ở góc trên bên phải.
2. Dán **URL ứng dụng web** và nhập đúng **Secret Key** bạn vừa đặt ở Bước 2.
3. Bấm **Kiểm tra & Khởi tạo Sheet**.
4. Hệ thống sẽ tự động tạo sẵn 2 tab `KhachHang` và `LichSuThayThe` kèm dòng tiêu đề định dạng đẹp trong Google Sheets của bạn!

---

## Lưu ý bảo mật
- Mã PIN mặc định khi mở website lần đầu là `1234`. Hãy đổi sang mã PIN/mật khẩu riêng trong mục **Cài đặt → Bảo mật**.
- Không chia sẻ `SECRET_KEY` cho người ngoài.
