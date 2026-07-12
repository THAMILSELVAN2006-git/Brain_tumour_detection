const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Set security headers (Modified to allow rendering local images from frontend if needed)
app.use(helmet({
  crossOriginResourcePolicy: false
}));

// Setup Request Logger
app.use(morgan('dev'));

// Enable CORS
app.use(cors({
  origin: '*', // Allow all origins for local testing
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure upload directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Serve uploaded MRI scans statically
app.use('/uploads', express.static(uploadDir));

// Rate limiting (Avoid ML service overload)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests from this IP. Please try again later.'
  }
});
app.use('/api/', apiLimiter);

// Import Route Files
const authRoutes = require('./routes/auth');
const patientRoutes = require('./routes/patients');
const scanRoutes = require('./routes/scans');
const analyticsRoutes = require('./routes/analytics');
const userRoutes = require('./routes/users');

// Mount Router middleware
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/scans', scanRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/users', userRoutes);

// Basic base route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to MastishkNetra Brain MRI Diagnostic API Platform',
    status: 'operational',
    version: '1.0.0'
  });
});

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ success: false, error: 'Resource route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Express Error Handler:", err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
});

// Database Connect and Listen
const PORT = process.env.PORT || 5000;
const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/mastishknetra';

mongoose.connect(mongoUri)
  .then(() => {
    console.log('MongoDB Connected successfully to local database.');
    app.listen(PORT, () => {
      console.log(`Express server running in development mode on port ${PORT}`);
      console.log(`Serving uploaded scans from ${uploadDir}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection failure:', err);
    process.exit(1);
  });
