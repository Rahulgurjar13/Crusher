const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Stock = require('../models/Stock');
const Notification = require('../models/Notification');

router.get('/', auth, async (req, res) => {
  try {
    const stocks = await Stock.find();
    const lowStock = stocks.filter((stock) => stock.quantity < 100); // Example threshold
    for (const stock of lowStock) {
      await Notification.create({
        message: `Low stock alert: ${stock.material} has ${stock.quantity} tons`,
        type: 'low-stock',
      });
    }
    res.json(stocks);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;