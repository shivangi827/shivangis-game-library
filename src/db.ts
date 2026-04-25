import { createClient, Client } from '@libsql/client';

let client: Client | null = null;
let initFailed = false;

export async function getDb(): Promise<Client | null> {
  if (client) return client;
  if (initFailed) return null;

  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url || !authToken) {
    console.log('Turso not configured — using client-side storage only');
    initFailed = true;
    return null;
  }

  try {
    client = createClient({ url, authToken });

    await client.batch([
      `CREATE TABLE IF NOT EXISTS scores (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        time_mode INTEGER NOT NULL,
        name TEXT NOT NULL,
        score INTEGER NOT NULL,
        words INTEGER NOT NULL,
        streak INTEGER NOT NULL,
        date TEXT NOT NULL,
        game_mode TEXT NOT NULL DEFAULT 'regular'
      )`,
      `CREATE TABLE IF NOT EXISTS codecrack_scores (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        difficulty TEXT NOT NULL,
        time_mode INTEGER NOT NULL,
        name TEXT NOT NULL,
        score INTEGER NOT NULL,
        correct INTEGER NOT NULL,
        total INTEGER NOT NULL,
        streak INTEGER NOT NULL,
        date TEXT NOT NULL
      )`,
      `CREATE TABLE IF NOT EXISTS feedback (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        rating INTEGER NOT NULL,
        message TEXT,
        page TEXT,
        date TEXT NOT NULL
      )`,
    ]);

    console.log('Turso database connected');
    return client;
  } catch (err) {
    console.error('Turso init failed:', err);
    initFailed = true;
    return null;
  }
}
