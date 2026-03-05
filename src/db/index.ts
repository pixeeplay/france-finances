import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

// Only initialize if DATABASE_URL is provided (server-side only)
const sql = connectionString ? postgres(connectionString) : null;

export const db = sql ? drizzle(sql, { schema }) : null;

/** Check if database is available */
export function isDbAvailable(): boolean {
  return db !== null;
}
