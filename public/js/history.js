// Load và hiển thị hóa đơn
async function loadInvoices() {
    const tbody = document.querySelector('#invoicesTable tbody');
    tbody.innerHTML = '<tr><td colspan="4">Đang tải dữ liệu...</td></tr>';
    
    try {
        const response = await fetch('/api/invoices');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        // Tính toán thống kê doanh thu
        calculateIncomeStats(data);
        
        const tbody = document.querySelector('#invoicesTable tbody');
        if (!data || data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4">Chưa có hóa đơn nào</td></tr>';
            return;
        }

        // Hiển thị danh sách hóa đơn
        renderInvoicesList(data);
        
        // Đặt giá trị mặc định cho bộ lọc ngày là ngày hôm nay
        document.getElementById('dateFilter').valueAsDate = new Date();
        
    } catch (error) {
        console.error('Error loading invoices:', error);
        document.querySelector('#invoicesTable tbody').innerHTML = 
            `<tr><td colspan="4">Lỗi khi tải dữ liệu: ${error.message}</td></tr>`;
    }
}

// Render danh sách hóa đơn
function renderInvoicesList(data, filterDate = null) {
    const tbody = document.querySelector('#invoicesTable tbody');
    
    // Lọc theo ngày nếu được chọn
    let filteredData = data;
    if (filterDate) {
        const filterDateStr = filterDate.toISOString().split('T')[0]; // 'YYYY-MM-DD'
        filteredData = data.filter(invoice => {
            const invoiceDate = new Date(invoice.date);
            return invoiceDate.toISOString().split('T')[0] === filterDateStr;
        });
    }
    
    if (filteredData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4">Không có hóa đơn nào trong ngày đã chọn</td></tr>';
        return;
    }
    
    tbody.innerHTML = filteredData.map((invoice, index) => {
        // Make sure items is properly handled
        let items = invoice.items;
        
        // If items is a string, try to parse it
        if (typeof items === 'string') {
            try {
                items = JSON.parse(items);
            } catch (e) {
                console.error('Error parsing items:', e);
                items = [];
            }
        }
        
        // Ensure items is an array
        if (!Array.isArray(items)) {
            console.error('Items is not an array:', items);
            items = [];
        }
        
        // Create a safe version of the invoice for the onclick handler
        const safeInvoice = {
            date: invoice.date,
            items: items,
            total: invoice.total
        };
        
        // Format date
        const formattedDate = new Date(invoice.date).toLocaleString('vi-VN');
        
        return `
            <tr>
                <td>${formattedDate}</td>
                <td>${items.length} mặt hàng</td>
                <td>${Number(invoice.total).toLocaleString('vi-VN')} VNĐ</td>
                <td>
                    <button class="detail-button" onclick='showInvoiceDetails(${JSON.stringify(safeInvoice)})'>
                        Chi tiết
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// Tính toán thống kê thu nhập
function calculateIncomeStats(invoices) {
    // Chuyển đổi tất cả chuỗi ngày thành đối tượng Date
    const processedInvoices = invoices.map(invoice => ({
        ...invoice,
        dateObj: new Date(invoice.date),
        total: Number(invoice.total) || 0
    }));
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const lastWeekStart = new Date(today);
    lastWeekStart.setDate(lastWeekStart.getDate() - 6);
    
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Tính thu nhập theo các khoảng thời gian
    const todayIncome = processedInvoices
        .filter(invoice => invoice.dateObj >= today)
        .reduce((sum, invoice) => sum + invoice.total, 0);
        
    const yesterdayIncome = processedInvoices
        .filter(invoice => 
            invoice.dateObj >= yesterday && 
            invoice.dateObj < today
        )
        .reduce((sum, invoice) => sum + invoice.total, 0);
        
    const weekIncome = processedInvoices
        .filter(invoice => invoice.dateObj >= lastWeekStart)
        .reduce((sum, invoice) => sum + invoice.total, 0);
        
    const monthIncome = processedInvoices
        .filter(invoice => invoice.dateObj >= monthStart)
        .reduce((sum, invoice) => sum + invoice.total, 0);
    
    // Cập nhật giao diện
    document.querySelector('#todayIncome .stat-value').textContent = 
        todayIncome.toLocaleString('vi-VN') + ' VNĐ';
        
    document.querySelector('#yesterdayIncome .stat-value').textContent = 
        yesterdayIncome.toLocaleString('vi-VN') + ' VNĐ';
        
    document.querySelector('#weekIncome .stat-value').textContent = 
        weekIncome.toLocaleString('vi-VN') + ' VNĐ';
        
    document.querySelector('#monthIncome .stat-value').textContent = 
        monthIncome.toLocaleString('vi-VN') + ' VNĐ';
}

// Lọc hóa đơn theo ngày
function filterInvoicesByDate() {
    const dateInput = document.getElementById('dateFilter');
    if (!dateInput.value) return;
    
    const selectedDate = new Date(dateInput.value);
    
    fetch('/api/invoices')
        .then(response => response.json())
        .then(data => {
            renderInvoicesList(data, selectedDate);
        })
        .catch(error => {
            console.error('Error fetching invoices for filtering:', error);
        });
}

// Đặt lại bộ lọc ngày
function resetDateFilter() {
    document.getElementById('dateFilter').value = '';
    
    fetch('/api/invoices')
        .then(response => response.json())
        .then(data => {
            renderInvoicesList(data);
        })
        .catch(error => {
            console.error('Error fetching invoices for reset filter:', error);
        });
}

// Hiển thị chi tiết hóa đơn trong modal
function showInvoiceDetails(invoice) {
    try {
        // Ensure items is an array, regardless of how it's stored
        let items = invoice.items;
        
        // Parse items if it's a string
        if (typeof items === 'string') {
            try {
                items = JSON.parse(items);
            } catch (parseError) {
                console.error('Error parsing items:', parseError);
                items = [];
            }
        }
        
        // Ensure items is an array
        if (!Array.isArray(items)) {
            console.error('Items is not an array:', items);
            items = [];
        }
        
        // Format the date
        const invoiceDate = new Date(invoice.date).toLocaleString('vi-VN');
        
        // Generate a simple invoice ID from the date
        const invoiceId = 'INV' + new Date(invoice.date).getTime().toString().slice(-6);
        
        // Update modal content
        document.getElementById('modalInvoiceDate').textContent = invoiceDate;
        document.getElementById('modalInvoiceId').textContent = invoiceId;
        
        // Build the items table
        const itemsHtml = items.map((item, index) => {
            const quantity = item.quantity || 0;
            const price = Number(item.price) || 0;
            const subtotal = quantity * price;
            
            return `
                <tr>
                    <td>${index + 1}</td>
                    <td>${item.name || 'Không tên'}</td>
                    <td>${quantity}</td>
                    <td>${price.toLocaleString('vi-VN')} VNĐ</td>
                    <td>${subtotal.toLocaleString('vi-VN')} VNĐ</td>
                </tr>
            `;
        }).join('');
        
        document.getElementById('modalInvoiceItems').innerHTML = itemsHtml;
        document.getElementById('modalInvoiceTotal').innerHTML = 
            `Tổng cộng: <strong>${Number(invoice.total).toLocaleString('vi-VN')} VNĐ</strong>`;
        
        // Show the modal
        document.getElementById('invoiceModal').style.display = 'block';
        
    } catch (error) {
        console.error('Error displaying invoice details:', error);
        alert('Có lỗi khi hiển thị chi tiết hóa đơn. Vui lòng thử lại.');
    }
}

// In hóa đơn từ modal
function printModalInvoice() {
    const invoiceDate = document.getElementById('modalInvoiceDate').textContent;
    const invoiceId = document.getElementById('modalInvoiceId').textContent;
    const invoiceItems = document.getElementById('modalInvoiceItems').innerHTML;
    const invoiceTotal = document.getElementById('modalInvoiceTotal').textContent;
    
    const printWindow = window.open('', '', 'width=800,height=600');
    printWindow.document.write(`
        <html>
        <head>
            <title>Hóa đơn bán hàng</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                h1 { text-align: center; }
                .invoice-header { 
                    display: flex; 
                    justify-content: space-between; 
                    margin-bottom: 20px;
                    border-bottom: 1px solid #ddd;
                    padding-bottom: 10px;
                }
                table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                .total { 
                    font-size: 20px; 
                    font-weight: bold; 
                    margin-top: 20px; 
                    text-align: right;
                    padding: 10px;
                    background-color: #f8f8f8;
                }
                .shop-info {
                    text-align: center;
                    margin-bottom: 20px;
                }
                .thank-you {
                    text-align: center;
                    margin-top: 40px;
                    color: #777;
                }
            </style>
        </head>
        <body>
            <div class="shop-info">
                <h1>Văn phòng phẩm</h1>
                <p>Địa chỉ: 123 Đường ABC, Quận XYZ, TP. HCM</p>
                <p>Điện thoại: (028) 1234 5678</p>
            </div>
            
            <h2 style="text-align: center;">HÓA ĐƠN BÁN HÀNG</h2>
            
            <div class="invoice-header">
                <div>
                    <p><strong>Mã hóa đơn:</strong> ${invoiceId}</p>
                </div>
                <div>
                    <p><strong>Ngày:</strong> ${invoiceDate}</p>
                </div>
            </div>
            
            <table>
                <thead>
                    <tr>
                        <th>STT</th>
                        <th>Tên sản phẩm</th>
                        <th>Số lượng</th>
                        <th>Đơn giá</th>
                        <th>Thành tiền</th>
                    </tr>
                </thead>
                <tbody>
                    ${invoiceItems}
                </tbody>
            </table>
            
            <div class="total">
                ${invoiceTotal}
            </div>
            
            <div class="thank-you">
                <p>Cảm ơn quý khách đã mua hàng!</p>
            </div>
        </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
}

// Toggle hiển thị chỉ hôm nay
function toggleTodayOnly() {
    const showTodayOnly = document.getElementById('showTodayOnly').checked;
    const selectedDateDisplay = document.getElementById('selectedDateDisplay');
    
    if (showTodayOnly) {
        selectedDateDisplay.textContent = 'Đang hiển thị: Hôm nay';
        document.getElementById('dateFilter').valueAsDate = new Date();
        filterInvoicesByDate();
    } else {
        selectedDateDisplay.textContent = 'Đang hiển thị: Tất cả';
        resetDateFilter();
    }
}