const mongoose = require('mongoose');

const TruckSchema = new mongoose.Schema({
  number: { type: String, required: true, unique: true },
});

module.exports = mongoose.model('Truck', TruckSchema);