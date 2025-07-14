const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Sale = require('../models/Sale');
const Expense = require('../models/Expense');

router.get('/', auth, async (req, res) => {
  try {
    const sales = await Sale.aggregate([
      { $group: { _id: null, total: { $sum: { $multiply: ['$quantity', '$rate'] } } } },
    ]);
    const expenses = await Expense.aggregate([
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const profit = (sales[0]?.total || 0) - (expenses[0]?.total || 0);
    res.json({ profit, expenses: expenses[0]?.total || 0 });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;