const express = require('express');
const router = express.Router();
const { auth, restrictTo } = require('../middleware/auth');
const Sale = require('../models/Sale');
const Stock = require('../models/Stock');
const VendorLedger = require('../models/VendorLedger');
const Material = require('../models/Material');
const AuditLog = require('../models/AuditLog');

router.post('/', auth, restrictTo('operator', 'admin'), async (req, res) => {
  const { vendor, material, quantity, rate, paymentMethod, paymentStatus, date } = req.body;
  if (!vendor || !material || !quantity || !rate || !paymentMethod || !paymentStatus) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  if (quantity < 0 || rate < 0) {
    return res.status(400).json({ message: 'Quantity and rate must be non-negative' });
  }
  try {
    const materialDoc = await Material.findOne({ name: material });
    if (!materialDoc) {
      return res.status(404).json({ message: 'Material not found' });
    }
    const total = quantity * rate;
    const sale = new Sale({
      vendor,
      material,
      quantity,
      rate,
      total,
      paymentMethod,
      status: paymentStatus,
      date: date || Date.now(),
      user: req.user.id,
    });
    await sale.save();

    const stock = await Stock.findOne({ material });
    if (!stock || stock.quantity < quantity) {
      return res.status(400).json({ message: 'Insufficient stock' });
    }
    await Stock.findOneAndUpdate(
      { material },
      { $inc: { quantity: -quantity }, $set: { lastUpdated: new Date() } }
    );

    await VendorLedger.create({
      vendor,
      saleId: sale._id,
      amount: total,
      status: paymentStatus,
    });

    await AuditLog.create({
      action: 'Sale Added',
      user: req.user.id,
      details: `Sold ${quantity} tons of ${material} to ${vendor}`,
    });
    res.status(201).json(sale);
  } catch (err) {
    console.error('Sale error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const sales = await Sale.find().populate('user', 'email');
    res.json(sales);
  } catch (err) {
    console.error('Sale fetch error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id).populate('user', 'email');
    if (!sale) return res.status(404).json({ message: 'Sale not found' });
    res.json(sale);
  } catch (err) {
    console.error('Sale fetch error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;