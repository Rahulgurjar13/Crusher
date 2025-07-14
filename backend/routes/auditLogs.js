const express = require('express');
const router = express.Router();
const { auth, restrictTo } = require('../middleware/auth');
const AuditLog = require('../models/AuditLog');

router.get('/', auth, restrictTo('partner', 'admin'), async (req, res) => {
  try {
    const logs = await AuditLog.find().populate('user', 'email').sort({ date: -1 });
    res.json(logs.map(log => ({
      action: log.action,
      user: log.user.email,
      details: log.details,
      date: log.date,
    })));
  } catch (err) {
    console.error('Audit logs error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;