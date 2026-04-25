import { getDb } from '../../db';

export interface CodeCrackScoreEntry {
  difficulty: string;
  timeMode: number;
  name: string;
  score: number;
  correct: number;
  total: number;
  streak: number;
  date: string;
}

export async function getCodeCrackScores(difficulty: string, timeMode: number): Promise<CodeCrackScoreEntry[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    const result = await db.execute({
      sql: 'SELECT difficulty, time_mode, name, score, correct, total, streak, date FROM codecrack_scores WHERE difficulty = ? AND time_mode = ? ORDER BY score DESC LIMIT 10',
      args: [difficulty, timeMode],
    });

    return result.rows.map(r => ({
      difficulty: String(r.difficulty),
      timeMode: Number(r.time_mode),
      name: String(r.name),
      score: Number(r.score),
      correct: Number(r.correct),
      total: Number(r.total),
      streak: Number(r.streak),
      date: String(r.date),
    }));
  } catch (err) {
    console.error('Failed to read codecrack scores:', err);
    return [];
  }
}

export async function addCodeCrackScore(entry: CodeCrackScoreEntry): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    await db.execute({
      sql: 'INSERT INTO codecrack_scores (difficulty, time_mode, name, score, correct, total, streak, date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      args: [entry.difficulty, entry.timeMode, entry.name, entry.score, entry.correct, entry.total, entry.streak, entry.date],
    });
    return true;
  } catch (err) {
    console.error('Failed to add codecrack score:', err);
    return false;
  }
}
