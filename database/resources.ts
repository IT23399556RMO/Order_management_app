import { getDatabase } from './database';

export type Mobile = {
  id: number;
  mobile_number: string;
  created_at: string;
};

export type Card = {
  id: number;
  card_name: string;
  created_at: string;
};

export async function getMobiles(userId: number) {
  const db = await getDatabase();
  return db.getAllAsync<Mobile>(
    `SELECT id, mobile_number, created_at
     FROM mobile_numbers
     WHERE user_id = ?
     ORDER BY id ASC`,
    userId
  );
}

export async function createMobile(userId: number, mobile: string) {
  if (!/^0\d{9}$/.test(mobile)) {
    throw new Error('Mobile number must be exactly 10 digits and start with 0.');
  }

  const db = await getDatabase();

  try {
    const result = await db.runAsync(
      `INSERT INTO mobile_numbers (user_id, mobile_number)
       VALUES (?, ?)`,
      userId,
      mobile
    );
    return result.lastInsertRowId;
  } catch (error) {
    const message = error instanceof Error ? error.message.toLowerCase() : '';
    if (message.includes('unique')) {
      throw new Error('This mobile number is already added.');
    }
    throw error;
  }
}

export async function deleteMobile(userId: number, mobileId: number) {
  const db = await getDatabase();
  const result = await db.runAsync(
    `DELETE FROM mobile_numbers WHERE id = ? AND user_id = ?`,
    mobileId,
    userId
  );

  if (result.changes === 0) {
    throw new Error('Mobile number was not found.');
  }
}

export async function getCards(userId: number) {
  const db = await getDatabase();
  return db.getAllAsync<Card>(
    `SELECT id, card_name, created_at
     FROM cards
     WHERE user_id = ?
     ORDER BY id ASC`,
    userId
  );
}

export async function createCard(userId: number, cardName: string) {
  const cleanName = cardName.trim();
  if (!cleanName) throw new Error('Card name is required.');

  const db = await getDatabase();

  try {
    const result = await db.runAsync(
      `INSERT INTO cards (user_id, card_name)
       VALUES (?, ?)`,
      userId,
      cleanName
    );
    return result.lastInsertRowId;
  } catch (error) {
    const message = error instanceof Error ? error.message.toLowerCase() : '';
    if (message.includes('unique')) {
      throw new Error('This card name is already added.');
    }
    throw error;
  }
}

export async function deleteCard(userId: number, cardId: number) {
  const db = await getDatabase();
  const result = await db.runAsync(
    `DELETE FROM cards WHERE id = ? AND user_id = ?`,
    cardId,
    userId
  );

  if (result.changes === 0) {
    throw new Error('Card was not found.');
  }
}
