import { getDb } from '../../db';

export interface ScoreEntry {
  gameMode: string;
  timeMode: number;
  name: string;
  score: number;
  words: number;
  streak: number;
  date: string;
}

export async function getScores(gameMode: string, timeMode: number): Promise<ScoreEntry[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    const result = await db.execute({
      sql: 'SELECT game_mode, time_mode, name, score, words, streak, date FROM scores WHERE game_mode = ? AND time_mode = ? ORDER BY score DESC LIMIT 10',
      args: [gameMode, timeMode],
    });

    return result.rows.map(r => ({
      gameMode: String(r.game_mode),
      timeMode: Number(r.time_mode),
      name: String(r.name),
      score: Number(r.score),
      words: Number(r.words),
      streak: Number(r.streak),
      date: String(r.date),
    }));
  } catch (err) {
    console.error('Failed to read scores:', err);
    return [];
  }
}

export async function addScore(entry: ScoreEntry): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    await db.execute({
      sql: 'INSERT INTO scores (game_mode, time_mode, name, score, words, streak, date) VALUES (?, ?, ?, ?, ?, ?, ?)',
      args: [entry.gameMode, entry.timeMode, entry.name, entry.score, entry.words, entry.streak, entry.date],
    });
    return true;
  } catch (err) {
    console.error('Failed to add score:', err);
    return false;
  }
}

export async function isConfigured(): Promise<boolean> {
  const db = await getDb();
  return db !== null;
}
