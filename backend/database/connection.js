import {createConnection} from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

class DatabaseConnection {
  constructor() {
    this.connection = null;
    this.isConnected = false;
  }

  async connect(withDB = true) {
    if (this.connection && this.isConnected) {
      return this.connection;
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

      this.isConnected = true;
      console.log('Database connected successfully');
      return this.connection;
    } catch (error) {
      console.error('Database connection failed:', {
        message: error.message,
        code: error.code,
        errno: error.errno,
        sqlState: error.sqlState
      });
    
      throw new Error('Database connection failed');
    }
  }

  async getConnection() {
    return await this.connect();
  }
}

const dbInstance = new DatabaseConnection();
export default dbInstance;
