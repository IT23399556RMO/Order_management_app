import { getDatabase } from './database';

export type SessionMode = 'close' | '12h' | '1d';

export type User = {
  id: number;
  username: string;
};

export function normalizeUsername(value: string) {
  return value.trim().toLowerCase();
}

export function sanitizeUsername(value: string) {
  return normalizeUsername(value).replace(/[^a-z]/g, '');
}

export function isValidUsername(value: string) {
  return /^[a-z]+$/.test(value);
}

export async function createUser(username: string, password: string) {
  const db = await getDatabase();
  const cleanUsername = normalizeUsername(username);

  if (!cleanUsername) throw new Error('Username is required.');
  if (!isValidUsername(cleanUsername)) {
    throw new Error('Username can contain lowercase letters only.');
  }
  if (!password) throw new Error('Password is required.');

  const existing = await db.getFirstAsync<{ id: number }>(
    `SELECT id FROM users WHERE username = ? COLLATE NOCASE`,
    cleanUsername
  );

  if (existing) throw new Error('Username already exists.');

  try {
    const result = await db.runAsync(
      `INSERT INTO users (username, password)
       VALUES (?, ?)`,
      cleanUsername,
      password
    );

    await db.runAsync(
      `INSERT INTO user_settings (user_id, session_mode)
       VALUES (?, 'close')`,
      result.lastInsertRowId
    );

    return result.lastInsertRowId;
  } catch (error) {
    const message = error instanceof Error ? error.message.toLowerCase() : '';
    if (message.includes('unique')) {
      throw new Error('Username already exists.');
    }
    throw new Error('Could not create the account.');
  }
}

export async function loginUser(username: string, password: string) {
  const db = await getDatabase();
  const cleanUsername = normalizeUsername(username);

  return (
    (await db.getFirstAsync<User>(
      `SELECT id, username
       FROM users
       WHERE username = ? COLLATE NOCASE
       AND password = ?`,
      cleanUsername,
      password
    )) ?? null
  );
}

export async function getUsers() {
  const db = await getDatabase();
  return db.getAllAsync<User>(
    `SELECT id, username
     FROM users
     ORDER BY id ASC`
  );
}

export async function getLastUsername() {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ last_username: string | null }>(
    `SELECT last_username FROM device_settings WHERE id = 1`
  );
  return row?.last_username ?? '';
}

export async function setLastUsername(username: string) {
  const db = await getDatabase();
  await db.runAsync(
    `UPDATE device_settings SET last_username = ? WHERE id = 1`,
    normalizeUsername(username)
  );
}

export async function getSessionMode(userId: number): Promise<SessionMode> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ session_mode: SessionMode }>(
    `SELECT session_mode FROM user_settings WHERE user_id = ?`,
    userId
  );
  return row?.session_mode ?? 'close';
}

export async function setSessionMode(userId: number, mode: SessionMode) {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT INTO user_settings (user_id, session_mode)
     VALUES (?, ?)
     ON CONFLICT(user_id)
     DO UPDATE SET session_mode = excluded.session_mode`,
    userId,
    mode
  );
}

export async function saveSession(userId: number, expiresAt: string) {
  const db = await getDatabase();
  await db.runAsync(`DELETE FROM active_session`);
  await db.runAsync(
    `INSERT INTO active_session (id, user_id, expires_at)
     VALUES (1, ?, ?)`,
    userId,
    expiresAt
  );
}

export async function getSavedSession() {
  const db = await getDatabase();
  return db.getFirstAsync<{
    user_id: number;
    expires_at: string;
  }>(
    `SELECT user_id, expires_at
     FROM active_session
     WHERE id = 1`
  );
}

export async function clearSavedSession() {
  const db = await getDatabase();
  await db.runAsync(`DELETE FROM active_session`);
}

export async function getUserById(userId: number) {
  const db = await getDatabase();
  return db.getFirstAsync<User>(
    `SELECT id, username FROM users WHERE id = ?`,
    userId
  );
}

export async function updateUsername(userId: number, username: string) {
  const db = await getDatabase();
  const cleanUsername = normalizeUsername(username);

  if (!cleanUsername) throw new Error('Username is required.');
  if (!isValidUsername(cleanUsername)) {
    throw new Error('Username can contain lowercase letters only.');
  }

  const duplicate = await db.getFirstAsync<{ id: number }>(
    `SELECT id FROM users
     WHERE username = ? COLLATE NOCASE
     AND id <> ?`,
    cleanUsername,
    userId
  );

  if (duplicate) throw new Error('Username already exists.');

  await db.runAsync(
    `UPDATE users
     SET username = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    cleanUsername,
    userId
  );

  await setLastUsername(cleanUsername);
}

export async function updatePassword(userId: number, password: string) {
  if (!password) throw new Error('Password is required.');

  const db = await getDatabase();
  await db.runAsync(
    `UPDATE users
     SET password = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    password,
    userId
  );
}
