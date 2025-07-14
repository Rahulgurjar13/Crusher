const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema({
  expenseCategory: { type: String, required: true },
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Expense', ExpenseSchema);