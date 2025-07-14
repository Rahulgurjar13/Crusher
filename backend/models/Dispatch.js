const mongoose = require('mongoose');

const DispatchSchema = new mongoose.Schema({
  truck: { type: String, required: true },
  vendor: { type: String, required: true },
  material: { type: String, required: true },
  quantity: { type: Number, required: true, min: 0 },
  destination: { type: String, required: true },
  rate: { type: Number, required: true, min: 0 },
  freight: { type: Number, required: true, min: 0 },
  total: { type: Number, required: true, min: 0 }, // quantity * rate + freight
  date: { type: Date, default: Date.now },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Added for audit
});

module.exports = mongoose.model('Dispatch', DispatchSchema);