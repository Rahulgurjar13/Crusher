const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const VendorLedger = require('../models/VendorLedger');
const Notification = require('../models/Notification');

router.get('/', auth, async (req, res) => {
  try {
    const ledger = await VendorLedger.find();
    const pending = ledger.filter((entry) => entry.status === 'Pending');
    for (const entry of pending) {
      await Notification.create({
        message: `Pending payment of ₹${entry.amount} for vendor ${entry.vendor}`,
        type: 'vendor-due',
      });
    }
    res.json(ledger);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;