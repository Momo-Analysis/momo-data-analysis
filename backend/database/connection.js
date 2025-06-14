import pkg from 'pg';
const { Pool } = pkg;
import dotenv from "dotenv";

dotenv.config();

class DatabaseConnection {
  constructor() {
    this.pool = null;
    this.isConnected = false;
  }

  async connect() {
    if (this.pool && this.isConnected) {
      return this.pool;
    }

    try {
      this.connection = await createConnection({
        host: process.env.host || 'localhost',
        user: process.env.user || 'root',
        password: process.env.password || '',
        ...(withDB ? {database: process.env.database || 'momodb'} : {}),
        dateStrings: true,
        connectTimeout: 10000,
      });

      // Test the connection
      const client = await this.pool.connect();
      client.release();
      
      this.isConnected = true;
      console.log('Database connected successfully');
      return this.pool;
    } catch (error) {
      console.error('Database connection failed:', error.message);
      throw new Error('Database connection failed');
    }
  }

  async getConnection() {
    return await this.connect();
  }
}

const dbInstance = new DatabaseConnection();
export default dbInstance;
