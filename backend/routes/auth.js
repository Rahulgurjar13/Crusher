const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const { refreshToken } = require('../middleware/auth');

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  console.log('Login attempt:', { email });
  try {
    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found:', email);
      return res.status(401).json({ message: 'Invalid credentials: User not found' });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log('Password mismatch for:', email);
      return res.status(401).json({ message: 'Invalid credentials: Incorrect password' });
    }
    const token = jwt.sign(
      { id: user._id, role: user.role, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    const refreshToken = jwt.sign(
      { id: user._id, role: user.role, email: user.email },
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    console.log('Login successful:', { email, role: user.role });
    res.json({ token, refreshToken, role: user.role, email: user.email });
  } catch (err) {
    console.error('Login error:', {
      message: err.message,
      stack: err.stack,
    });
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.post('/reset-password', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const resetToken = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });
    await transporter.sendMail({
      to: email,
      subject: 'Password Reset',
      text: `Click to reset your password: ${process.env.FRONTEND_URL}/reset-password/verify?token=${resetToken}`,
    });
    res.json({ message: 'Password reset link sent' });
  } catch (err) {
    console.error('Reset password error:', {
      message: err.message,
      stack: err.stack,
    });
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.post('/refresh-token', refreshToken);

router.post('/reset-password/verify', async (req, res) => {
  const { token, newPassword } = req.body;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    console.error('Verify reset password error:', {
      message: err.message,
      stack: err.stack,
    });
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Reset token expired' });
    }
    res.status(401).json({ message: 'Invalid reset token' });
  }
});

module.exports = router;