const express = require('express');
const router = express.Router();
const { auth, restrictTo } = require('../middleware/auth');
const Vendor = require('../models/Vendor');
const AuditLog = require('../models/AuditLog');

router.get('/', auth, async (req, res) => {
  try {
    const vendors = await Vendor.find().lean();
    res.json(vendors);
  } catch (err) {
    console.error('Vendors fetch error:', {
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
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ message: 'Vendor name is required' });
  }
  try {
    const existingVendor = await Vendor.findOne({ name });
    if (existingVendor) {
      return res.status(400).json({ message: 'Vendor already exists' });
    }
    const vendor = new Vendor({ name });
    await vendor.save();
    await AuditLog.create({
      action: 'Vendor Added',
      user: req.user.id,
      details: `Added vendor ${name}`,
    });
    res.status(201).json(vendor);
  } catch (err) {
    console.error('Vendor creation error:', {
      message: err.message,
      stack: err.stack,
      user: req.user?.email || 'unknown',
    });
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;