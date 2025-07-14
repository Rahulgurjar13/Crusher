const express = require('express');
const router = express.Router();
const { auth, restrictTo } = require('../middleware/auth');
const Production = require('../models/Production');
const Stock = require('../models/Stock');
const AuditLog = require('../models/AuditLog');
const Material = require('../models/Material');

router.post('/', auth, restrictTo('operator', 'admin'), async (req, res) => {
  if (req.is('multipart/form-data')) {
    return res.status(400).json({ message: 'Invalid Content-Type: application/json expected' });
  }
  const { material, quantity, date } = req.body;
  if (!material || !quantity) {
    return res.status(400).json({ message: 'Material and quantity are required' });
  }
  if (isNaN(quantity) || quantity < 0) {
    return res.status(400).json({ message: 'Quantity must be a non-negative number' });
  }
  try {
    const materialDoc = await Material.findOne({ name: material });
    if (!materialDoc) {
      return res.status(404).json({ message: 'Material not found' });
    }
    const production = new Production({
      material,
      quantity: Number(quantity),
      date: date || Date.now(),
      user: req.user.id,
    });
    await production.save();

    await Stock.findOneAndUpdate(
      { material },
      { $inc: { quantity: Number(quantity) }, $set: { lastUpdated: new Date() } },
      { upsert: true }
    );

    await AuditLog.create({
      action: 'Production Added',
      user: req.user.id,
      details: `Added ${quantity} tons of ${material}`,
    });
    res.status(201).json(production);
  } catch (err) {
    console.error('Production error:', {
      message: err.message,
      stack: err.stack,
      user: req.user?.email || 'unknown',
    });
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const production = await Production.find().populate('user', 'email').lean();
    res.json(production);
  } catch (err) {
    console.error('Production fetch error:', {
      message: err.message,
      stack: err.stack,
      user: req.user?.email || 'unknown',
    });
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;