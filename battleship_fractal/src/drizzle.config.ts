import 'dotenv/config';
import type { Config } from 'drizzle-kit';

export default {
  // NOTE: config is in src/, so go up one directory to reach /db/schema.ts
  schema: './db/schema.ts',
  out: '../drizzle',              // put generated SQL at project root
  dialect: 'postgresql',
  dbCredentials: {
    url: "postgresql://postgres:1234@db.qtgrwsfihdeeifgiosxd.supabase.co:5432/postgres?sslmode=require",
  },
} satisfies Config;
