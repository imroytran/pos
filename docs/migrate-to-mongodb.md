# Hướng dẫn chuyển đổi từ Google Sheets sang MongoDB Atlas

Tài liệu này cung cấp hướng dẫn tóm tắt quá trình chuyển đổi ứng dụng POS từ Google Sheets sang MongoDB Atlas.

## Lợi ích của việc chuyển đổi

MongoDB Atlas mang lại nhiều ưu điểm so với Google Sheets:

- **Hiệu suất cao hơn**: Xử lý dữ liệu nhanh hơn, đặc biệt khi số lượng sản phẩm và hóa đơn tăng lên
- **Khả năng mở rộng**: Dễ dàng mở rộng khi nhu cầu kinh doanh tăng lên
- **Không bị giới hạn API**: Không bị hạn chế số lượng request như Google Sheets API
- **Bảo mật tốt hơn**: Hệ thống quản lý người dùng và phân quyền chi tiết
- **Cấu trúc dữ liệu phong phú**: Cho phép lưu trữ dữ liệu phức tạp hơn, thuận tiện cho việc mở rộng tính năng

## Các bước chuyển đổi

### 1. Thiết lập MongoDB Atlas

Xem hướng dẫn chi tiết trong [mongodb-atlas-guide.md](mongodb-atlas-guide.md)

### 2. Kiểm tra kết nối

```bash
node scripts/test-mongodb-connection.js
```

### 3. Thiết lập cơ sở dữ liệu ban đầu

```bash
npm run setup-db
```

### 4. Di chuyển dữ liệu từ Google Sheets (nếu cần)

```bash
npm run migrate
```

### 5. Chạy ứng dụng với MongoDB

```bash
npm start
```

## Thay đổi cấu trúc dự án

Dự án đã được tổ chức lại với cấu trúc sau:

### Models

- `models/Product.js` - Mô hình sản phẩm
- `models/Invoice.js` - Mô hình hóa đơn
- `models/User.js` - Mô hình người dùng

### Services

- `services/db.service.js` - Quản lý kết nối cơ sở dữ liệu
- `services/product.service.js` - Xử lý logic sản phẩm
- `services/invoice.service.js` - Xử lý logic hóa đơn
- `services/user.service.js` - Xử lý logic người dùng

### Scripts

- `scripts/setup-mongodb.js` - Thiết lập cơ sở dữ liệu ban đầu
- `scripts/migrate-sheets-to-mongodb.js` - Di chuyển dữ liệu từ Google Sheets
- `scripts/test-mongodb-connection.js` - Kiểm tra kết nối MongoDB

## Các API Endpoint vẫn không thay đổi

Để giữ tương thích với frontend hiện tại, các API endpoint vẫn giữ nguyên:

- `GET /api/products` - Lấy danh sách sản phẩm
- `POST /api/products` - Thêm sản phẩm mới
- `PUT /api/products/:id` - Cập nhật sản phẩm
- `DELETE /api/products/:id` - Xóa sản phẩm
- `GET /api/invoices` - Lấy danh sách hóa đơn
- `POST /api/invoices` - Tạo hóa đơn mới

## Xử lý sự cố

### Không thể kết nối đến MongoDB Atlas

- Kiểm tra connection string trong file `.env`
- Đảm bảo địa chỉ IP của bạn đã được thêm vào Network Access
- Xác nhận username và password trong connection string

### Không thể di chuyển dữ liệu từ Google Sheets

- Kiểm tra thông tin Google Sheets (SPREADSHEET_ID, CLIENT_EMAIL, PRIVATE_KEY)
- Đảm bảo service account có quyền truy cập đến spreadsheet

### Lỗi khi chạy ứng dụng

- Kiểm tra logs để xác định nguyên nhân lỗi
- Đảm bảo đã cài đặt tất cả các dependency: `npm install`

## Kiểm tra và bảo trì

### Sao lưu dữ liệu

MongoDB Atlas tự động tạo snapshots của cơ sở dữ liệu. Tuy nhiên, bạn cũng nên:

- Tạo bản sao lưu thủ công định kỳ
- Xuất dữ liệu sang định dạng JSON hoặc CSV định kỳ

### Giám sát hiệu suất

MongoDB Atlas Dashboard cung cấp các công cụ giám sát hiệu suất, bao gồm:

- Thời gian phản hồi truy vấn
- Sử dụng bộ nhớ
- Số lượng kết nối

## Kết luận

Việc chuyển đổi từ Google Sheets sang MongoDB Atlas giúp ứng dụng POS của bạn có thể xử lý khối lượng dữ liệu lớn hơn, hoạt động nhanh hơn và dễ mở rộng hơn. Tuy rằng ban đầu có thể mất một chút thời gian để cấu hình, nhưng những lợi ích lâu dài sẽ rất đáng giá cho doanh nghiệp của bạn khi phát triển.