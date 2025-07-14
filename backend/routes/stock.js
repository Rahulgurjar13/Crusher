const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Stock = require('../models/Stock');
const Notification = require('../models/Notification');

router.get('/', auth, async (req, res) => {
  try {
    const stocks = await Stock.find();
    const lowStock = stocks.filter((stock) => stock.quantity < 50); // Threshold from frontend
    for (const stock of lowStock) {
      const existing = await Notification.findOne({
        type: 'low_stock',
        message: `Low stock alert: ${stock.material} has ${stock.quantity} tons`,
      });
      if (!existing) {
        await Notification.create({
          message: `Low stock alert: ${stock.material} has ${stock.quantity} tons`,
          type: 'low_stock',
        });
      }
    }
    res.json(stocks);
  } catch (err) {
    console.error('Stock fetch error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;