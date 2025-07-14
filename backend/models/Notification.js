const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  message: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Optional, for user-specific notifications
  type: { type: String, enum: ['rate_change', 'low_stock', 'vendor_due', 'daily_summary'], required: true },
  date: { type: Date, default: Date.now },
  enabled: { type: Boolean, default: true },
});

module.exports = mongoose.model('Notification', NotificationSchema);