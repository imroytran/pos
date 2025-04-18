require('dotenv').config();
const express = require('express');
const path = require('path');
const jwt = require('jsonwebtoken');

// Import services
const connectDB = require('./services/db.service');
const productService = require('./services/product.service');
const invoiceService = require('./services/invoice.service');
const userService = require('./services/user.service');

const app = express();
app.use(express.json());
app.use(express.static('public'));

// Kết nối tới MongoDB
connectDB();

// Middleware xác thực
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Không có token xác thực' });
  }
  
  try {
    const result = await userService.verifyToken(token);
    if (!result.valid) {
      return res.status(403).json({ error: 'Token không hợp lệ' });
    }
    req.user = result.user;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Token không hợp lệ' });
  }
};

// API đăng nhập
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const result = await userService.login(username, password);
    res.json({
      token: result.token,
      username: result.user.username,
      fullName: result.user.fullName
    });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

// API xác thực token
app.post('/api/auth/verify', authenticateToken, (req, res) => {
  res.json({ valid: true });
});

// API lấy tất cả sản phẩm
app.get('/api/products', authenticateToken, async (req, res) => {
  try {
    const products = await productService.getAllProducts();
    
    // Định dạng dữ liệu giống như định dạng Google Sheets để tránh phải thay đổi frontend
    const formattedProducts = products.map((product, index) => ({
      id: product.id,
      name: product.name,
      price: product.price,
      stock: product.stock,
      barcode: product.barcode,
      rowIndex: product._id // Sử dụng MongoDB ID thay cho rowIndex
    }));
    
    res.json(formattedProducts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API lấy sản phẩm theo ID hoặc mã vạch
app.get('/api/products/:idOrBarcode', authenticateToken, async (req, res) => {
  try {
    const { idOrBarcode } = req.params;
    let product = await productService.getProductById(idOrBarcode);
    
    if (!product) {
      product = await productService.getProductByBarcode(idOrBarcode);
    }
    
    if (!product) {
      return res.status(404).json({ error: 'Không tìm thấy sản phẩm' });
    }
    
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API thêm sản phẩm mới
app.post('/api/products', authenticateToken, async (req, res) => {
  try {
    const product = await productService.createProduct(req.body);
    res.status(201).json({ success: true, message: 'Product added successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// API cập nhật sản phẩm
app.put('/api/products/:id', authenticateToken, async (req, res) => {
  try {
    // Xử lý rowIndex để tương thích với frontend hiện tại
    const id = req.body.id; // Sử dụng id từ body thay vì từ params
    const product = await productService.updateProduct(id, req.body);
    
    if (!product) {
      return res.status(404).json({ error: 'Không tìm thấy sản phẩm' });
    }
    
    res.json({ success: true, message: 'Product updated successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// API xóa sản phẩm
app.delete('/api/products/:id', authenticateToken, async (req, res) => {
  try {
    // Xử lý rowIndex từ frontend
    const { id } = req.params;
    
    // Tìm sản phẩm theo id trước khi xóa
    const product = await productService.getProductById(id);
    if (!product) {
      return res.status(404).json({ error: 'Không tìm thấy sản phẩm' });
    }
    
    await productService.deleteProduct(product.id);
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API lấy tất cả hóa đơn
app.get('/api/invoices', authenticateToken, async (req, res) => {
  try {
    // Xử lý lọc theo ngày nếu có
    const { startDate, endDate } = req.query;
    
    let invoices;
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999); // Kết thúc ngày
      
      invoices = await invoiceService.getInvoicesByDateRange(start, end);
    } else {
      invoices = await invoiceService.getAllInvoices();
    }
    
    // Định dạng lại dữ liệu để tương thích với frontend
    const formattedInvoices = invoices.map(invoice => ({
      date: invoice.date.toISOString(),
      items: invoice.items,
      total: invoice.total
    }));
    
    res.json(formattedInvoices);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API lấy thống kê doanh thu
app.get('/api/invoices/stats', authenticateToken, async (req, res) => {
  try {
    const { period } = req.query; // day, week, month, year
    const stats = await invoiceService.getRevenueSummary(period);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API tạo hóa đơn mới
app.post('/api/invoices', authenticateToken, async (req, res) => {
  try {
    const invoice = await invoiceService.createInvoice(req.body, req.user?.id);
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// API reset password (development only)
app.post('/api/reset-password', async (req, res) => {
  try {
    const result = await userService.resetPassword('admin');
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API thay đổi mật khẩu
app.post('/api/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Xác thực dữ liệu đầu vào
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Vui lòng cung cấp cả mật khẩu hiện tại và mật khẩu mới' });
    }
    
    // Thực hiện thay đổi mật khẩu
    const result = await userService.changePassword(req.user.id, currentPassword, newPassword);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// API quản lý người dùng (chỉ cho admin)  
app.get('/api/users', authenticateToken, async (req, res) => {
  try {
    // Kiểm tra quyền admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Không có quyền truy cập' });
    }
    
    const users = await userService.getAllUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API tạo người dùng mới (chỉ cho admin)
app.post('/api/users', authenticateToken, async (req, res) => {
  try {
    // Kiểm tra quyền admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Không có quyền truy cập' });
    }
    
    const user = await userService.createUser(req.body);
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Serve static files
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Serve login page
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Serve change password page
app.get('/change-password', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'change-password.html'));
});

// Khởi tạo dữ liệu mẫu khi lần đầu chạy
const initializeData = async () => {
  try {
    // Kiểm tra xem đã có người dùng admin chưa
    const users = await userService.getAllUsers();
    
    if (users.length === 0) {
      console.log('Initializing default users...');
      
      // Tạo người dùng admin mặc định
      await userService.createUser({
        username: 'admin',
        password: 'admin123',
        fullName: 'Quản trị viên',
        role: 'admin'
      });
      
      // Tạo người dùng nhân viên mặc định
      await userService.createUser({
        username: 'nhanvien',
        password: 'nhanvien123',
        fullName: 'Nhân viên bán hàng',
        role: 'employee'
      });
      
      console.log('Default users created!');
    }
    
    // Kiểm tra xem đã có sản phẩm mẫu chưa
    const products = await productService.getAllProducts();
    
    if (products.length === 0) {
      console.log('Initializing sample products...');
      
      // Tạo sản phẩm mẫu
      const sampleProducts = [
        {
          id: 'd1',
          name: 'Bút bi',
          price: 5000,
          stock: 500,
          barcode: 'd1000'
        },
        {
          id: 'd2',
          name: 'Bút chì',
          price: 5000,
          stock: 200,
          barcode: 'd2000'
        },
        {
          id: 'd3',
          name: 'Thước kẻ',
          price: 10000,
          stock: 100,
          barcode: 'd3000'
        }
      ];
      
      for (const product of sampleProducts) {
        await productService.createProduct(product);
      }
      
      console.log('Sample products created!');
    }
  } catch (error) {
    console.error('Error initializing data:', error);
  }
};

const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  
  // Khởi tạo dữ liệu mẫu
  await initializeData();
});