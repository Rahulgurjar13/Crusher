const express = require('express');
const router = express.Router();
const { auth, restrictTo } = require('../middleware/auth');
const Notification = require('../models/Notification');
const nodemailer = require('nodemailer');
const cron = require('node-cron');
const Sale = require('../models/Sale');
const Expense = require('../models/Expense');

// Daily summary email at 9 PM
cron.schedule('0 21 * * *', async () => {
  const today = new Date().setHours(0, 0, 0, 0);
  const sales = await Sale.aggregate([
    { $match: { date: { $gte: new Date(today) } } },
    { $group: { _id: null, total: { $sum: { $multiply: ['$quantity', '$rate'] } } } },
  ]);
  const expenses = await Expense.aggregate([
    { $match: { date: { $gte: new Date(today) } } },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);
  const profit = (sales[0]?.total || 0) - (expenses[0]?.total || 0);

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });
  await transporter.sendMail({
    to: 'partners@example.com', // Replace with actual partner emails
    subject: 'Daily Business Summary',
    text: `Sales: ₹${sales[0]?.total || 0}\nExpenses: ₹${expenses[0]?.total || 0}\nProfit: ₹${profit}`,
  });
});

router.get('/', auth, async (req, res) => {
  try {
    const notifications = await Notification.find();
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/toggle', auth, restrictTo('admin'), async (req, res) => {
  const { enabled } = req.body;
  try {
    await Notification.updateMany({}, { enabled });
    res.json({ message: `Notifications ${enabled ? 'enabled' : 'disabled'}` });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;