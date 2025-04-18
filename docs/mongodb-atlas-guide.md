# Hướng dẫn chi tiết kết nối MongoDB Atlas

Đây là hướng dẫn từng bước để thiết lập MongoDB Atlas cho ứng dụng POS của bạn.

## 1. Đăng ký và tạo Cluster

1. Truy cập [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) và đăng ký tài khoản mới
2. Sau khi đăng nhập, bạn sẽ được yêu cầu tạo một tổ chức và dự án mới
3. Chọn "Build a Database" và chọn "FREE" plan (tier M0 miễn phí)
4. Chọn nhà cung cấp đám mây (AWS, Azure hoặc GCP) và khu vực gần với người dùng của bạn
5. Đặt tên cho cluster (ví dụ: "POS-Cluster") và nhấn "Create Cluster"
6. Chờ khoảng 1-3 phút để cluster được tạo

## 2. Cấu hình bảo mật

### Tạo người dùng cơ sở dữ liệu

1. Trong trang tổng quan cluster, nhấp vào tab "Database Access"
2. Nhấp vào nút "Add New Database User"
3. Chọn Authentication Method: "Password"
4. Nhập username và password (lưu lại thông tin này cho connection string)
5. Trong phần Database User Privileges, chọn "Atlas admin" để đơn giản
6. Nhấp vào "Add User"

### Cấu hình Network Access

1. Chuyển đến tab "Network Access"
2. Nhấp vào "Add IP Address"
3. Để cho phép truy cập từ bất kỳ đâu (phù hợp cho phát triển), chọn "Allow Access from Anywhere" (sẽ thêm 0.0.0.0/0)
4. Hoặc thêm địa chỉ IP cụ thể nếu bạn muốn bảo mật hơn
5. Nhấp vào "Confirm"

## 3. Lấy connection string

1. Quay lại trang tổng quan cluster
2. Nhấp vào nút "Connect"
3. Chọn "Connect your application"
4. Chọn "Node.js" và phiên bản phù hợp
5. Sao chép connection string (sẽ có dạng: `mongodb+srv://<username>:<password>@<cluster-name>.mongodb.net/<dbname>?retryWrites=true&w=majority`)
6. Thay thế `<username>` và `<password>` bằng thông tin người dùng đã tạo
7. Thay thế `<dbname>` bằng tên cơ sở dữ liệu (ví dụ: "pos_db")

## 4. Cấu hình ứng dụng

1. Mở file `.env` trong dự án của bạn
2. Thêm hoặc cập nhật dòng sau với connection string đã lấy:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/pos_db?retryWrites=true&w=majority
   ```
3. Lưu file

## 5. Thiết lập ban đầu

Chạy script thiết lập cơ sở dữ liệu để tạo collections và dữ liệu mẫu:

```bash
npm run setup-db
```

Script này sẽ:
- Tạo các collections cần thiết
- Thêm dữ liệu người dùng mẫu
- Thêm sản phẩm mẫu
- Thêm hóa đơn mẫu

## 6. Di chuyển dữ liệu từ Google Sheets (nếu cần)

Nếu bạn đang sử dụng Google Sheets và muốn di chuyển dữ liệu hiện có sang MongoDB:

1. Đảm bảo có đầy đủ thông tin Google Sheets trong file `.env`:
   ```
   SPREADSHEET_ID=your_spreadsheet_id
   GOOGLE_SHEETS_CLIENT_EMAIL=your_client_email
   GOOGLE_SHEETS_PRIVATE_KEY="your_private_key"
   ```
2. Chạy script di chuyển:
   ```bash
   npm run migrate
   ```

## 7. Quản lý cơ sở dữ liệu

### Sử dụng MongoDB Atlas UI

MongoDB Atlas cung cấp giao diện quản lý web cho phép bạn:
1. Xem và chỉnh sửa dữ liệu trực tiếp
2. Tạo và quản lý indexes
3. Chạy truy vấn thử nghiệm
4. Giám sát hiệu suất

### Sử dụng MongoDB Compass (ứng dụng desktop)

1. Tải và cài đặt [MongoDB Compass](https://www.mongodb.com/products/compass)
2. Mở ứng dụng và dán connection string của bạn
3. Kết nối và quản lý cơ sở dữ liệu theo cách trực quan

## 8. Giám sát và bảo trì

### Giám sát

MongoDB Atlas cung cấp nhiều công cụ giám sát miễn phí:
- Sử dụng "Metrics" trong tab "Monitoring" để xem hiệu suất
- Theo dõi "Alerts" để nhận thông báo về vấn đề hiệu suất

### Sao lưu

Ngay cả trong tier miễn phí, MongoDB Atlas cũng cung cấp:
- Snapshot tự động mỗi 6 giờ
- Lưu giữ snapshot trong 7 ngày
- Khả năng khôi phục đến một thời điểm cụ thể

### Tối ưu hóa hiệu suất

- Sử dụng "Performance Advisor" để nhận đề xuất về indexes
- Kiểm tra "Metrics" thường xuyên để phát hiện vấn đề hiệu suất

## 9. Nâng cấp (nếu cần)

Khi doanh nghiệp phát triển, bạn có thể cần nâng cấp từ tier miễn phí:
1. Trong trang tổng quan cluster, nhấp vào "..." và chọn "Modify Cluster Tier"
2. Chọn tier phù hợp dựa trên nhu cầu của bạn
3. Xác nhận thay đổi

MongoDB Atlas cho phép nâng cấp mà không cần thời gian ngừng hoạt động.
