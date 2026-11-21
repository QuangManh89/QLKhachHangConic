# Báo cáo Công việc: Website Quản lý Khách hàng & Bảo hành ConicComputer

**Thư mục dự án:** `d:\1.Project\QLKhachHangConic`  
**Công nghệ sử dụng:** React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons, Vitest, Google Apps Script (Google Sheets API).

---

## 1. Tóm tắt mục tiêu đã hoàn thành
Xây dựng hoàn chỉnh website quản lý khách hàng và lịch sử thay thế linh kiện / bảo hành cho cửa hàng **ConicComputer**, đáp ứng đầy đủ các yêu cầu:
- Quản lý thông tin: **Tên khách hàng**, **Số điện thoại**, **Mặt hàng / linh kiện thay thế**, **Số tiền**, **Ngày thay**, **Thời hạn bảo hành (tháng)**, tự động tính **Ngày hết hạn bảo hành** và **Tên máy / Ghi chú**.
- Lưu trữ trên **Google Sheets** (2 bảng riêng biệt `KhachHang` và `LichSuThayThe`) thông qua **Google Apps Script**, hỗ trợ **1 đơn hàng nhiều linh kiện**.
- Có **chế độ Demo cục bộ** (`localStorage`) kèm dữ liệu mẫu để sử dụng và kiểm thử ngay lập tức.
- Bảo vệ truy cập bằng **Màn hình khóa PIN/Mật khẩu** và **Secret Key** khi gọi API Google Sheets.
- Tích hợp **Logo chính thức của ConicComputer** vào favicon, giao diện chính, màn hình khóa và phiếu in bảo hành.

---

## 2. Chi tiết các hạng mục đã thực hiện

