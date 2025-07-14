const express = require('express');
const router = express.Router();
const { auth, restrictTo } = require('../middleware/auth');
const Notification = require('../models/Notification');
const nodemailer = require('nodemailer');
const cron = require('node-cron');
const Sale = require('../models/Sale');
const Expense = require('../models/Expense');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');

cron.schedule('0 21 * * *', async () => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const sales = await Sale.aggregate([
      { $match: { date: { $gte: today, $lt: tomorrow } } },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]);
    const expenses = await Expense.aggregate([
      { $match: { date: { $gte: today, $lt: tomorrow } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const profit = (sales[0]?.total || 0) - (expenses[0]?.total || 0);
    const partnerShare = profit * 0.2;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });

    const partners = await User.find({ role: 'partner' }).select('email');
    const message = `Daily Summary for ${today.toLocaleDateString()}:\nSales: ₹${sales[0]?.total || 0}\nExpenses: ₹${expenses[0]?.total || 0}\nProfit: ₹${profit}\nPartner Share (20%): ₹${partnerShare}`;

    await Notification.create({
      message,
      type: 'daily_summary',
      enabled: true,
    });

    for (const partner of partners) {
      await transporter.sendMail({
        to: partner.email,
        subject: 'Daily Business Summary',
        text: message,
      });
    }
  } catch (err) {
    console.error('Daily summary error:', {
      message: err.message,
      stack: err.stack,
    });
  }
}, {
  timezone: 'Asia/Kolkata',
});

router.get('/', auth, async (req, res) => {
  try {
    const notifications = await Notification.find({ enabled: true })
      .populate('user', 'email')
      .sort({ date: -1 })
      .lean();
    res.json(notifications);
  } catch (err) {
    console.error('Notifications error:', {
      message: err.message,
      stack: err.stack,
      user: req.user?.email || 'unknown',
    });
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.post('/toggle', auth, restrictTo('admin'), async (req, res) => {
  const { enabled } = req.body;
  if (typeof enabled !== 'boolean') {
    return res.status(400).json({ message: 'Enabled field must be a boolean' });
  }
  try {
    await Notification.updateMany({}, { enabled });
    await AuditLog.create({
      action: 'Notifications Toggled',
      user: req.user.id,
      details: `Notifications ${enabled ? 'enabled' : 'disabled'}`,
    });
    res.json({ message: `Notifications ${enabled ? 'enabled' : 'disabled'}` });
  } catch (err) {
    console.error('Notification toggle error:', {
      message: err.message,
      stack: err.stack,
      user: req.user?.email || 'unknown',
    });
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;