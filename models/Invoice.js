const mongoose = require('mongoose');

const invoiceItemSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  }
});

const invoiceSchema = new mongoose.Schema({
  date: {
    type: Date,
    default: Date.now
  },
  items: {
    type: [invoiceItemSchema],
    required: true
  },
  total: {
    type: Number,
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

module.exports = mongoose.model('Invoice', invoiceSchema);
