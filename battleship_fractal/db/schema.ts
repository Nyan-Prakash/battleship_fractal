import { pgTable, text, jsonb, timestamp } from 'drizzle-orm/pg-core';

export const gameStates = pgTable('game_states', {
  code: text('code').primaryKey(),
  state: jsonb('state').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
