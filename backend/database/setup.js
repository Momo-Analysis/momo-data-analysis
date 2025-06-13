import connection from "./connection.js";
import tableQueries from "./tableCreationQueries.js";
import dotenv from "dotenv";
import {storeSMSData} from "../scripts/processTransactions.js";
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
    return storeSMSData(connection);
  })
  .then(() => {
    console.log("SMS data inserted successfully.");
    connection.end();
  })
  .catch((error) => {
    console.error(`Database setup failed: ${error.message}`);
    connection.end();
  });
