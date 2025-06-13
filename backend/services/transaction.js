import dbInstance from '../database/connection.js';
import transactionTypes from '../utils/transaction_types.js';

class Transaction {
  static getTransactionTypes() {
    return Object.values(transactionTypes);
  }

  static getTableNames() {
    return Object.keys(transactionTypes);
  }

  static buildWhereClause(filters) {
    const conditions = [];
    const params = [];

    // Filter by type
    if (filters.type && this.getTransactionTypes().includes(filters.type.toUpperCase())) {
      conditions.push('type = ?');
      params.push(filters.type.toUpperCase());
    }

    // Filter by date (exact day)
    if (filters.date) {
      conditions.push('DATE(timestamp) = ?');
      params.push(filters.date);
    }

    // Filter by date range
    if (filters.startDate && filters.endDate) {
      conditions.push('DATE(timestamp) BETWEEN ? AND ?');
      params.push(filters.startDate, filters.endDate);
    } else if (filters.startDate) {
      conditions.push('DATE(timestamp) >= ?');
      params.push(filters.startDate);
    } else if (filters.endDate) {
      conditions.push('DATE(timestamp) <= ?');
      params.push(filters.endDate);
    }

    // Filter by amount range
    if (filters.minAmount !== undefined && filters.maxAmount !== undefined) {
      conditions.push('amount BETWEEN ? AND ?');
      params.push(parseFloat(filters.minAmount), parseFloat(filters.maxAmount));
    } else if (filters.minAmount !== undefined) {
      conditions.push('amount >= ?');
      params.push(parseFloat(filters.minAmount));
    } else if (filters.maxAmount !== undefined) {
      conditions.push('amount <= ?');
      params.push(parseFloat(filters.maxAmount));
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    return { whereClause, params };
  }

  static async getTransactionsFromTable(tableName, filters = {}, page = 1, limit = 10) {
    try {
      const connection = await dbInstance.getConnection();
      const offset = (page - 1) * limit;
      const { whereClause, params } = this.buildWhereClause(filters);

      // Get total count
      const countQuery = `SELECT COUNT(*) as total FROM ${tableName} ${whereClause}`;
      const [countResult] = await connection.execute(countQuery, params);
      const totalRecords = countResult[0].total;

      // Get paginated data
      const dataQuery = `
        SELECT * FROM ${tableName} 
        ${whereClause} 
        ORDER BY timestamp DESC 
        LIMIT ? OFFSET ?
      `;
      const [rows] = await connection.execute(dataQuery, [...params, limit, offset]);

      return {
        data: rows,
        totalRecords,
        currentPage: page,
        totalPages: Math.ceil(totalRecords / limit),
        hasNextPage: page < Math.ceil(totalRecords / limit),
        hasPrevPage: page > 1
      };
    } catch (error) {
      console.error(`Error fetching transactions from ${tableName}:`, error);
      throw error;
    }
  }

  static async getAllTransactions(filters = {}, page = 1, limit = 10) {
    try {
      const connection = await dbInstance.getConnection();
      const tableNames = this.getTableNames();
      const allResults = [];

      // If filtering by type, query only the relevant table
      if (filters.type) {
        const tableKey = Object.keys(transactionTypes).find(
          key => transactionTypes[key] === filters.type.toUpperCase()
        );
        
        if (tableKey) {
          return await this.getTransactionsFromTable(tableKey, filters, page, limit);
        } else {
          return {
            data: [],
            totalRecords: 0,
            currentPage: page,
            totalPages: 0,
            hasNextPage: false,
            hasPrevPage: false
          };
        }
      }

      // Query all tables and combine results
      for (const tableName of tableNames) {
        const { whereClause, params } = this.buildWhereClause(filters);
        
        const query = `
          SELECT *, '${transactionTypes[tableName]}' as transaction_type FROM ${tableName} 
          ${whereClause}
        `;
        
        try {
          const [rows] = await connection.execute(query, params);
          allResults.push(...rows);
        } catch (error) {
          console.error(`Error querying table ${tableName}:`, error);
          // Continue with other tables even if one fails
        }
      }

      // Sort by timestamp descending
      allResults.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      // Apply pagination to combined results
      const totalRecords = allResults.length;
      const offset = (page - 1) * limit;
      const paginatedData = allResults.slice(offset, offset + limit);

      return {
        data: paginatedData,
        totalRecords,
        currentPage: page,
        totalPages: Math.ceil(totalRecords / limit),
        hasNextPage: page < Math.ceil(totalRecords / limit),
        hasPrevPage: page > 1
      };
    } catch (error) {
      console.error('Error fetching all transactions:', error);
      throw error;
    }
  }

  static async getTransactionStats(filters = {}) {
    try {
      const connection = await dbInstance.getConnection();
      const tableNames = this.getTableNames();
      const stats = {
        totalTransactions: 0,
        totalAmount: 0,
        transactionsByType: {},
        averageAmount: 0
      };

      for (const tableName of tableNames) {
        const { whereClause, params } = this.buildWhereClause(filters);
        
        const query = `
          SELECT 
            COUNT(*) as count,
            SUM(amount) as total_amount,
            AVG(amount) as avg_amount,
            type
          FROM ${tableName} 
          ${whereClause}
          GROUP BY type
        `;
        
        try {
          const [rows] = await connection.execute(query, params);
          
          for (const row of rows) {
            stats.totalTransactions += row.count;
            stats.totalAmount += row.total_amount || 0;
            stats.transactionsByType[row.type] = {
              count: row.count,
              totalAmount: row.total_amount || 0,
              averageAmount: row.avg_amount || 0
            };
          }
        } catch (error) {
          console.error(`Error getting stats from table ${tableName}:`, error);
        }
      }

      stats.averageAmount = stats.totalTransactions > 0 ? stats.totalAmount / stats.totalTransactions : 0;

      return stats;
    } catch (error) {
      console.error('Error fetching transaction statistics:', error);
      throw error;
    }
  }
}

export default Transaction;
