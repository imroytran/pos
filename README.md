# Hệ thống POS Văn phòng phẩm

Hệ thống quản lý bán hàng đơn giản cho cửa hàng văn phòng phẩm, được xây dựng với HTML, CSS, JavaScript và Node.js, sử dụng MongoDB Atlas làm cơ sở dữ liệu.

## Tính năng

- Quản lý sản phẩm (thêm, sửa, xóa)
- Tạo hóa đơn bán hàng
- Theo dõi lịch sử hóa đơn
- Thống kê doanh thu
- Quét mã vạch để thêm sản phẩm nhanh
- Xác thực người dùng bảo mật
- In hóa đơn

## Cài đặt

### Yêu cầu

- Node.js (phiên bản 14 trở lên)
- Tài khoản MongoDB Atlas (miễn phí)

### Bước 1: Cài đặt dependencies

```bash
npm install
```

### Bước 2: Cấu hình MongoDB Atlas

1. Đăng ký tài khoản tại [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Tạo một cluster (có thể sử dụng tier miễn phí)
3. Tạo database user với quyền đọc/ghi
4. Thêm địa chỉ IP của bạn vào whitelist (hoặc 0.0.0.0/0 cho phép tất cả)
5. Lấy connection string từ "Connect" > "Connect your application"

### Bước 3: Cấu hình biến môi trường

Tạo file `.env` với nội dung sau:

```
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/pos_system?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_key_here
```

Thay thế `<username>`, `<password>`, và `<cluster-url>` bằng thông tin của bạn từ MongoDB Atlas.

### Bước 4: Di chuyển dữ liệu (nếu từng sử dụng Google Sheets)

Nếu bạn đang chuyển từ hệ thống Google Sheets sang MongoDB:

1. Đảm bảo thông tin Google Sheets vẫn còn trong file `.env`:
   ```
   SPREADSHEET_ID=your_spreadsheet_id_here
   GOOGLE_SHEETS_CLIENT_EMAIL=your_client_email_here
   GOOGLE_SHEETS_PRIVATE_KEY="your_private_key_here"
   ```

2. Chạy script di chuyển dữ liệu:
   ```bash
   node scripts/migrate-sheets-to-mongodb.js
   ```

### Bước 5: Chạy ứng dụng

```bash
npm start
```

Ứng dụng sẽ chạy tại http://localhost:3000

## Triển khai

### Triển khai lên dịch vụ hosting (ví dụ: Heroku)

1. Đăng ký tài khoản Heroku
2. Cài đặt Heroku CLI
3. Đăng nhập vào Heroku CLI:
   ```bash
   heroku login
   ```
4. Tạo ứng dụng Heroku:
   ```bash
   heroku create your-pos-app-name
   ```
5. Cấu hình biến môi trường trên Heroku:
   ```bash
   heroku config:set MONGODB_URI=your_mongodb_connection_string
   heroku config:set JWT_SECRET=your_jwt_secret_key_here
   ```
6. Triển khai lên Heroku:
   ```bash
   git push heroku main
   ```

### Triển khai lên Render

1. Đăng ký tài khoản [Render](https://render.com/)
2. Tạo một Web Service mới và kết nối với GitHub repository
3. Cấu hình:
   - Build Command: `npm install`
   - Start Command: `node server.js`
   - Thêm các biến môi trường: `MONGODB_URI` và `JWT_SECRET`

## Đăng nhập

Hệ thống sẽ tự động tạo 2 tài khoản mặc định khi khởi chạy lần đầu:

- Admin: 
  - Tên đăng nhập: admin
  - Mật khẩu: admin123
- Nhân viên:
  - Tên đăng nhập: nhanvien
  - Mật khẩu: nhanvien123

## Tạo tài khoản mới

Để tạo người dùng mới, bạn có thể sử dụng API:

```
POST /api/users
{
  "username": "tên_đăng_nhập",
  "password": "mật_khẩu",
  "fullName": "Tên đầy đủ",
  "role": "admin" hoặc "employee"
}
```

Chỉ người dùng có quyền `admin` mới có thể tạo người dùng mới.

## Bảo trì

### Sao lưu dữ liệu

MongoDB Atlas tự động sao lưu dữ liệu miễn phí trong 7 ngày. Đối với các bản sao lưu lâu hơn, bạn có thể:

1. Sử dụng MongoDB Compass để xuất dữ liệu
2. Nâng cấp lên Atlas paid tier để có bản sao lưu tùy chỉnh
3. Tạo script sao lưu tự động riêng

### Giám sát hiệu suất

MongoDB Atlas cung cấp bảng điều khiển giám sát, nơi bạn có thể:
- Theo dõi hiệu suất truy vấn
- Giám sát việc sử dụng tài nguyên
- Cấu hình cảnh báo

### Cập nhật ứng dụng

```bash
git pull
npm install
npm start
```

## Ưu điểm của MongoDB so với Google Sheets

1. **Hiệu suất cao hơn**: MongoDB xử lý dữ liệu nhanh hơn nhiều, đặc biệt là với bộ dữ liệu lớn
2. **Khả năng mở rộng**: Xử lý được khối lượng dữ liệu lớn và nhiều người dùng đồng thời
3. **Cấu trúc dữ liệu phong phú**: Lưu trữ đối tượng phức tạp và quan hệ dữ liệu tốt hơn
4. **Truy vấn mạnh mẽ**: Hỗ trợ truy vấn phức tạp, tìm kiếm văn bản, lọc và tổng hợp
5. **Bảo mật tốt hơn**: Quản lý người dùng chi tiết, xác thực và mã hóa
6. **Không bị giới hạn API**: Google Sheets có giới hạn số lượng yêu cầu API mà MongoDB không có

## Giấy phép

Phát triển bởi [Tên của bạn]