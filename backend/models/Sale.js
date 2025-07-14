const mongoose = require('mongoose');

const SaleSchema = new mongoose.Schema({
  vendor: { type: String, required: true },
  material: { type: String, required: true },
  quantity: { type: Number, required: true, min: 0 },
  rate: { type: Number, required: true, min: 0 },
  total: { type: Number, required: true, min: 0 }, // Added for frontend
  paymentMethod: { type: String, enum: ['Cash', 'UPI', 'Bank'], required: true },
  status: { type: String, enum: ['Paid', 'Credit'], default: 'Credit' },
  date: { type: Date, default: Date.now },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Added for audit
});

module.exports = mongoose.model('Sale', SaleSchema);