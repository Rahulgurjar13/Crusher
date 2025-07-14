const mongoose = require('mongoose');

const VendorLedgerSchema = new mongoose.Schema({
  vendor: { type: String, required: true },
  saleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Sale' },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['Paid', 'Pending'], default: 'Pending' },
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model('VendorLedger', VendorLedgerSchema);