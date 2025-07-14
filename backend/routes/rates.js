const express = require('express');
const router = express.Router();
const { auth, restrictTo } = require('../middleware/auth');
const Rate = require('../models/Rate');
const Material = require('../models/Material');
const Notification = require('../models/Notification');
const AuditLog = require('../models/AuditLog');

router.post('/', auth, restrictTo('admin'), async (req, res) => {
  const { material, rate } = req.body;
  if (!material || !rate) {
    return res.status(400).json({ message: 'Material and rate are required' });
  }
  if (rate < 0) {
    return res.status(400).json({ message: 'Rate must be non-negative' });
  }
  try {
    const materialDoc = await Material.findOne({ name: material });
    if (!materialDoc) {
      return res.status(404).json({ message: 'Material not found' });
    }
    const previousRate = materialDoc.rate;
    await Material.findOneAndUpdate({ name: material }, { rate });
    const newRate = new Rate({
      material,
      rate,
      previousRate,
      changedBy: req.user.id,
      date: Date.now(),
    });
    await newRate.save();

    await Notification.create({
      message: `Rate for ${material} changed from ₹${previousRate || 0} to ₹${rate}`,
      type: 'rate_change',
    });

    await AuditLog.create({
      action: 'Rate Changed',
      user: req.user.id,
      details: `Changed rate for ${material} from ₹${previousRate || 0} to ₹${rate}`,
    });
    res.status(201).json(newRate);
  } catch (err) {
    console.error('Rate error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const rates = await Rate.find().populate('changedBy', 'email');
    res.json(rates);
  } catch (err) {
    console.error('Rate fetch error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;