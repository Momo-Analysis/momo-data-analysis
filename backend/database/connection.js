import { createConnection } from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

class DatabaseConnection {
  constructor() {
    this.connection = null;
    this.isConnected = false;
  }

  async connect() {
    if (this.connection && this.isConnected) {
      return this.connection;
    }

    try {
      this.connection = await createConnection({
        host: process.env.host || 'localhost',
        user: process.env.user || 'root',
        password: process.env.password || '',
        database: process.env.database || 'momodb',
        dateStrings: true,
        connectTimeout: 10000,
        acquireTimeout: 10000,
      });
      
      this.isConnected = true;
      console.log('✅ Database connected successfully');
      return this.connection;
    } catch (error) {
      console.error('❌ Database connection failed:', error.message);
      console.log('⚠️  API will run with mock data for development');
      this.isConnected = false;
      return this.createMockConnection();
    }
  }

  createMockConnection() {
    return {
      execute: async (query, params = []) => {
        console.log('🔧 Mock query executed:', query.substring(0, 50) + '...');
        
        // Return appropriate mock data based on query type
        if (query.includes('COUNT(*)')) {
          return [[{ total: 0 }]];
        }
        
        if (query.toLowerCase().includes('select')) {
          // Return mock transaction data
          return [[
            {
              id: 1,
              transactionId: 'MOCK123456',
              type: 'INCOMING',
              amount: 5000,
              timestamp: '2024-01-15 10:30:00',
              currency: 'RWF',
              sender: 'Mock User',
              originalSMS: 'Mock SMS: You have received 5000 RWF from Mock User',
              transaction_type: 'INCOMING'
            }
          ]];
        }
        
        return [[]];
      },
      
      query: async (query, params = []) => {
        console.log('🔧 Mock query executed:', query.substring(0, 50) + '...');
        return [[]];
      },
      
      end: () => {
        console.log('🔧 Mock connection closed');
      }
    };
  }

  async getConnection() {
    return await this.connect();
  }
}

const dbInstance = new DatabaseConnection();
export default dbInstance;
