import express from 'express';
import TransactionService from '../services/transactionService.js';
import dbInstance from '../database/connection.js';

const router = express.Router();

/**
 * GET /api/transactions
 * Fetch transactions with pagination and filtering
 * 
 * Query Parameters:
 * - page: Page number (default: 1)
 * - limit: Number of records per page (default: 10, max: 100)
 * - type: Transaction type filter
 * - date: Exact date filter (YYYY-MM-DD)
 * - startDate: Start date for range filter (YYYY-MM-DD)
 * - endDate: End date for range filter (YYYY-MM-DD)
 * - minAmount: Minimum amount filter
 * - maxAmount: Maximum amount filter
 */
router.get('/', async (req, res) => {
  try {
    // Extract and validate query parameters
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    
    const filters = {};
    
    // Type filter
    if (req.query.type) {
      filters.type = req.query.type;
    }
    
    // Date filters
    if (req.query.date) {
      // Validate date format (YYYY-MM-DD)
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (dateRegex.test(req.query.date)) {
        filters.date = req.query.date;
      } else {
        return res.status(400).json({
          success: false,
          message: 'Invalid date format. Use YYYY-MM-DD'
        });
      }
    }
    
    // Date range filters
    if (req.query.startDate) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (dateRegex.test(req.query.startDate)) {
        filters.startDate = req.query.startDate;
      } else {
        return res.status(400).json({
          success: false,
          message: 'Invalid startDate format. Use YYYY-MM-DD'
        });
      }
    }
    
    if (req.query.endDate) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (dateRegex.test(req.query.endDate)) {
        filters.endDate = req.query.endDate;
      } else {
        return res.status(400).json({
          success: false,
          message: 'Invalid endDate format. Use YYYY-MM-DD'
        });
      }
    }
    
    // Amount filters
    if (req.query.minAmount !== undefined) {
      const minAmount = parseFloat(req.query.minAmount);
      if (!isNaN(minAmount)) {
        filters.minAmount = minAmount;
      } else {
        return res.status(400).json({
          success: false,
          message: 'Invalid minAmount. Must be a number'
        });
      }
    }
    
    if (req.query.maxAmount !== undefined) {
      const maxAmount = parseFloat(req.query.maxAmount);
      if (!isNaN(maxAmount)) {
        filters.maxAmount = maxAmount;
      } else {
        return res.status(400).json({
          success: false,
          message: 'Invalid maxAmount. Must be a number'
        });
      }
    }

    // Fetch transactions
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

/**
 * GET /api/transactions/stats
 * Get transaction statistics with optional filtering
 */
router.get('/stats', async (req, res) => {
  try {
    const filters = {};
    
    // Apply same filters as main endpoint
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

/**
 * GET /api/transactions/types
 * Get available transaction types
 */
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

/**
 * GET /api/transactions/:id
 * Get a specific transaction by ID across all tables
 */
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
