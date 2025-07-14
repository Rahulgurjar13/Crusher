const express = require('express');
const router = express.Router();
const { auth, restrictTo } = require('../middleware/auth');
const Expense = require('../models/Expense');
const AuditLog = require('../models/AuditLog');

router.post('/', auth, restrictTo('operator', 'admin'), async (req, res) => {
  const { expenseCategory, amount, remarks, date } = req.body;
  if (!expenseCategory || !amount) {
    return res.status(400).json({ message: 'Category and amount are required' });
  }
  if (amount < 0) {
    return res.status(400).json({ message: 'Amount must be non-negative' });
  }
  try {
    const expense = new Expense({
      expenseCategory,
      amount,
      remarks,
      date: date || Date.now(),
      user: req.user.id,
    });
    await expense.save();

    await AuditLog.create({
      action: 'Expense Added',
      user: req.user.id,
      details: `Added expense of ₹${amount} for ${expenseCategory}${remarks ? `: ${remarks}` : ''}`,
    });
    res.status(201).json(expense);
  } catch (err) {
    console.error('Expense error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const expenses = await Expense.find().populate('user', 'email');
    res.json(expenses);
  } catch (err) {
    console.error('Expense fetch error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;