// Fetch products from server
async function fetchProducts() {
    try {
        const response = await fetch('/api/products');
        products = await response.json();
        displayProducts();
    } catch (error) {
        console.error('Error fetching products:', error);
        showMessage('error', 'Lỗi khi tải danh sách sản phẩm');
    }
}

// Display products in table
function displayProducts() {
    const tbody = document.querySelector('#productsTable tbody');
    tbody.innerHTML = products.map(product => `
        <tr>
            <td>${product.id}</td>
            <td>${product.name}</td>
            <td>${product.price.toLocaleString('vi-VN')} VNĐ</td>
            <td class="${product.stock <= 10 ? 'low-stock' : ''}">${product.stock}</td>
            <td>
                <button onclick="editProduct(${product.rowIndex})">Sửa</button>
                <button onclick="deleteProduct(${product.rowIndex})">Xóa</button>
                <button onclick="addToCart('${product.id}')" class="primary-button">Thêm vào đơn</button>
            </td>
        </tr>
    `).join('');
}

// Save product (create or update)
async function saveProduct() {
    const idBarcode = document.getElementById('productIdBarcode').value;
    const product = {
        id: idBarcode, // Sử dụng cùng giá trị cho cả id và barcode
        name: document.getElementById('productName').value,
        price: parseFloat(document.getElementById('productPrice').value),
        stock: parseInt(document.getElementById('productStock').value),
        barcode: idBarcode
    };

    if (!product.id || !product.name || !product.price || isNaN(product.price) || !product.stock || isNaN(product.stock)) {
        showMessage('error', 'Vui lòng điền đầy đủ thông tin');
        return;
    }

    try {
        let response;
        if (editingProduct) {
            // Update existing product
            response = await fetch(`/api/products/${editingProduct.rowIndex}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(product)
            });
        } else {
            // Create new product
            response = await fetch('/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(product)
            });
        }

        if (response.ok) {
            showMessage('success', 'Đã lưu sản phẩm thành công');
            resetForm();
            await fetchProducts();
        } else {
            showMessage('error', 'Lỗi khi lưu sản phẩm');
        }
    } catch (error) {
        console.error('Error saving product:', error);
        showMessage('error', 'Lỗi khi lưu sản phẩm');
    }
}

// Edit product
function editProduct(rowIndex) {
    editingProduct = products.find(p => p.rowIndex === rowIndex);
    if (editingProduct) {
        document.getElementById('productIdBarcode').value = editingProduct.id;
        document.getElementById('productName').value = editingProduct.name;
        document.getElementById('productPrice').value = editingProduct.price;
        document.getElementById('productStock').value = editingProduct.stock;
        document.getElementById('formTitle').textContent = 'Sửa sản phẩm';
        
        // Chuyển đến tab sản phẩm và cuộn lên form
        showTab('products');
        document.getElementById('productForm').scrollIntoView({ behavior: 'smooth' });
    }
}

// Delete product
async function deleteProduct(rowIndex) {
    if (!confirm('Bạn có chắc muốn xóa sản phẩm này?')) return;

    try {
        const response = await fetch(`/api/products/${rowIndex}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            showMessage('success', 'Đã xóa sản phẩm');
            await fetchProducts();
        } else {
            showMessage('error', 'Lỗi khi xóa sản phẩm');
        }
    } catch (error) {
        console.error('Error deleting product:', error);
        showMessage('error', 'Lỗi khi xóa sản phẩm');
    }
}

// Reset form
function resetForm() {
    document.getElementById('productIdBarcode').value = '';
    document.getElementById('productName').value = '';
    document.getElementById('productPrice').value = '';
    document.getElementById('productStock').value = '';
    document.getElementById('formTitle').textContent = 'Thêm sản phẩm mới';
    editingProduct = null;
}

// Lọc sản phẩm (áp dụng tất cả các bộ lọc)
function applyFilters() {
    const searchText = document.getElementById('searchInput').value.toLowerCase();
    const showLowStock = document.getElementById('filterLowStock').checked;
    const lowStockThreshold = 10; // Ngưỡng để coi là tồn kho thấp
    
    const tbody = document.querySelector('#productsTable tbody');
    
    const filteredProducts = products.filter(product => {
        // Lọc theo tên/mã
        const matchesSearch = product.name.toLowerCase().includes(searchText) || 
                             product.id.toLowerCase().includes(searchText);
        
        // Lọc theo tồn kho thấp
        const matchesLowStock = !showLowStock || (showLowStock && product.stock <= lowStockThreshold);
        
        return matchesSearch && matchesLowStock;
    });
    
    tbody.innerHTML = filteredProducts.map(product => `
        <tr>
            <td>${product.id}</td>
            <td>${product.name}</td>
            <td>${product.price.toLocaleString('vi-VN')} VNĐ</td>
            <td class="${product.stock <= lowStockThreshold ? 'low-stock' : ''}">${product.stock}</td>
            <td>
                <button onclick="editProduct(${product.rowIndex})">Sửa</button>
                <button onclick="deleteProduct(${product.rowIndex})">Xóa</button>
                <button onclick="addToCart('${product.id}')" class="primary-button">Thêm vào đơn</button>
            </td>
        </tr>
    `).join('');
}