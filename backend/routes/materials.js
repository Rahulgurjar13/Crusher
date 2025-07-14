const express = require('express');
const router = express.Router();
const { auth, restrictTo } = require('../middleware/auth');
const Material = require('../models/Material');
const AuditLog = require('../models/AuditLog');

router.get('/', auth, async (req, res) => {
  try {
    const materials = await Material.find().lean();
    res.json(materials);
  } catch (err) {
    console.error('Materials fetch error:', {
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
  const { name, rate } = req.body;
  if (!name || !rate) {
    return res.status(400).json({ message: 'Name and rate are required' });
  }
  if (isNaN(rate) || rate < 0) {
    return res.status(400).json({ message: 'Rate must be a non-negative number' });
  }
  try {
    const existingMaterial = await Material.findOne({ name });
    if (existingMaterial) {
      return res.status(400).json({ message: 'Material already exists' });
    }
    const material = new Material({ name, rate: Number(rate) });
    await material.save();
    await AuditLog.create({
      action: 'Material Added',
      user: req.user.id,
      details: `Added material ${name} with rate ₹${rate}`,
    });
    res.status(201).json(material);
  } catch (err) {
    console.error('Material creation error:', {
      message: err.message,
      stack: err.stack,
      user: req.user?.email || 'unknown',
    });
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;