const express = require('express');
const router = express.Router();
const { auth, restrictTo } = require('../middleware/auth');
const Sale = require('../models/Sale');
const Stock = require('../models/Stock');
const VendorLedger = require('../models/VendorLedger');
const AuditLog = require('../models/AuditLog');

router.post('/', auth, restrictTo('operator', 'admin'), async (req, res) => {
  const { vendor, material, quantity, rate, paymentMethod, status } = req.body;
  try {
    const sale = new Sale({ vendor, material, quantity, rate, paymentMethod, status });
    await sale.save();

    await Stock.findOneAndUpdate(
      { material },
      { $inc: { quantity: -quantity }, $set: { lastUpdated: new Date() } }
    );

    await VendorLedger.create({
      vendor,
      saleId: sale._id,
      amount: quantity * rate,
      status: status || 'Pending',
    });

    await AuditLog.create({ action: `Added sale of ${quantity} tons of ${material}`, user: req.user.id });
    res.status(201).json(sale);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const sales = await Sale.find();
    res.json(sales);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id);
    if (!sale) return res.status(404).json({ message: 'Sale not found' });
    res.json(sale);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;