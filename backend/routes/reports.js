const express = require('express');
const router = express.Router();
const { auth, restrictTo } = require('../middleware/auth');
const Sale = require('../models/Sale');
const Expense = require('../models/Expense');

router.get('/', auth, restrictTo('admin', 'partner'), async (req, res) => {
  try {
    const sales = await Sale.find().select('total date').lean().exec();
    const expenses = await Expense.find().select('amount date').lean().exec();

    const reportData = [
      ...sales.map(s => ({ type: 'Sale', amount: s.total, date: s.date })),
      ...expenses.map(e => ({ type: 'Expense', amount: e.amount, date: e.date })),
    ];

    const totalSales = sales.reduce((sum, s) => sum + (s.total || 0), 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    const profit = totalSales - totalExpenses;
    const partnerShare = req.user.role === 'partner' ? profit * 0.2 : 0;

    res.json({
      profit,
      expenses: totalExpenses,
      partnerShare,
      data: reportData,
    });
  } catch (err) {
    console.error('Reports error:', {
      message: err.message,
      stack: err.stack,
      user: req.user?.email || 'unknown',
    });
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;