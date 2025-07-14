const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
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
const { connectDB } = require('./config');

dotenv.config();
const app = express();

app.use(cors({
  origin: ['http://localhost:5173', '*'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'Uploads')));

app.use((req, res, next) => {
  res.setHeader('Server', 'StoneCrusherExpress/1.0.0');
  console.log(`Request: ${req.method} ${req.url}`, {
    headers: req.headers,
    body: req.body,
  });
  next();
});

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

app.use((err, req, res, next) => {
  console.error('Server error:', {
    message: err.message,
    stack: err.stack,
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