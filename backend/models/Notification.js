const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  message: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: { type: String, enum: ['rate-change', 'low-stock', 'vendor-due'], required: true },
  date: { type: Date, default: Date.now },
  enabled: { type: Boolean, default: true },
});

module.exports = mongoose.model('Notification', NotificationSchema);