const mongoose = require('mongoose');

const SaleSchema = new mongoose.Schema({
  vendor: { type: String, required: true },
  material: { type: String, required: true },
  quantity: { type: Number, required: true },
  rate: { type: Number, required: true },
  paymentMethod: { type: String, enum: ['Cash', 'UPI', 'Bank'], required: true },
  status: { type: String, enum: ['Paid', 'Credit'], default: 'Credit' },
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Sale', SaleSchema);