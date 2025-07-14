const express = require('express');
const router = express.Router();
const { auth, restrictTo } = require('../middleware/auth');
const Maintenance = require('../models/Maintenance');
const AuditLog = require('../models/AuditLog');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure Uploads directory exists
const uploadDir = path.join(__dirname, '../Uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('Invalid file type. Only JPEG, PNG, and PDF are allowed.'));
    }
    cb(null, true);
  },
});

router.post('/', auth, restrictTo('operator', 'admin'), upload.single('file'), async (req, res) => {
  const { equipment, issue, cost, remarks, date } = req.body;
  if (!equipment || !issue || !cost) {
    return res.status(400).json({ message: 'Equipment, issue, and cost are required' });
  }
  if (isNaN(cost) || cost < 0) {
    return res.status(400).json({ message: 'Cost must be a non-negative number' });
  }
  try {
    const maintenance = new Maintenance({
      equipment,
      issue,
      cost: Number(cost),
      remarks,
      fileUrl: req.file ? `/Uploads/${req.file.filename}` : null,
      date: date || Date.now(),
      user: req.user.id,
    });
    await maintenance.save();

    await AuditLog.create({
      action: 'Maintenance Logged',
      user: req.user.id,
      details: `Logged maintenance for ${equipment}: ${issue} costing ₹${cost}`,
    });
    res.status(201).json(maintenance);
  } catch (err) {
    console.error('Maintenance error:', {
      message: err.message,
      stack: err.stack,
      user: req.user?.email || 'unknown',
    });
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const maintenance = await Maintenance.find().populate('user', 'email').lean();
    res.json(maintenance);
  } catch (err) {
    console.error('Maintenance fetch error:', {
      message: err.message,
      stack: err.stack,
      user: req.user?.email || 'unknown',
    });
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.get('/analytics', auth, async (req, res) => {
  try {
    const monthlyCosts = await Maintenance.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$date' } },
          cost: { $sum: '$cost' },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { month: '$_id', cost: 1, _id: 0 } },
    ]);
    const frequentIssues = await Maintenance.aggregate([
      { $group: { _id: { equipment: '$equipment', issue: '$issue' }, count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      { $project: { equipment: '$_id.equipment', issue: '$_id.issue', count: 1, _id: 0 } },
    ]);
    res.json({ monthlyCosts, frequentIssues });
  } catch (err) {
    console.error('Maintenance analytics error:', {
      message: err.message,
      stack: err.stack,
      user: req.user?.email || 'unknown',
    });
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;