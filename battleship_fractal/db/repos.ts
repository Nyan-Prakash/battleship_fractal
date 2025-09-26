import { db } from './client';
import { gameStates } from './schema';
import { eq } from 'drizzle-orm';

// Adjust to your real type if you have a shared GameState
export type GameStateT = any;

export async function upsertGameState(
  code: string,
  state: GameStateT,
) {
  await db
    .insert(gameStates)
    .values({
      code,
      state,
    })
    .onConflictDoUpdate({
      target: gameStates.code,
      set: {
        state,
        updatedAt: new Date(),
      },
    });
}

export async function getGameState(code: string) {
  const rows = await db.select().from(gameStates).where(eq(gameStates.code, code)).limit(1);
  return rows[0] ?? null;
}

export async function listJoinableCodes() {
  const rows = await db
    .select({ code: gameStates.code })
    .from(gameStates)
  return rows.map(r => r.code);
}
