const express = require('express');
const router = express.Router();
const { auth, restrictTo } = require('../middleware/auth');
const Production = require('../models/Production');
const Dispatch = require('../models/Dispatch');
const Sale = require('../models/Sale');
const Expense = require('../models/Expense');
const Stock = require('../models/Stock');

router.get('/', auth, async (req, res) => {
  try {
    const today = new Date().setHours(0, 0, 0, 0);
    const production = await Production.aggregate([
      { $match: { date: { $gte: new Date(today) } } },
      { $group: { _id: null, total: { $sum: '$quantity' } } },
    ]);
    const dispatch = await Dispatch.countDocuments({ date: { $gte: new Date(today) } });
    const sales = await Sale.aggregate([
      { $match: { date: { $gte: new Date(today) } } },
      { $group: { _id: null, total: { $sum: { $multiply: ['$quantity', '$rate'] } } } },
    ]);
    const expenses = await Expense.aggregate([
      { $match: { date: { $gte: new Date(today) } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const stock = await Stock.find();
    const profit = (sales[0]?.total || 0) - (expenses[0]?.total || 0);
    const partnerShare = req.user.role === 'partner' ? profit * 0.2 : 0;

    res.json({
      production: production[0]?.total || 0,
      dispatch,
      sales: sales[0]?.total || 0,
      expenses: expenses[0]?.total || 0,
      profit,
      stock,
      partnerShare,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;