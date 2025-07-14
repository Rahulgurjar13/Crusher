const express = require('express');
const router = express.Router();
const { auth, restrictTo } = require('../middleware/auth');
const Maintenance = require('../models/Maintenance');
const AuditLog = require('../models/AuditLog');
const multer = require('multer');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

router.post('/', auth, restrictTo('operator', 'admin'), upload.single('file'), async (req, res) => {
  const { equipment, issue, cost, remarks } = req.body;
  try {
    const maintenance = new Maintenance({
      equipment,
      issue,
      cost,
      remarks,
      file: req.file?.path,
    });
    await maintenance.save();

    await AuditLog.create({ action: `Logged maintenance for ${equipment}`, user: req.user.id });
    res.status(201).json(maintenance);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const maintenance = await Maintenance.find();
    res.json(maintenance);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;