import { Client } from "pg";

export const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

client
  .connect()
  .then(() => console.log("Connected to the Database!"))
  .catch((err) => console.error("connection error", err.stack));
