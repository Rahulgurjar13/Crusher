const express = require('express');
const router = express.Router();
const { auth, restrictTo } = require('../middleware/auth');
const Dispatch = require('../models/Dispatch');
const Stock = require('../models/Stock');
const Material = require('../models/Material');
const AuditLog = require('../models/AuditLog');

router.post('/', auth, restrictTo('operator', 'admin'), async (req, res) => {
  const { truck, vendor, material, quantity, destination, rate, freight, date } = req.body;
  if (!truck || !vendor || !material || !quantity || !destination || !rate || !freight) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  if (quantity < 0 || rate < 0 || freight < 0) {
    return res.status(400).json({ message: 'Quantity, rate, and freight must be non-negative' });
  }
  try {
    const materialDoc = await Material.findOne({ name: material });
    if (!materialDoc) {
      return res.status(404).json({ message: 'Material not found' });
    }
    const total = quantity * rate + freight;
    const dispatch = new Dispatch({
      truck,
      vendor,
      material,
      quantity,
      destination,
      rate,
      freight,
      total,
      date: date || Date.now(),
      user: req.user.id,
    });
    await dispatch.save();

    const stock = await Stock.findOne({ material });
    if (!stock || stock.quantity < quantity) {
      return res.status(400).json({ message: 'Insufficient stock' });
    }
    await Stock.findOneAndUpdate(
      { material },
      { $inc: { quantity: -quantity }, $set: { lastUpdated: new Date() } }
    );

    await AuditLog.create({
      action: 'Dispatch Added',
      user: req.user.id,
      details: `Dispatched ${quantity} tons of ${material} to ${destination}`,
    });
    res.status(201).json(dispatch);
  } catch (err) {
    console.error('Dispatch error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const dispatches = await Dispatch.find().populate('user', 'email');
    res.json(dispatches);
  } catch (err) {
    console.error('Dispatch fetch error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;