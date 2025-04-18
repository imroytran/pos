const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  fullName: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'employee'],
    default: 'employee'
  },
  active: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date
  }
});

// Mã hóa mật khẩu trước khi lưu
  userSchema.pre('save', async function(next) {
    // Chỉ hash mật khẩu nếu nó được chỉnh sửa hoặc là mới
    if (!this.isModified('password')) return next();
    
    console.log('Hashing new password...');
    console.log('Raw password:', this.password);
    
    try {
      const salt = await bcrypt.genSalt(10);
      console.log('Generated salt:', salt);
      
      this.password = await bcrypt.hash(this.password, salt);
      console.log('Hashed password:', this.password);
      
      next();
    } catch (err) {
      console.error('Error hashing password:', err);
      next(err);
    }
  });

// Phương thức xác thực mật khẩu
  userSchema.methods.comparePassword = async function(candidatePassword) {
    console.log('Comparing passwords...');
    console.log('Candidate password:', candidatePassword);
    console.log('Stored hash:', this.password);
    
    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    console.log('Comparison result:', isMatch);
    
    return isMatch;
  };

module.exports = mongoose.model('User', userSchema);
