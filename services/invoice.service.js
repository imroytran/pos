const Invoice = require('../models/Invoice');
const productService = require('./product.service');

// Lấy tất cả hóa đơn
exports.getAllInvoices = async () => {
  try {
    return await Invoice.find().sort({ date: -1 });
  } catch (error) {
    throw new Error(`Error fetching invoices: ${error.message}`);
  }
};

// Lấy hóa đơn theo ID
exports.getInvoiceById = async (id) => {
  try {
    return await Invoice.findById(id);
  } catch (error) {
    throw new Error(`Error fetching invoice: ${error.message}`);
  }
};

// Lấy hóa đơn theo khoảng thời gian
exports.getInvoicesByDateRange = async (startDate, endDate) => {
  try {
    return await Invoice.find({
      date: {
        $gte: startDate,
        $lte: endDate
      }
    }).sort({ date: -1 });
  } catch (error) {
    throw new Error(`Error fetching invoices: ${error.message}`);
  }
};

// Tạo hóa đơn mới
exports.createInvoice = async (invoiceData, userId) => {
  try {
    // Thêm thông tin người tạo nếu có
    if (userId) {
      invoiceData.createdBy = userId;
    }
    
    const invoice = new Invoice(invoiceData);
    const savedInvoice = await invoice.save();
    
    // Cập nhật tồn kho sau khi tạo hóa đơn
    await updateProductStock(invoiceData.items);
    
    return savedInvoice;
  } catch (error) {
    throw new Error(`Error creating invoice: ${error.message}`);
  }
};

// Hàm hỗ trợ cập nhật tồn kho khi bán hàng
async function updateProductStock(items) {
  try {
    for (const item of items) {
      await productService.updateStock(item.id, item.quantity);
    }
  } catch (error) {
    throw new Error(`Error updating stock: ${error.message}`);
  }
}

// Lấy thống kê doanh thu
exports.getRevenueSummary = async (period = 'day') => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let startDate;
    let groupBy;
    
    switch (period) {
      case 'day':
        startDate = today;
        groupBy = { $dateToString: { format: '%H', date: '$date' } };
        break;
      case 'week':
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 7);
        groupBy = { $dateToString: { format: '%Y-%m-%d', date: '$date' } };
        break;
      case 'month':
        startDate = new Date(today);
        startDate.setDate(1);
        groupBy = { $dateToString: { format: '%Y-%m-%d', date: '$date' } };
        break;
      case 'year':
        startDate = new Date(today);
        startDate.setMonth(0, 1);
        groupBy = { $dateToString: { format: '%Y-%m', date: '$date' } };
        break;
      default:
        startDate = today;
        groupBy = { $dateToString: { format: '%H', date: '$date' } };
    }
    
    const result = await Invoice.aggregate([
      {
        $match: {
          date: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: groupBy,
          totalRevenue: { $sum: '$total' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);
    
    return result;
  } catch (error) {
    throw new Error(`Error getting revenue summary: ${error.message}`);
  }
};
