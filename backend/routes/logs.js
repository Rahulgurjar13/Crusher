const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Production = require('../models/Production');
const Dispatch = require('../models/Dispatch');
const Sale = require('../models/Sale');
const Expense = require('../models/Expense');

router.get('/', auth, async (req, res) => {
  const { date } = req.query;
  if (!date) {
    return res.status(400).json({ message: 'Date is required' });
  }
  try {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    const production = await Production.find({ date: { $gte: start, $lte: end } }).populate('user', 'email');
    const dispatch = await Dispatch.find({ date: { $gte: start, $lte: end } }).populate('user', 'email');
    const sales = await Sale.find({ date: { $gte: start, $lte: end } }).populate('user', 'email');
    const expenses = await Expense.find({ date: { $gte: start, $lte: end } }).populate('user', 'email');

    const logs = [
      ...production.map(p => ({
        type: 'Production',
        details: `${p.quantity} tons of ${p.material}`,
        user: p.user.email,
        date: p.date,
      })),
      ...dispatch.map(d => ({
        type: 'Dispatch',
        details: `${d.quantity} tons of ${d.material} to ${d.destination}`,
        user: d.user.email,
        date: d.date,
      })),
      ...sales.map(s => ({
        type: 'Sale',
        details: `${s.quantity} tons of ${s.material} to ${s.vendor} for ₹${s.total}`,
        user: s.user.email,
        date: s.date,
      })),
      ...expenses.map(e => ({
        type: 'Expense',
        details: `₹${e.amount} for ${e.expenseCategory}${e.remarks ? `: ${e.remarks}` : ''}`,
        user: e.user.email,
        date: e.date,
      })),
    ];

    res.json(logs);
  } catch (err) {
    console.error('Logs error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;