import { sql } from '../db.js';

/** Get or create user by device_id, return user id */
export async function getOrCreateUser(deviceId) {
  const existing = await sql`
    SELECT id, user_name, theme, xp, level, left_layout, right_layout
    FROM users WHERE device_id = ${deviceId} LIMIT 1
  `;
  if (existing.length > 0) {
    return existing[0];
  }
  const inserted = await sql`
    INSERT INTO users (device_id) VALUES (${deviceId})
    RETURNING id, user_name, theme, xp, level, left_layout, right_layout
  `;
  return inserted[0];
}

/** Update user profile */
export async function updateUser(userId, data) {
  if (data.user_name != null) {
    await sql`UPDATE users SET user_name = ${data.user_name}, updated_at = now() WHERE id = ${userId}`;
  }
  if (data.theme != null) {
    await sql`UPDATE users SET theme = ${data.theme}, updated_at = now() WHERE id = ${userId}`;
  }
  if (data.xp != null) {
    await sql`UPDATE users SET xp = ${data.xp}, updated_at = now() WHERE id = ${userId}`;
  }
  if (data.level != null) {
    await sql`UPDATE users SET level = ${data.level}, updated_at = now() WHERE id = ${userId}`;
  }
  if (data.left_layout != null) {
    await sql`UPDATE users SET left_layout = ${JSON.stringify(data.left_layout)}::jsonb, updated_at = now() WHERE id = ${userId}`;
  }
  if (data.right_layout != null) {
    await sql`UPDATE users SET right_layout = ${JSON.stringify(data.right_layout)}::jsonb, updated_at = now() WHERE id = ${userId}`;
  }
}
