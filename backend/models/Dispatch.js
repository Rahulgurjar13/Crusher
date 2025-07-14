const mongoose = require('mongoose');

const DispatchSchema = new mongoose.Schema({
  truck: { type: String, required: true },
  vendor: { type: String, required: true },
  material: { type: String, required: true },
  quantity: { type: Number, required: true },
  destination: { type: String, required: true },
  rate: { type: Number, required: true },
  freight: { type: Number, required: true },
  total: { type: Number, required: true },
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Dispatch', DispatchSchema);