const mongoose = require('mongoose');

const RateSchema = new mongoose.Schema({
  material: { type: String, required: true },
  rate: { type: Number, required: true, min: 0 },
  previousRate: { type: Number, min: 0 },
  changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Rate', RateSchema);