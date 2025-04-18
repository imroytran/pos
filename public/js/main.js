// Global variables
let products = [];
let cart = [];
let editingProduct = null;

// Chuyển đổi tab
function showTab(tabId) {
    // Ẩn tất cả tab
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.tab-button').forEach(button => {
        button.classList.remove('active');
    });

    // Hiện tab được chọn
    document.getElementById(tabId).classList.add('active');
    document.querySelector(`[onclick="showTab('${tabId}')"]`).classList.add('active');

    // Load dữ liệu nếu cần
    if (tabId === 'history') {
        loadInvoices();
    }
}

// Hiển thị thông báo
function showMessage(type, text) {
    const messageDiv = document.getElementById('formMessage');
    messageDiv.className = type;
    messageDiv.textContent = text;
    setTimeout(() => {
        messageDiv.textContent = '';
        messageDiv.className = '';
    }, 3000);
}

// Đóng modal
function closeModal() {
    document.getElementById('invoiceModal').style.display = 'none';
}

// Initial load
document.addEventListener('DOMContentLoaded', function() {
    fetchProducts();

    // Handle barcode input
    document.getElementById('barcodeInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            const barcode = this.value;
            const product = products.find(p => p.barcode === barcode);
            if (product) {
                addToCart(product.id);
                this.value = '';
            } else {
                alert('Không tìm thấy sản phẩm!');
            }
        }
    });

    // Handle search input
    document.getElementById('searchInput').addEventListener('input', function(e) {
        applyFilters();
    });
    
    // Tìm kiếm nhanh sản phẩm trong tab bán hàng
    document.getElementById('posSearchInput').addEventListener('input', function(e) {
        const searchText = e.target.value.toLowerCase();
        const resultsDiv = document.getElementById('searchResults');
        
        if (searchText.length < 2) {
            resultsDiv.style.display = 'none';
            return;
        }
        
        const matchingProducts = products.filter(product => 
            product.name.toLowerCase().includes(searchText) ||
            product.id.toLowerCase().includes(searchText)
        ).slice(0, 5); // Chỉ hiển thị tối đa 5 kết quả
        
        if (matchingProducts.length === 0) {
            resultsDiv.innerHTML = '<div class="search-result-item">Không tìm thấy sản phẩm</div>';
        } else {
            resultsDiv.innerHTML = matchingProducts.map(product => 
                `<div class="search-result-item" onclick="addToCart('${product.id}')">
                    ${product.name} - ${product.price.toLocaleString('vi-VN')} VNĐ
                </div>`
            ).join('');
        }
        
        resultsDiv.style.display = 'block';
    });
    
    // Ẩn kết quả tìm kiếm khi click ra ngoài
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.quick-search')) {
            document.getElementById('searchResults').style.display = 'none';
        }
    });
});