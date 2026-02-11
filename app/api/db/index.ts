// db/index.ts
// Important File 2 of 6
import { neon } from '@neondatabase/serverless'; // Neon's serverless driver
import { drizzle } from 'drizzle-orm/neon-http'; // Drizzle's adapter for neon-http
import * as schema from '@lib/db/schema'; // Import all schema definitions

// The 'dotenv/config' import loads environment variables from a .env file.
// While Next.js handles this automatically for the standard .env.local,
// including it is a good practice for development scripts (like Drizzle migrations).
import 'dotenv/config'; 

// Validate that the database URL is set to prevent runtime errors.
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL must be a Neon postgres connection string');
}

// Create a Neon client instance from the environment variable.
const sql = neon(process.env.DATABASE_URL);

// Create and export the Drizzle ORM client, including the schema.
// The client will be a singleton, meaning only one instance is created.
export const db = drizzle(sql, { schema });
