const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const productionRoutes = require('./routes/production');
const dispatchRoutes = require('./routes/dispatch');
const salesRoutes = require('./routes/sales');
const expensesRoutes = require('./routes/expenses');
const stockRoutes = require('./routes/stock');
const ratesRoutes = require('./routes/rates');
const vendorLedgerRoutes = require('./routes/vendorLedger');
const maintenanceRoutes = require('./routes/maintenance');
const reportsRoutes = require('./routes/reports');
const logsRoutes = require('./routes/logs');
const auditLogsRoutes = require('./routes/auditLogs');
const notificationsRoutes = require('./routes/notifications');
const materialsRoutes = require('./routes/materials');
const trucksRoutes = require('./routes/trucks');
const vendorsRoutes = require('./routes/vendors');
const { connectDB } = require('./config');

dotenv.config();
const app = express();

app.use(cors({
  origin: ['http://localhost:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));
app.use(express.json());
app.use('/Uploads', express.static(path.join(__dirname, 'Uploads')));

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Stone Crusher Backend is running on port 3000' });
});

app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/production', productionRoutes);
app.use('/api/dispatch', dispatchRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/expenses', expensesRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/rates', ratesRoutes);
app.use('/api/vendor-ledger', vendorLedgerRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/logs', logsRoutes);
app.use('/api/audit-logs', auditLogsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/materials', materialsRoutes);
app.use('/api/trucks', trucksRoutes);
app.use('/api/vendors', vendorsRoutes);

// Logging middleware after routes
app.use((req, res, next) => {
  console.log(`Request: ${req.method} ${req.url}`, {
    headers: req.headers,
    body: req.body,
    user: req.user?.email || 'unknown',
  });
  next();
});

// Error handling
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    console.error('Multer error:', {
      message: err.message,
      stack: err.stack,
      user: req.user?.email || 'unknown',
    });
    return res.status(400).json({ message: 'File upload error', error: err.message });
  }
  if (err.message === 'Invalid file type. Only JPEG, PNG, and PDF are allowed.') {
    return res.status(400).json({ message: err.message });
  }
  console.error('Server error:', {
    message: err.message,
    stack: err.stack,
    user: req.user?.email || 'unknown',
    url: req.url,
    method: req.method,
  });
  res.status(500).json({ message: 'Server error', error: err.message });
});

const PORT = process.env.PORT || 3000;
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`Port ${PORT} is in use. Try a different port or close the conflicting application.`);
      process.exit(1);
    }
    console.error('Server startup error:', err);
  });
});