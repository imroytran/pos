const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Lấy tất cả người dùng
exports.getAllUsers = async () => {
  try {
    return await User.find({}, { password: 0 }); // Không trả về mật khẩu
  } catch (error) {
    throw new Error(`Error fetching users: ${error.message}`);
  }
};

// Lấy người dùng theo ID
exports.getUserById = async (id) => {
  try {
    return await User.findById(id, { password: 0 });
  } catch (error) {
    throw new Error(`Error fetching user: ${error.message}`);
  }
};

// Tạo người dùng mới
exports.createUser = async (userData) => {
  try {
    // Kiểm tra xem username đã tồn tại chưa
    const existingUser = await User.findOne({ username: userData.username });
    if (existingUser) {
      throw new Error('Username already exists');
    }
    
    const user = new User(userData);
    const savedUser = await user.save();
    
    // Trả về thông tin người dùng nhưng không bao gồm mật khẩu
    return {
      _id: savedUser._id,
      username: savedUser.username,
      fullName: savedUser.fullName,
      role: savedUser.role,
      active: savedUser.active,
      createdAt: savedUser.createdAt
    };
  } catch (error) {
    throw new Error(`Error creating user: ${error.message}`);
  }
};

// Cập nhật người dùng
exports.updateUser = async (id, userData) => {
  try {
    // Nếu có mật khẩu mới, nó sẽ tự động được mã hóa qua middleware
    const updatedUser = await User.findByIdAndUpdate(
      id,
      userData,
      { new: true, runValidators: true }
    );
    
    // Trả về thông tin người dùng nhưng không bao gồm mật khẩu
    return {
      _id: updatedUser._id,
      username: updatedUser.username,
      fullName: updatedUser.fullName,
      role: updatedUser.role,
      active: updatedUser.active,
      createdAt: updatedUser.createdAt
    };
  } catch (error) {
    throw new Error(`Error updating user: ${error.message}`);
  }
};

// Xóa người dùng (hoặc vô hiệu hóa)
exports.deleteUser = async (id) => {
  try {
    // Thay vì xóa hoàn toàn, chỉ vô hiệu hóa tài khoản
    return await User.findByIdAndUpdate(
      id,
      { active: false },
      { new: true }
    );
  } catch (error) {
    throw new Error(`Error deleting user: ${error.message}`);
  }
};

// Reset password (development only)
exports.resetPassword = async (username) => {
  try {
    const user = await User.findOne({ username });
    if (!user) {
      throw new Error('User not found');
    }
    
    // Reset password trực tiếp trong database
    await User.findOneAndUpdate(
      { username },
      { $set: { password: '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy' } } // Mật khẩu mặc định: admin123
    );
    
    return { success: true, message: 'Password has been reset' };
  } catch (error) {
    throw new Error(`Reset password failed: ${error.message}`);
  }
};

// Thay đổi mật khẩu
exports.changePassword = async (userId, currentPassword, newPassword) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('Không tìm thấy người dùng');
    }
    
    // Xác thực mật khẩu hiện tại
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      throw new Error('Mật khẩu hiện tại không chính xác');
    }
    
    // Cập nhật mật khẩu mới
    user.password = newPassword;
    await user.save(); // Middleware pre save sẽ tự động hash mật khẩu
    
    return { success: true, message: 'Mật khẩu đã được thay đổi thành công' };
  } catch (error) {
    throw new Error(`Thay đổi mật khẩu thất bại: ${error.message}`);
  }
};

// Đăng nhập và tạo token
exports.login = async (username, password) => {
  try {
    const user = await User.findOne({ username });
    if (!user) {
      throw new Error('Invalid username or password');
    }
    
    // Kiểm tra trạng thái active
    if (!user.active) {
      throw new Error('This account has been deactivated');
    }
    
// Xác thực mật khẩu
console.log('Password received:', password);
console.log('Hashed password in database:', user.password);
    console.log('Comparing password for user:', user.username);
    console.log('Input password:', password);
    console.log('Stored hash:', user.password);
    
    const isMatch = await user.comparePassword(password);
    console.log('Password match result:', isMatch);
    
    if (!isMatch) {
      console.log('Password comparison failed');
      throw new Error('Invalid username or password');
    }
    
    // Cập nhật thời gian đăng nhập gần nhất
    user.lastLogin = new Date();
    await user.save();
    
    // Tạo JWT token
    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '12h' }
    );
    
    return {
      token,
      user: {
        id: user._id,
        username: user.username,
        fullName: user.fullName,
        role: user.role
      }
    };
  } catch (error) {
    throw new Error(`Login failed: ${error.message}`);
  }
};

// Xác thực token
exports.verifyToken = async (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    
    if (!user || !user.active) {
      return { valid: false };
    }
    
    return { valid: true, user: decoded };
  } catch (error) {
    return { valid: false, error: error.message };
  }
};
