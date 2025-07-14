const express = require('express');
const router = express.Router();
const { auth, restrictTo } = require('../middleware/auth');
const Expense = require('../models/Expense');
const AuditLog = require('../models/AuditLog');

router.post('/', auth, restrictTo('operator', 'admin'), async (req, res) => {
  const { expenseCategory, amount } = req.body;
  try {
    const expense = new Expense({ expenseCategory, amount });
    await expense.save();

    await AuditLog.create({ action: `Added expense of ₹${amount} for ${expenseCategory}`, user: req.user.id });
    res.status(201).json(expense);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const expenses = await Expense.find();
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;