/**
 * Công cụ tạo mật khẩu mã hóa cho người dùng mới
 * 
 * Sử dụng: 
 * node generate-password.js <mật_khẩu>
 * 
 * Ví dụ:
 * node generate-password.js admin123
 */

const bcrypt = require('bcryptjs');

async function generateHash(password) {
  try {
    // Tạo salt với 10 rounds
    const salt = await bcrypt.genSalt(10);
    
    // Mã hóa mật khẩu với salt
    const hash = await bcrypt.hash(password, salt);
    
    console.log('Mật khẩu gốc:', password);
    console.log('Mật khẩu đã mã hóa:', hash);
    console.log('\nSử dụng hash này trong danh sách người dùng trong file server.js');
  } catch (error) {
    console.error('Lỗi khi mã hóa mật khẩu:', error);
  }
}

// Lấy mật khẩu từ tham số dòng lệnh
const password = process.argv[2];

if (!password) {
  console.error('Vui lòng cung cấp mật khẩu: node generate-password.js <mật_khẩu>');
  process.exit(1);
}

generateHash(password);