const Product = require('../models/Product');

// Lấy tất cả sản phẩm
exports.getAllProducts = async () => {
  try {
    return await Product.find().sort({ name: 1 });
  } catch (error) {
    throw new Error(`Error fetching products: ${error.message}`);
  }
};

// Tìm sản phẩm theo ID
exports.getProductById = async (id) => {
  try {
    return await Product.findOne({ id });
  } catch (error) {
    throw new Error(`Error fetching product: ${error.message}`);
  }
};

// Tìm sản phẩm theo mã vạch
exports.getProductByBarcode = async (barcode) => {
  try {
    return await Product.findOne({ barcode });
  } catch (error) {
    throw new Error(`Error fetching product: ${error.message}`);
  }
};

// Tạo sản phẩm mới
exports.createProduct = async (productData) => {
  try {
    // Kiểm tra xem sản phẩm đã tồn tại chưa
    const existingProduct = await Product.findOne({ id: productData.id });
    if (existingProduct) {
      throw new Error('Product ID already exists');
    }
    
    const product = new Product(productData);
    return await product.save();
  } catch (error) {
    throw new Error(`Error creating product: ${error.message}`);
  }
};

// Cập nhật sản phẩm
exports.updateProduct = async (id, productData) => {
  try {
    return await Product.findOneAndUpdate(
      { id }, 
      { ...productData, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
  } catch (error) {
    throw new Error(`Error updating product: ${error.message}`);
  }
};

// Xóa sản phẩm
exports.deleteProduct = async (id) => {
  try {
    return await Product.findOneAndDelete({ id });
  } catch (error) {
    throw new Error(`Error deleting product: ${error.message}`);
  }
};

// Cập nhật tồn kho
exports.updateStock = async (id, quantity) => {
  try {
    const product = await Product.findOne({ id });
    if (!product) {
      throw new Error('Product not found');
    }
    
    // Đảm bảo tồn kho không âm
    const newStock = Math.max(0, product.stock - quantity);
    
    return await Product.findOneAndUpdate(
      { id },
      { stock: newStock, updatedAt: new Date() },
      { new: true }
    );
  } catch (error) {
    throw new Error(`Error updating stock: ${error.message}`);
  }
};
