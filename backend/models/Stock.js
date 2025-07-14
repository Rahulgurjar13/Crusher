const mongoose = require('mongoose');

const StockSchema = new mongoose.Schema({
  material: { type: String, required: true, unique: true },
  quantity: { type: Number, required: true, default: 0, min: 0 },
  lastUpdated: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Stock', StockSchema);