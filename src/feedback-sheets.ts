import { GoogleSpreadsheet, GoogleSpreadsheetWorksheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

export interface FeedbackEntry {
  rating: number;
  message: string;
  page: string;
  date: string;
}

let sheet: GoogleSpreadsheetWorksheet | null = null;
let initFailed = false;

async function getSheet(): Promise<GoogleSpreadsheetWorksheet | null> {
  if (sheet) return sheet;
  if (initFailed) return null;

  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const key = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  const sheetId = process.env.GOOGLE_SHEET_ID;

  if (!email || !key || !sheetId) {
    initFailed = true;
    return null;
  }

  try {
    const auth = new JWT({
      email,
      key,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const doc = new GoogleSpreadsheet(sheetId, auth);
    await doc.loadInfo();

    let feedbackSheet = doc.sheetsByTitle['Feedback'];
    if (!feedbackSheet) {
      feedbackSheet = await doc.addSheet({
        title: 'Feedback',
        headerValues: ['date', 'rating', 'message', 'page'],
      });
    }

    sheet = feedbackSheet;
    console.log('Feedback sheet connected');
    return sheet;
  } catch (err) {
    console.error('Feedback sheet init failed:', err);
    initFailed = true;
    return null;
  }
}

export async function addFeedback(entry: FeedbackEntry): Promise<boolean> {
  const s = await getSheet();
  if (!s) {
    console.log('Feedback (no sheet):', JSON.stringify(entry));
    return false;
  }

  try {
    await s.addRow({
      date: entry.date,
      rating: String(entry.rating),
      message: entry.message,
      page: entry.page,
    });
    return true;
  } catch (err) {
    console.error('Failed to save feedback:', err);
    return false;
  }
}
