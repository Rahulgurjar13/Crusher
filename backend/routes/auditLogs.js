const express = require('express');
const router = express.Router();
const { auth, restrictTo } = require('../middleware/auth');
const AuditLog = require('../models/AuditLog');

router.get('/', auth, restrictTo('partner'), async (req, res) => {
  try {
    const logs = await AuditLog.find().populate('user', 'email');
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;