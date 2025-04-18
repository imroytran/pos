// Add product to cart
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const cartItem = cart.find(item => item.id === productId);
    if (cartItem) {
        cartItem.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    updateInvoiceTable();
}

// Update invoice table
function updateInvoiceTable() {
    const tbody = document.querySelector('#invoiceTable tbody');
    tbody.innerHTML = cart.map(item => `
        <tr>
            <td>${item.name}</td>
            <td>${item.quantity}</td>
            <td>${item.price.toLocaleString('vi-VN')} VNĐ</td>
            <td>${(item.price * item.quantity).toLocaleString('vi-VN')} VNĐ</td>
            <td><button onclick="removeFromCart('${item.id}')">Xóa</button></td>
        </tr>
    `).join('');

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    document.getElementById('total').textContent = `Tổng cộng: ${total.toLocaleString('vi-VN')} VNĐ`;
}

// Remove item from cart
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateInvoiceTable();
}

// Save invoice
async function saveInvoice() {
    if (cart.length === 0) {
        alert('Giỏ hàng trống!');
        return;
    }

    try {
        const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
        await fetch('/api/invoices', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                items: cart,
                total: total
            })
        });

        alert('Đã lưu hóa đơn!');
        cart = [];
        updateInvoiceTable();
    } catch (error) {
        console.error('Error saving invoice:', error);
        alert('Lỗi khi lưu hóa đơn!');
    }
}

// Clear invoice (cart)
function clearInvoice() {
    if (confirm('Bạn có chắc muốn hủy hóa đơn hiện tại?')) {
        cart = [];
        updateInvoiceTable();
    }
}

// Print invoice
function printInvoice() {
    if (cart.length === 0) {
        alert('Giỏ hàng trống!');
        return;
    }

    const printWindow = window.open('', '', 'width=800,height=600');
    printWindow.document.write(`
        <html>
        <head>
            <title>Hóa đơn bán hàng</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                .total { font-size: 20px; font-weight: bold; margin-top: 20px; }
            </style>
        </head>
        <body>
            <h1>Hóa đơn bán hàng</h1>
            <p>Ngày: ${new Date().toLocaleDateString('vi-VN')}</p>
            <table>
                <thead>
                    <tr>
                        <th>Tên SP</th>
                        <th>Số lượng</th>
                        <th>Đơn giá</th>
                        <th>Thành tiền</th>
                    </tr>
                </thead>
                <tbody>
                    ${cart.map(item => `
                        <tr>
                            <td>${item.name}</td>
                            <td>${item.quantity}</td>
                            <td>${item.price.toLocaleString('vi-VN')} VNĐ</td>
                            <td>${(item.price * item.quantity).toLocaleString('vi-VN')} VNĐ</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            <div class="total">
                Tổng cộng: ${cart.reduce((sum, item) => sum + item.price * item.quantity, 0).toLocaleString('vi-VN')} VNĐ
            </div>
        </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
}