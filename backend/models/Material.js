const mongoose = require('mongoose');

const MaterialSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  rate: { type: Number, required: true, min: 0 }, // Current rate
});

module.exports = mongoose.model('Material', MaterialSchema);