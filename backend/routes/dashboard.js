const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Production = require('../models/Production');
const Dispatch = require('../models/Dispatch');
const Sale = require('../models/Sale');
const Expense = require('../models/Expense');
const Stock = require('../models/Stock');
const VendorLedger = require('../models/VendorLedger');

router.get('/', auth, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const production = await Production.aggregate([
      { $match: { date: { $gte: today, $lt: tomorrow } } },
      { $group: { _id: null, total: { $sum: '$quantity' } } },
    ]);
    const dispatch = await Dispatch.countDocuments({ date: { $gte: today, $lt: tomorrow } });
    const sales = await Sale.aggregate([
      { $match: { date: { $gte: today, $lt: tomorrow } } },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]);
    const expenses = await Expense.aggregate([
      { $match: { date: { $gte: today, $lt: tomorrow } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const stock = await Stock.find();
    const pendingDues = await VendorLedger.aggregate([
      { $match: { status: 'Credit' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const profit = (sales[0]?.total || 0) - (expenses[0]?.total || 0);
    const partnerShare = req.user.role === 'partner' ? profit * 0.2 : 0;

    res.json({
      production: production[0]?.total || 0,
      dispatch,
      sales: sales[0]?.total || 0,
      expenses: expenses[0]?.total || 0,
      profit,
      partnerShare,
      stock,
      pendingDues: pendingDues[0]?.total || 0,
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;