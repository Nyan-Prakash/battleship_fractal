import 'dotenv/config';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';

// Important in vite-express dev: avoid multiple clients on hot-reload
const globalForDb = globalThis as unknown as { _sql?: ReturnType<typeof postgres> };

export const sql =
  globalForDb._sql ??
  postgres("postgresql://postgres:1234@db.qtgrwsfihdeeifgiosxd.supabase.co:5432/postgres?sslmode=require"!, {
    // For Supabase, either sslmode in URL or ssl: 'require' here
    // Bun + postgres-js handles SSL via the URL ("?sslmode=require") cleanly.
    // If you prefer explicit:
    // ssl: 'require',
    max: 10
  });

globalForDb._sql = sql;

export const db = drizzle(sql);
