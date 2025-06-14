import dbInstance from '../database/connection.js';
import transactionTypes from '../utils/transaction_types.js';

class Transaction {
  static getTransactionTypes() {
    return Object.values(transactionTypes);
  }

  static getTableNames() {
    return Object.keys(transactionTypes);
  }

  static buildWhereClause(filters, startIndex = 1) {
    const conditions = [];
    const params = [];
    let paramIndex = startIndex;

    // Filter by type
    if (filters.type && this.getTransactionTypes().includes(filters.type.toUpperCase())) {
      conditions.push(`type = $${paramIndex}`);
      params.push(filters.type.toUpperCase());
      paramIndex++;
    }

    // Filter by date (exact day)
    if (filters.date) {
      conditions.push(`DATE(timestamp) = $${paramIndex}`);
      params.push(filters.date);
      paramIndex++;
    }

    // Filter by date range
    if (filters.startDate && filters.endDate) {
      conditions.push(`DATE(timestamp) BETWEEN $${paramIndex} AND $${paramIndex + 1}`);
      params.push(filters.startDate, filters.endDate);
      paramIndex += 2;
    } else if (filters.startDate) {
      conditions.push(`DATE(timestamp) >= $${paramIndex}`);
      params.push(filters.startDate);
      paramIndex++;
    } else if (filters.endDate) {
      conditions.push(`DATE(timestamp) <= $${paramIndex}`);
      params.push(filters.endDate);
      paramIndex++;
    }

    // Filter by amount range
    if (filters.minAmount !== undefined && filters.maxAmount !== undefined) {
      conditions.push(`amount BETWEEN $${paramIndex} AND $${paramIndex + 1}`);
      params.push(parseFloat(filters.minAmount), parseFloat(filters.maxAmount));
      paramIndex += 2;
    } else if (filters.minAmount !== undefined) {
      conditions.push(`amount >= $${paramIndex}`);
      params.push(parseFloat(filters.minAmount));
      paramIndex++;
    } else if (filters.maxAmount !== undefined) {
      conditions.push(`amount <= $${paramIndex}`);
      params.push(parseFloat(filters.maxAmount));
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    return { whereClause, params, nextParamIndex: paramIndex };
  }

  static async getTransactionsFromTable(tableName, filters = {}, page = 1, limit = 10) {
    let client;
    try {
      const pool = await dbInstance.getConnection();
      client = await pool.connect();
      const offset = (page - 1) * limit;
      const { whereClause, params } = this.buildWhereClause(filters);

      // Get total count
      const countQuery = `SELECT COUNT(*) as total FROM ${tableName} ${whereClause}`;
      const countResult = await client.query(countQuery, params);
      const totalRecords = parseInt(countResult.rows[0].total);

      // Get paginated data
      const dataQuery = `
        SELECT * FROM ${tableName} 
        ${whereClause} 
        ORDER BY timestamp DESC 
        LIMIT $${params.length + 1} OFFSET $${params.length + 2}
      `;
      const [rows] = await connection.execute(dataQuery, [...params, limit.toString(), offset.toString()]);

      return {
        data: result.rows,
        totalRecords,
        currentPage: page,
        totalPages: Math.ceil(totalRecords / limit),
        hasNextPage: page < Math.ceil(totalRecords / limit),
        hasPrevPage: page > 1
      };
    } catch (error) {
      console.error(`Error fetching transactions from ${tableName}:`, error);
      throw error;
    } finally {
      if (client) {
        client.release();
      }
    }
  }

  static async getAllTransactions(filters = {}, page = 1, limit = 10) {
    let client;
    try {
      const pool = await dbInstance.getConnection();
      client = await pool.connect();
      const offset = (page - 1) * limit;
      const tableNames = this.getTableNames();

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

      let totalParams = [];
      let currentParamCount = 1;

      // Define all possible columns across all transaction tables with their types
      // This ensures that all UNION ALL queries have the same number of columns and compatible types
      const allColumns = [
        { name: 'id', type: 'integer' },
        { name: 'transactionId', type: 'text' },
        { name: 'type', type: 'text' },
        { name: 'amount', type: 'double precision' },
        { name: 'timestamp', type: 'timestamp with time zone' },
        { name: 'currency', type: 'text' },
        { name: 'originalSMS', type: 'text' },
        { name: 'sender', type: 'text' },
        { name: 'recipient', type: 'text' },
        { name: 'recipientNumber', type: 'text' },
        { name: 'fee', type: 'double precision' },
        { name: 'agent', type: 'text' },
        { name: 'agentNumber', type: 'text' },
        { name: 'purchasedItem', type: 'text' },
        { name: 'purchasedUtility', type: 'text' },
        { name: 'meterToken', type: 'text' },
        { name: 'thirdParty', type: 'text' },
        { name: 'externalTransactionId', type: 'text' },
      ];

      const unionQueries = tableNames.map(tableName => {
        const { whereClause, params } = this.buildWhereClause(filters, currentParamCount);
        totalParams.push(...params);
        currentParamCount += params.length;

        // Dynamically select columns, using NULL as type for columns not present in this table
        const tableSpecificColumns = {
          incoming: ['id', 'transactionId', 'type', 'amount', 'timestamp', 'currency', 'originalSMS', 'sender'],
          reclaimed: ['id', 'transactionId', 'type', 'amount', 'timestamp', 'currency', 'originalSMS'],
          payment: ['id', 'transactionId', 'type', 'amount', 'timestamp', 'currency', 'originalSMS', 'recipient', 'recipientNumber', 'fee'],
          bank_deposit: ['id', 'transactionId', 'type', 'amount', 'timestamp', 'currency', 'originalSMS'],
          transfer: ['id', 'transactionId', 'type', 'amount', 'timestamp', 'currency', 'originalSMS', 'recipient', 'recipientNumber', 'fee'],
          withdrawn: ['id', 'transactionId', 'type', 'amount', 'timestamp', 'currency', 'originalSMS', 'agent', 'agentNumber', 'fee'],
          airtime_bill: ['id', 'transactionId', 'type', 'amount', 'timestamp', 'currency', 'originalSMS', 'purchasedItem'],
          utility_bill: ['id', 'transactionId', 'type', 'amount', 'timestamp', 'currency', 'originalSMS', 'purchasedUtility', 'meterToken', 'fee'],
          third_party: ['id', 'transactionId', 'type', 'amount', 'timestamp', 'currency', 'originalSMS', 'thirdParty', 'externalTransactionId', 'fee'],
        };

        const selectedColumns = allColumns.map(col => {
          if (tableSpecificColumns[tableName] && tableSpecificColumns[tableName].includes(col.name)) {
            return col.name; // Column exists in this table
          } else {
            return `NULL::${col.type} as "${col.name}"`; // Column does not exist, return NULL cast to correct type
          }
        }).join(',');

        return `
          SELECT 
            ${selectedColumns},
            '${tableName}' as table_name
          FROM ${tableName}
          ${whereClause}
        `;
      }).join(' UNION ALL ');

      // Get total count using a subquery
      const countQuery = `
        WITH combined_transactions AS (
          ${unionQueries}
        )
        SELECT COUNT(*) as total FROM combined_transactions
      `;
      const countResult = await client.query(countQuery, totalParams); // Use totalParams
      const totalRecords = parseInt(countResult.rows[0].total);

      // Get paginated data using a subquery
      const dataQuery = `
        WITH combined_transactions AS (
          ${unionQueries}
        )
        SELECT * FROM combined_transactions
        ORDER BY timestamp DESC
        LIMIT $${totalParams.length + 1} OFFSET $${totalParams.length + 2}
      `;
      totalParams.push(limit, offset); // Add limit and offset to the end of totalParams
      const result = await client.query(dataQuery, totalParams); // Use totalParams

      const totalPages = Math.ceil(totalRecords / limit);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;

      return {
        data: result.rows,
        totalRecords,
        currentPage: page,
        totalPages,
        hasNextPage,
        hasPrevPage
      };
    } catch (error) {
      console.error('Error fetching all transactions:', error);
      throw error;
    } finally {
      if (client) {
        client.release();
      }
    }
  }

  static async getTransactionStats(filters = {}) {
    let client;
    try {
      const pool = await dbInstance.getConnection();
      client = await pool.connect();
      const tableNames = this.getTableNames();
      let totalTransactions = 0;
      let totalAmount = 0;

      for (const tableName of tableNames) {
        const { whereClause, params } = this.buildWhereClause(filters);
        
        const query = `
          SELECT 
            COUNT(*) as count,
            SUM(amount) as sum
          FROM ${tableName}
          ${whereClause}
        `;
        
        try {
          const result = await client.query(query, params);
          totalTransactions += parseInt(result.rows[0].count);
          totalAmount += parseFloat(result.rows[0].sum || 0);
        } catch (error) {
          console.error(`Error getting stats from table ${tableName}:`, error);
        }
      }

      return {
        totalTransactions,
        totalAmount
      };
    } catch (error) {
      console.error('Error fetching transaction statistics:', error);
      throw error;
    } finally {
      if (client) {
        client.release();
      }
    }
  }
}

export default Transaction;
