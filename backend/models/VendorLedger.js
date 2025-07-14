const mongoose = require('mongoose');

const VendorLedgerSchema = new mongoose.Schema({
  vendor: { type: String, required: true },
  saleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Sale', required: true },
  amount: { type: Number, required: true, min: 0 },
  status: { type: String, enum: ['Paid', 'Credit'], default: 'Credit' }, // Aligned with Sale status
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model('VendorLedger', VendorLedgerSchema);