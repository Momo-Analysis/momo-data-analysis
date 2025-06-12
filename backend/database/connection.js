import { createConnection } from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

const connection = await createConnection({
  host: process.env.host,
  user: process.env.user,
  password: process.env.password,
});

export default connection;
