const mongoose = require('mongoose');

const ProductionSchema = new mongoose.Schema({
  material: { type: String, required: true },
  quantity: { type: Number, required: true },
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Production', ProductionSchema);