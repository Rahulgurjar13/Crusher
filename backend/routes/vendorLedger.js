const express = require('express');
const router = express.Router();
const { auth, restrictTo } = require('../middleware/auth');
const VendorLedger = require('../models/VendorLedger');
const Sale = require('../models/Sale');
const Notification = require('../models/Notification');
const AuditLog = require('../models/AuditLog');

router.get('/', auth, async (req, res) => {
  try {
    const ledger = await VendorLedger.find().populate('saleId', 'material quantity').lean();
    const pending = ledger.filter((entry) => entry.status === 'Credit');
    for (const entry of pending) {
      const existing = await Notification.findOne({
        type: 'vendor_due',
        message: `Pending payment of ₹${entry.amount} for vendor ${entry.vendor}`,
      });
      if (!existing) {
        await Notification.create({
          message: `Pending payment of ₹${entry.amount} for vendor ${entry.vendor}`,
          type: 'vendor_due',
          enabled: true,
        });
      }
    }
    res.json(ledger);
  } catch (err) {
    console.error('Vendor ledger fetch error:', {
      message: err.message,
      stack: err.stack,
      user: req.user?.email || 'unknown',
    });
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.post('/pay', auth, restrictTo('admin'), async (req, res) => {
  const { saleId } = req.body;
  if (!saleId) {
    return res.status(400).json({ message: 'Sale ID is required' });
  }
  try {
    const ledgerEntry = await VendorLedger.findOne({ saleId });
    if (!ledgerEntry) {
      return res.status(404).json({ message: 'Ledger entry not found' });
    }
    if (ledgerEntry.status === 'Paid') {
      return res.status(400).json({ message: 'Payment already completed' });
    }
    ledgerEntry.status = 'Paid';
    await ledgerEntry.save();

    await Sale.findByIdAndUpdate(saleId, { status: 'Paid' });

    await AuditLog.create({
      action: 'Payment Marked Paid',
      user: req.user.id,
      details: `Marked payment of ₹${ledgerEntry.amount} for vendor ${ledgerEntry.vendor} as paid`,
    });
    res.json({ message: 'Payment marked as paid' });
  } catch (err) {
    console.error('Payment error:', {
      message: err.message,
      stack: err.stack,
      user: req.user?.email || 'unknown',
    });
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;