### A. Kết nối Google Sheets & Hướng dẫn triển khai
- [google-apps-script/Code.gs](file:///d:/1.Project/QLKhachHangConic/google-apps-script/Code.gs):
  - API nhận yêu cầu `POST` kèm kiểm tra `SECRET_KEY`.
  - Tự động khởi tạo 2 bảng `KhachHang` và `LichSuThayThe` với dòng tiêu đề định dạng sẵn.
  - Định dạng cột số điện thoại dạng text (giữ nguyên số `0` đầu) và dùng `LockService` chống xung đột khi ghi dữ liệu.
  - Hỗ trợ đầy đủ thao tác: kiểm tra kết nối (`ping`), khởi tạo sheet (`initSheets`), tải dữ liệu (`getAll`), tạo/sửa/xóa đơn hàng và hồ sơ khách hàng.
- [HUONG_DAN_GOOGLE_SHEETS.md](file:///d:/1.Project/QLKhachHangConic/HUONG_DAN_GOOGLE_SHEETS.md): Tài liệu hướng dẫn 4 bước cài đặt trong ~2 phút.

### B. Tầng dữ liệu, nghiệp vụ & bảo mật
- [src/types/index.ts](file:///d:/1.Project/QLKhachHangConic/src/types/index.ts): Định nghĩa kiểu dữ liệu `Customer`, `RepairItem`, `RepairOrder`, `WarrantyStatus`, `AppSettings`, `ShopInfo`.
- [src/utils/warranty.ts](file:///d:/1.Project/QLKhachHangConic/src/utils/warranty.ts):
  - Tính ngày hết bảo hành chính xác theo tháng (xử lý ngày cuối tháng, VD: `31/01 + 1 tháng = 28/02`).
  - Phân loại trạng thái bảo hành: **Còn hạn**, **Sắp hết hạn (≤ 30 ngày)**, **Hết hạn**, **Không bảo hành**.
  - Gom nhóm nhiều linh kiện theo `maDonHang`, định dạng tiền tệ VNĐ, định dạng ngày `DD/MM/YYYY`, chuẩn hóa tìm kiếm tiếng Việt không dấu.
- [src/services/storageService.ts](file:///d:/1.Project/QLKhachHangConic/src/services/storageService.ts): Quản lý lưu trữ 2 chế độ (Google Sheets + Local Demo/Cache).
- [src/services/authService.ts](file:///d:/1.Project/QLKhachHangConic/src/services/authService.ts): Xác thực mã PIN/mật khẩu lưu dạng băm SHA-256 (mặc định `1234`, có thể đổi trong Cài đặt).

### C. Giao diện người dùng & Tính năng chính
- **Màn hình khóa PIN** ([src/components/LockScreen.tsx](file:///d:/1.Project/QLKhachHangConic/src/components/LockScreen.tsx)): Khóa/mở khóa nhanh, hiển thị logo ConicComputer, hỗ trợ ẩn/hiện mật khẩu.
- **Bố cục & Điều hướng** ([src/components/Layout.tsx](file:///d:/1.Project/QLKhachHangConic/src/components/Layout.tsx)): Giao diện Light Mode tối giản (tông Tech Blue / Slate), nút chuyển Dark Mode, chỉ báo trạng thái kết nối Google Sheets / Demo, nút đồng bộ và khóa nhanh.
- **Quản lý đơn thay thế & Tra cứu bảo hành** ([src/components/OrderListView.tsx](file:///d:/1.Project/QLKhachHangConic/src/components/OrderListView.tsx), [src/components/WarrantyBadge.tsx](file:///d:/1.Project/QLKhachHangConic/src/components/WarrantyBadge.tsx)):
  - 4 thẻ thống kê nhanh (Tổng đơn, Đang còn bảo hành, Sắp hết hạn ≤ 30 ngày, Tổng doanh thu).
  - Tìm kiếm không dấu theo SĐT, tên khách, mặt hàng thay, tên máy, mã đơn; lọc theo trạng thái bảo hành.
  - Hiển thị từng đơn hàng gom nhóm nhiều linh kiện kèm nút In phiếu, Sửa, Xóa.
- **Tạo / Chỉnh sửa đơn hàng nhiều linh kiện** ([src/components/OrderFormModal.tsx](file:///d:/1.Project/QLKhachHangConic/src/components/OrderFormModal.tsx)):
  - Gợi ý tự động khách hàng cũ khi nhập SĐT/Tên hoặc tự động tạo khách mới.
  - Thêm/xóa linh hoạt nhiều linh kiện trong cùng 1 đơn, chọn nhanh thời hạn bảo hành (`0 / 1 / 3 / 6 / 12 / 24 / 36 tháng`), xem trước ngày hết hạn và tổng tiền.
- **Danh bạ & Hồ sơ chi tiết khách hàng** ([src/components/CustomerListView.tsx](file:///d:/1.Project/QLKhachHangConic/src/components/CustomerListView.tsx), [src/components/CustomerDetailDrawer.tsx](file:///d:/1.Project/QLKhachHangConic/src/components/CustomerDetailDrawer.tsx)):
  - Xem danh sách khách hàng kèm số lần sửa, số linh kiện còn bảo hành và tổng chi tiêu.
  - Mở drawer chi tiết để sửa thông tin liên hệ, xem toàn bộ lịch sử thay thế và tạo đơn mới nhanh.
- **In phiếu bảo hành / hóa đơn** ([src/components/WarrantyPrintModal.tsx](file:///d:/1.Project/QLKhachHangConic/src/components/WarrantyPrintModal.tsx), [src/index.css](file:///d:/1.Project/QLKhachHangConic/src/index.css)):
  - Mẫu phiếu in tối ưu `@media print` (khổ A5/A4), hiển thị logo & thông tin ConicComputer, danh sách linh kiện, hạn bảo hành, tổng tiền, quy định bảo hành và khu vực ký xác nhận.
- **Cài đặt hệ thống** ([src/components/SettingsModal.tsx](file:///d:/1.Project/QLKhachHangConic/src/components/SettingsModal.tsx)):
  - Cấu hình Web App URL & Secret Key, nút **Kiểm tra & Khởi tạo Sheet**, nút **Copy mã Code.gs**, xóa dữ liệu mẫu, chỉnh sửa thông tin phiếu in và đổi mã PIN.

### D. Tích hợp Logo thương hiệu ConicComputer
- Lưu logo tại [public/logo.png](file:///d:/1.Project/QLKhachHangConic/public/logo.png).
- Gắn làm **Favicon** trình duyệt tại [index.html](file:///d:/1.Project/QLKhachHangConic/index.html).
- Hiển thị đồng bộ tại Thanh tiêu đề (`Layout.tsx`), Màn hình khóa (`LockScreen.tsx`) và Phiếu bảo hành in (`WarrantyPrintModal.tsx`).

---

## 3. Kết quả kiểm thử & xác minh

| Hạng mục kiểm thử | Lệnh / Công cụ | Kết quả |
|---|---|---|
| Kiểm thử đơn vị (Unit Test) | `npm test` ([warranty.test.ts](file:///d:/1.Project/QLKhachHangConic/src/utils/warranty.test.ts)) | **PASS (10/10)** — tính ngày hết hạn, xử lý ngày cuối tháng, phân loại trạng thái, tìm kiếm không dấu, gom nhóm đơn hàng. |
| Kiểm tra TypeScript & Build Production | `npm run build` | **PASS** — `tsc -b` và `vite build` thành công không có lỗi. |
| Kiểm thử giao diện thực tế (E2E UI) | Trình duyệt tại `http://localhost:5173` | **PASS (8/8)** — khóa/mở PIN, tạo đơn 2 linh kiện (`2.000.000 ₫`), tìm kiếm không dấu, lọc trạng thái bảo hành, xem hồ sơ khách hàng, xem trước phiếu in, mở cài đặt Google Sheets, 0 lỗi console/network. |

---

## 4. Hướng dẫn chạy nhanh
```bash
# Cài đặt thư viện (nếu chưa cài)
npm install

# Chạy môi trường phát triển
npm run dev

# Chạy kiểm thử tự động
npm test

# Build bản production (thư mục dist/)
npm run build
```
- **Mã PIN mặc định lần đầu:** `1234` (nên đổi lại trong mục **Cài đặt → Bảo mật PIN**).
- **Kết nối Google Sheets:** xem chi tiết trong file [HUONG_DAN_GOOGLE_SHEETS.md](file:///d:/1.Project/QLKhachHangConic/HUONG_DAN_GOOGLE_SHEETS.md).
