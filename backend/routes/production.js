const express = require('express');
const router = express.Router();
const { auth, restrictTo } = require('../middleware/auth');
const Production = require('../models/Production');
const Stock = require('../models/Stock');
const AuditLog = require('../models/AuditLog');

router.post('/', auth, restrictTo('operator', 'admin'), async (req, res) => {
  const { material, quantity } = req.body;
  try {
    const production = new Production({ material, quantity });
    await production.save();

    await Stock.findOneAndUpdate(
      { material },
      { $inc: { quantity }, $set: { lastUpdated: new Date() } },
      { upsert: true }
    );

    await AuditLog.create({ action: `Added ${quantity} tons of ${material}`, user: req.user.id });
    res.status(201).json(production);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const production = await Production.find();
    res.json(production);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;