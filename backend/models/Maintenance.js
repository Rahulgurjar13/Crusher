const mongoose = require('mongoose');

const MaintenanceSchema = new mongoose.Schema({
  equipment: { type: String, required: true },
  issue: { type: String, required: true },
  cost: { type: Number, required: true },
  remarks: { type: String },
  file: { type: String }, // Store file path or URL
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Maintenance', MaintenanceSchema);