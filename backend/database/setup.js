import dbInstance from './connection.js';
import tableCreationQueries from './tableCreationQueries.js';
import dotenv from "dotenv";
import {storeSMSData} from "../scripts/processTransactions.js";
dotenv.config();

const createDatabaseQuery = `CREATE DATABASE IF NOT EXISTS ${process.env.database};`;

async function setupDatabase() {
  try {
    const pool = await dbInstance.connect();
    
    // Create tables
    for (const query of tableCreationQueries) {
      try {
        await pool.query(query);
        console.log('Table created successfully');
      } catch (error) {
        console.error('Error creating table:', error.message);
      }
    }
    
    console.log('Database setup completed');
    return storeSMSData(pool);
  } catch (error) {
    console.error('Database setup failed:', error.message);
    process.exit(1);
  }
}

setupDatabase()
  .then(() => {
    console.log("SMS data inserted successfully.");
    process.exit(0);
  })
  .catch((error) => {
    console.error(`Database setup failed: ${error.message}`);
    process.exit(1);
  });
