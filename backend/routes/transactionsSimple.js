import express from 'express';
import TransactionService from '../services/transactionService.js';
import dbInstance from '../database/connection.js';

const router = express.Router();

// GET /api/transactions - Main endpoint with pagination and filtering
router.get('/', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    
    const filters = {};
    
    if (req.query.type) filters.type = req.query.type;
    if (req.query.date) filters.date = req.query.date;
    if (req.query.startDate) filters.startDate = req.query.startDate;
    if (req.query.endDate) filters.endDate = req.query.endDate;
    if (req.query.minAmount !== undefined) filters.minAmount = parseFloat(req.query.minAmount);
    if (req.query.maxAmount !== undefined) filters.maxAmount = parseFloat(req.query.maxAmount);

    const result = await TransactionService.getAllTransactions(filters, page, limit);
    
    res.json({
      success: true,
      message: 'Transactions fetched successfully',
      data: result.data,
      pagination: {
        currentPage: result.currentPage,
        totalPages: result.totalPages,
        totalRecords: result.totalRecords,
        hasNextPage: result.hasNextPage,
        hasPrevPage: result.hasPrevPage,
        limit
      },
      filters: filters
    });
    
  } catch (error) {
    console.error('Error in GET /api/transactions:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/transactions/stats - Transaction statistics
router.get('/stats', async (req, res) => {
  try {
    const filters = {};
    
    if (req.query.type) filters.type = req.query.type;
    if (req.query.date) filters.date = req.query.date;
    if (req.query.startDate) filters.startDate = req.query.startDate;
    if (req.query.endDate) filters.endDate = req.query.endDate;
    if (req.query.minAmount !== undefined) filters.minAmount = parseFloat(req.query.minAmount);
    if (req.query.maxAmount !== undefined) filters.maxAmount = parseFloat(req.query.maxAmount);

    const stats = await TransactionService.getTransactionStats(filters);
    
    res.json({
      success: true,
      message: 'Transaction statistics fetched successfully',
      data: stats,
      filters: filters
    });
    
  } catch (error) {
    console.error('Error in GET /api/transactions/stats:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/transactions/types - Available transaction types
router.get('/types', (req, res) => {
  try {
    const types = TransactionService.getTransactionTypes();
    
    res.json({
      success: true,
      message: 'Transaction types fetched successfully',
      data: types
    });
    
  } catch (error) {
    console.error('Error in GET /api/transactions/types:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/transactions/:id - Get specific transaction by ID
router.get('/:id', async (req, res) => {
  try {
    const connection = await dbInstance.getConnection();
    const transactionId = req.params.id;
    const tableNames = TransactionService.getTableNames();
    
    let foundTransaction = null;
    
    // Search across all tables for the transaction ID
    for (const tableName of tableNames) {
      try {
        const query = `SELECT *, '${tableName}' as table_name FROM ${tableName} WHERE transactionId = ? OR id = ?`;
        const [rows] = await connection.execute(query, [transactionId, transactionId]);
        
        if (rows.length > 0) {
          foundTransaction = rows[0];
          break;
        }
      } catch (error) {
        console.error(`Error searching in table ${tableName}:`, error);
      }
    }
    
    if (foundTransaction) {
      res.json({
        success: true,
        message: 'Transaction found',
        data: foundTransaction
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }
    
  } catch (error) {
    console.error('Error in GET /api/transactions/:id:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;
