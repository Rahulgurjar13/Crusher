const express = require('express');
const router = express.Router();
const { auth, restrictTo } = require('../middleware/auth');
const Dispatch = require('../models/Dispatch');
const Stock = require('../models/Stock');
const AuditLog = require('../models/AuditLog');

router.post('/', auth, restrictTo('operator', 'admin'), async (req, res) => {
  const { truck, vendor, material, quantity, destination, rate, freight } = req.body;
  try {
    const total = quantity * rate + freight;
    const dispatch = new Dispatch({ truck, vendor, material, quantity, destination, rate, freight, total });
    await dispatch.save();

    await Stock.findOneAndUpdate(
      { material },
      { $inc: { quantity: -quantity }, $set: { lastUpdated: new Date() } }
    );

    await AuditLog.create({ action: `Dispatched ${quantity} tons of ${material}`, user: req.user.id });
    res.status(201).json(dispatch);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const dispatches = await Dispatch.find();
    res.json(dispatches);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;