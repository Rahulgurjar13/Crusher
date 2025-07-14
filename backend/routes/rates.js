const express = require('express');
const router = express.Router();
const { auth, restrictTo } = require('../middleware/auth');
const Rate = require('../models/Rate');
const Notification = require('../models/Notification');
const AuditLog = require('../models/AuditLog');

router.post('/', auth, restrictTo('admin'), async (req, res) => {
  const { material, rate } = req.body;
  try {
    const previousRate = await Rate.findOne({ material }).sort({ date: -1 });
    const newRate = new Rate({ material, rate, previousRate: previousRate?.rate, changedBy: req.user.id });
    await newRate.save();

    await Notification.create({
      message: `Rate for ${material} changed from ₹${previousRate?.rate || 0} to ₹${rate}`,
      type: 'rate-change',
    });

    await AuditLog.create({ action: `Changed rate for ${material} to ₹${rate}`, user: req.user.id });
    res.status(201).json(newRate);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const rates = await Rate.find();
    res.json(rates);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;