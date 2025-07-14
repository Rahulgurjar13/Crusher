const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Production = require('../models/Production');
const Dispatch = require('../models/Dispatch');
const Expense = require('../models/Expense');

router.get('/', auth, async (req, res) => {
  const { date } = req.query;
  try {
    const start = new Date(date);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    const production = await Production.find({ date: { $gte: start, $lte: end } });
    const dispatch = await Dispatch.find({ date: { $gte: start, $lte: end } });
    const expenses = await Expense.find({ date: { $gte: start, $lte: end } });

    const logs = [
      ...production.map((p) => ({ type: 'Production', details: `${p.quantity} tons of ${p.material}` })),
      ...dispatch.map((d) => ({ type: 'Dispatch', details: `${d.quantity} tons to ${d.destination}` })),
      ...expenses.map((e) => ({ type: 'Expense', details: `₹${e.amount} for ${e.expenseCategory}` })),
    ];

    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;