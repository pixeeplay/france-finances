import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

// Only initialize if DATABASE_URL is provided (server-side only)
const sql = connectionString
  ? postgres(connectionString, {
      max: parseInt(process.env.DB_POOL_MAX || "10", 10),
      idle_timeout: 20,
      connect_timeout: 10,
      connection: { statement_timeout: 30 },
      onnotice: () => {}, // suppress NOTICE messages
    })
  : null;

// Log connection-level errors gracefully (prevent unhandled crashes)
if (sql) {
  sql.unsafe("SELECT 1").catch((err: unknown) => {
    console.error("[DB] Initial connection check failed:", err instanceof Error ? err.message : err);
  });
}

export const db = sql ? drizzle(sql, { schema }) : null;

/** Check if database is available */
export function isDbAvailable(): boolean {
  return db !== null;
}
