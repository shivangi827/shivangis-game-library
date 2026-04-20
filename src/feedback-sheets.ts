import { getDb } from './db';

export interface FeedbackEntry {
  rating: number;
  message: string;
  page: string;
  date: string;
}

export async function addFeedback(entry: FeedbackEntry): Promise<boolean> {
  const db = await getDb();
  if (!db) {
    console.log('Feedback (no db):', JSON.stringify(entry));
    return false;
  }

  try {
    await db.execute({
      sql: 'INSERT INTO feedback (rating, message, page, date) VALUES (?, ?, ?, ?)',
      args: [entry.rating, entry.message, entry.page, entry.date],
    });
    return true;
  } catch (err) {
    console.error('Failed to save feedback:', err);
    return false;
  }
}
