// Design the transactions table in MySQL with the specified fields: id (INT, AUTO_INCREMENT, PRIMARY KEY), type (VARCHAR), amount (FLOAT), timestamp (DATETIME), and details (JSON).
// Set up the node-mysql2 library and implement the database connection logic in the backend.
// Write basic functions to connect to the MySQL database and execute raw queries.

import connection from "./connection.js";
import tableQueries from "./tableQueries.js";
import dotenv from "dotenv";
dotenv.config();

const createDatabaseQuery = `CREATE DATABASE IF NOT EXISTS ${process.env.database};`;

const createTables = async (connection) => {
  try {
    await connection.query(createDatabaseQuery);
    console.log(`Database ${process.env.database} created or already exists.`);
    await connection.query(`USE ${process.env.database}`);
    console.log(`Using database ${process.env.database}.`);
    await Promise.all(
      tableQueries.map(async (query) => await connection.query(query))
    );
    console.log("All tables created successfully.");
  } catch (error) {
    console.error(`Error creating tables: ${error.message}`);
  }
};

createTables(connection)
  .then(() => {
    console.log("Database setup complete.");
    connection.end();
  })
  .catch((error) => {
    console.error(`Database setup failed: ${error.message}`);
    connection.end();
  });
