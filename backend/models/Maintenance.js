const mongoose = require('mongoose');

const MaintenanceSchema = new mongoose.Schema({
  equipment: { type: String, required: true },
  issue: { type: String, required: true },
  cost: { type: Number, required: true, min: 0 },
  remarks: { type: String },
  fileUrl: { type: String }, // Changed to fileUrl for frontend
  date: { type: Date, default: Date.now },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Added for audit
});

module.exports = mongoose.model('Maintenance', MaintenanceSchema);