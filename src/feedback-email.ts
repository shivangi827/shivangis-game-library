import { FeedbackEntry } from './feedback-sheets';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const TO_EMAIL = 'contactgameslibrary@proton.me';
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'feedback@resend.dev';

export function isEmailConfigured(): boolean {
  return !!RESEND_API_KEY;
}

export async function sendFeedbackEmail(entry: FeedbackEntry): Promise<boolean> {
  if (!RESEND_API_KEY) return false;

  const stars = '★'.repeat(entry.rating) + '☆'.repeat(5 - entry.rating);
  const subject = `[Game Library] ${stars} ${entry.rating}/5 from ${entry.page}`;
  const body = [
    `<h2>New Feedback</h2>`,
    `<p><strong>Rating:</strong> ${stars} (${entry.rating}/5)</p>`,
    `<p><strong>Page:</strong> ${entry.page}</p>`,
    `<p><strong>Date:</strong> ${entry.date}</p>`,
    entry.message
      ? `<p><strong>Message:</strong></p><blockquote style="border-left:3px solid #FF7A3D;padding-left:12px;color:#555">${entry.message}</blockquote>`
      : '<p><em>No message</em></p>',
  ].join('\n');

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: TO_EMAIL,
        subject,
        html: body,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('Resend error:', err);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Failed to send feedback email:', err);
    return false;
  }
}
