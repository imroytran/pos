// Kiểm tra xác thực người dùng
function checkAuth() {
    const token = localStorage.getItem('token');
    
    if (!token) {
        // Nếu không có token, chuyển hướng đến trang đăng nhập
        window.location.href = '/login.html';
        return;
    }
    
    // Xác thực token với server
    fetch('/api/auth/verify', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Token không hợp lệ');
        }
        return response.json();
    })
    .then(data => {
        if (data.valid) {
            // Token hợp lệ, hiển thị thông tin người dùng
            displayUserInfo();
        } else {
            // Token không hợp lệ, xóa khỏi localStorage và chuyển đến trang đăng nhập
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login.html';
        }
    })
    .catch(error => {
        console.error('Error verifying token:', error);
        // Xử lý lỗi, chuyển đến trang đăng nhập
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login.html';
    });
}

// Thêm header Authorization vào tất cả các request API
function addAuthHeader(url, options = {}) {
    const token = localStorage.getItem('token');
    
    if (!token) {
        return options;
    }
    
    // Đảm bảo có headers object
    if (!options.headers) {
        options.headers = {};
    }
    
    // Thêm Authorization header
    options.headers.Authorization = `Bearer ${token}`;
    
    return options;
}

// Ghi đè fetch để tự động thêm token vào mọi request
const originalFetch = window.fetch;
window.fetch = function(url, options = {}) {
    // Chỉ thêm token cho các request API
    if (url.includes('/api/')) {
        options = addAuthHeader(url, options);
    }
    return originalFetch(url, options);
};