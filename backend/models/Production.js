const mongoose = require('mongoose');

const ProductionSchema = new mongoose.Schema({
  material: { type: String, required: true },
  quantity: { type: Number, required: true, min: 0 },
  date: { type: Date, default: Date.now },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Added for audit
});

module.exports = mongoose.model('Production', ProductionSchema);