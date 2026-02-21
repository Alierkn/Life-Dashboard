import { sql } from './db.js';

export default async function handler(req, res) {
  try {
    const result = await sql`select 1 as ok`;
    res.status(200).json({ ok: true, db: 'connected' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  }
}
