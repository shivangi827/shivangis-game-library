import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

export interface ScoreEntry {
  timeMode: number;
  name: string;
  score: number;
  words: number;
  streak: number;
  date: string;
}

let doc: GoogleSpreadsheet | null = null;
let initFailed = false;

async function getDoc(): Promise<GoogleSpreadsheet | null> {
  if (doc) return doc;
  if (initFailed) return null;

  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const key = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  const sheetId = process.env.GOOGLE_SHEET_ID;

  if (!email || !key || !sheetId) {
    console.log('Google Sheets not configured — leaderboard will use client-side storage only');
    initFailed = true;
    return null;
  }

  try {
    const auth = new JWT({
      email,
      key,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    doc = new GoogleSpreadsheet(sheetId, auth);
    await doc.loadInfo();

    const sheet = doc.sheetsByIndex[0];
    if (sheet.headerValues.length === 0) {
      await sheet.setHeaderRow(['timeMode', 'name', 'score', 'words', 'streak', 'date']);
    }

    console.log('Google Sheets leaderboard connected');
    return doc;
  } catch (err) {
    console.error('Google Sheets init failed:', err);
    initFailed = true;
    return null;
  }
}

export async function getScores(timeMode: number): Promise<ScoreEntry[]> {
  const d = await getDoc();
  if (!d) return [];

  try {
    const sheet = d.sheetsByIndex[0];
    const rows = await sheet.getRows();

    return rows
      .filter(r => Number(r.get('timeMode')) === timeMode)
      .map(r => ({
        timeMode: Number(r.get('timeMode')),
        name: String(r.get('name') || 'Anonymous'),
        score: Number(r.get('score')),
        words: Number(r.get('words')),
        streak: Number(r.get('streak')),
        date: String(r.get('date')),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
  } catch (err) {
    console.error('Failed to read scores:', err);
    return [];
  }
}

export async function addScore(entry: ScoreEntry): Promise<boolean> {
  const d = await getDoc();
  if (!d) return false;

  try {
    const sheet = d.sheetsByIndex[0];
    await sheet.addRow({
      timeMode: String(entry.timeMode),
      name: entry.name,
      score: String(entry.score),
      words: String(entry.words),
      streak: String(entry.streak),
      date: entry.date,
    });
    return true;
  } catch (err) {
    console.error('Failed to add score:', err);
    return false;
  }
}

export async function isConfigured(): Promise<boolean> {
  const d = await getDoc();
  return d !== null;
}
