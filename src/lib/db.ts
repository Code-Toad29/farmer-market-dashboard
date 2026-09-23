

import { Pool, QueryResultRow } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function query<T extends QueryResultRow>(text: string, values?: unknown[]) {
  const result = await pool.query<T>(text, values);
  return result.rows;
}

export async function testConnection() {
  try {
    const result = await query("SELECT NOW()");
    console.log("✅ Database connected:", result[0]);
    return true;
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    return false;
  }
}