const User = require('../models/User');
const mongoose = require('mongoose');
require('dotenv').config();

// Function để reset mật khẩu
async function resetAdminPassword() {
    try {
        // Kết nối database
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Tìm user admin
        const admin = await User.findOne({ username: 'admin' });
        
        if (!admin) {
            console.log('Admin user not found');
            return;
        }

        // Reset mật khẩu
        admin.password = 'admin123';
        await admin.save();
        
        console.log('Admin password has been reset successfully');
        
        // Hiển thị thông tin sau khi reset
        const updatedAdmin = await User.findOne({ username: 'admin' });
        console.log('Updated admin info:', {
            username: updatedAdmin.username,
            passwordHash: updatedAdmin.password
        });

    } catch (error) {
        console.error('Error resetting password:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

// Chạy function
resetAdminPassword();