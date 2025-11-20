import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

// Only create database connection if DATABASE_URL is provided
// This allows the app to run with in-memory storage when DATABASE_URL is not set
let pool: Pool | null = null;
let db: ReturnType<typeof drizzle> | null = null;

if (process.env.DATABASE_URL) {
  pool = new Pool({ connectionString: process.env.DATABASE_URL });
  db = drizzle({ client: pool, schema });
} else {
  console.log('⚠️  DATABASE_URL not set - using in-memory storage');
}

// Helper function to assert db is available (throws if not)
export function assertDb(): NonNullable<typeof db> {
  if (!db) {
    throw new Error('Database connection not available. DATABASE_URL must be set to use DatabaseStorage.');
  }
  return db;
}

export { pool, db };