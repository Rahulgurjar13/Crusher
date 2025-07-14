const express = require('express');
const router = express.Router();
const { auth, restrictTo } = require('../middleware/auth');
const Truck = require('../models/Truck');
const AuditLog = require('../models/AuditLog');

router.get('/', auth, async (req, res) => {
  try {
    const trucks = await Truck.find().lean();
    res.json(trucks);
  } catch (err) {
    console.error('Trucks fetch error:', {
      message: err.message,
      stack: err.stack,
      user: req.user?.email || 'unknown',
    });
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.post('/', auth, restrictTo('admin'), async (req, res) => {
  if (req.is('multipart/form-data')) {
    return res.status(400).json({ message: 'Invalid Content-Type: application/json expected' });
  }
  const { number } = req.body;
  if (!number) {
    return res.status(400).json({ message: 'Truck number is required' });
  }
  try {
    const existingTruck = await Truck.findOne({ number });
    if (existingTruck) {
      return res.status(400).json({ message: 'Truck number already exists' });
    }
    const truck = new Truck({ number });
    await truck.save();
    await AuditLog.create({
      action: 'Truck Added',
      user: req.user.id,
      details: `Added truck ${number}`,
    });
    res.status(201).json(truck);
  } catch (err) {
    console.error('Truck creation error:', {
      message: err.message,
      stack: err.stack,
      user: req.user?.email || 'unknown',
    });
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;