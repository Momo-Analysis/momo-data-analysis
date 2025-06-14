import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import transactionRoutes from './routes/transactions.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// API Routes
app.use('/api/transactions', transactionRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'MoMo Data Analysis API is running',
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to MoMo Data Analysis API',
    version: '1.0.0',
    endpoints: {
      transactions: '/api/transactions',
      transactionStats: '/api/transactions/stats',
      transactionTypes: '/api/transactions/types',
      health: '/health'
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 MoMo Data Analysis API server is running on port ${PORT}`);
  console.log(`📊 Available endpoints:`);
  console.log(`   - GET  http://localhost:${PORT}/`);
  console.log(`   - GET  http://localhost:${PORT}/health`);
  console.log(`   - GET  http://localhost:${PORT}/api/transactions`);
  console.log(`   - GET  http://localhost:${PORT}/api/transactions/stats`);
  console.log(`   - GET  http://localhost:${PORT}/api/transactions/types`);
  console.log(`   - GET  http://localhost:${PORT}/api/transactions/:type/:id`);
  console.log(`   - GET  http://localhost:${PORT}/api/transactions/:transactionId`);
  console.log(`   - GET  http://localhost:${PORT}/api/transactions/search`);
});
