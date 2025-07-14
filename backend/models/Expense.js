const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema({
  expenseCategory: { type: String, required: true, enum: ['Fuel', 'Electricity', 'Salary', 'Maintenance', 'Other'] },
  amount: { type: Number, required: true, min: 0 },
  remarks: { type: String }, // Added for frontend
  date: { type: Date, default: Date.now },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Added for audit
});

module.exports = mongoose.model('Expense', ExpenseSchema);