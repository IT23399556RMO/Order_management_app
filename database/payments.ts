import { getDatabase } from './database';

export type Payment = {
  id: number;
  order_id: number | null;
  card_id: number | null;
  mobile_id: number | null;
  card_name: string | null;
  mobile_number: string | null;
  payment_datetime: string;
  created_at: string;
};

export async function createPayment(
  userId: number,
  cardId: number,
  mobileId: number,
  paymentDatetime: string
) {
  if (
    !Number.isFinite(
      new Date(paymentDatetime).getTime()
    )
  ) {
    throw new Error(
      'Invalid date and time.'
    );
  }

  const db = await getDatabase();

  const card =
    await db.getFirstAsync<{ id: number }>(
      `SELECT id
       FROM cards
       WHERE id = ? AND user_id = ?`,
      cardId,
      userId
    );

  const mobile =
    await db.getFirstAsync<{ id: number }>(
      `SELECT id
       FROM mobile_numbers
       WHERE id = ? AND user_id = ?`,
      mobileId,
      userId
    );

  if (!card) {
    throw new Error(
      'Selected card is not available for this account.'
    );
  }

  if (!mobile) {
    throw new Error(
      'Selected mobile number is not available for this account.'
    );
  }

  /*
   * Manual payment:
   * order_id is intentionally NULL.
   */
  const result = await db.runAsync(
    `INSERT INTO payments
     (
       user_id,
       order_id,
       card_id,
       mobile_id,
       payment_datetime
     )
     VALUES (?, NULL, ?, ?, ?)`,
    userId,
    cardId,
    mobileId,
    paymentDatetime
  );

  return result.lastInsertRowId;
}

export async function updateManualPayment(
  userId: number,
  paymentId: number,
  cardId: number,
  mobileId: number,
  paymentDatetime: string
) {
  const db = await getDatabase();

  const result = await db.runAsync(
    `UPDATE payments
     SET
       card_id = ?,
       mobile_id = ?,
       payment_datetime = ?
     WHERE
       id = ?
       AND user_id = ?
       AND order_id IS NULL`,
    cardId,
    mobileId,
    paymentDatetime,
    paymentId,
    userId
  );

  if (result.changes === 0) {
    throw new Error(
      'Only manual payments can be edited.'
    );
  }
}

export async function deleteManualPayment(
  userId: number,
  paymentId: number
) {
  const db = await getDatabase();

  const result = await db.runAsync(
    `DELETE FROM payments
     WHERE
       id = ?
       AND user_id = ?
       AND order_id IS NULL`,
    paymentId,
    userId
  );

  if (result.changes === 0) {
    throw new Error(
      'Only manual payments can be deleted.'
    );
  }
}

export async function getPayments(
  userId: number
) {
  const db = await getDatabase();

  return db.getAllAsync<Payment>(
    `SELECT
       p.id,
       p.order_id,
       p.card_id,
       p.mobile_id,
       c.card_name,
       m.mobile_number,
       p.payment_datetime,
       p.created_at
     FROM payments p
     LEFT JOIN cards c
       ON c.id = p.card_id
     LEFT JOIN mobile_numbers m
       ON m.id = p.mobile_id
     WHERE p.user_id = ?
     ORDER BY
       p.payment_datetime ASC,
       p.id ASC`,
    userId
  );
}