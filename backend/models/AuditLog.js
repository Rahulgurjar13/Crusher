const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
  action: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  details: { type: String, required: true }, // Added for detailed logging
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model('AuditLog', AuditLogSchema);