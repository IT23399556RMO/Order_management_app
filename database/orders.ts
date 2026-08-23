import { getDatabase } from './database';

export type Order = {
  id: number;
  customer_name: string;
  email: string;
  amount: number;
  card_id: number | null;
  mobile_id: number | null;
  card_name: string | null;
  mobile_number: string | null;
  order_datetime: string;
  created_at: string;
};

const EMAIL_TYPE_RE =
  /^(gmail|outlook)$/i;

function normalizeEmailType(
  value: string
) {
  const clean = value
    .trim()
    .toLowerCase();

  if (!EMAIL_TYPE_RE.test(clean)) {
    throw new Error(
      'Select Gmail or Outlook.'
    );
  }

  return clean;
}

export async function createOrder(
  userId: number,
  customerName: string,
  emailType: string,
  amount: number,
  cardId: number,
  mobileId: number,
  orderDatetime: string
) {
  const name = customerName.trim();
  const cleanEmailType =
    normalizeEmailType(emailType);

  if (!name) {
    throw new Error(
      'Name is required.'
    );
  }

  if (
    !Number.isFinite(amount) ||
    amount <= 0
  ) {
    throw new Error(
      'Amount must be greater than 0.'
    );
  }

  if (
    !Number.isFinite(
      new Date(orderDatetime).getTime()
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

  await db.execAsync('BEGIN');

  try {
    const order = await db.runAsync(
      `INSERT INTO orders
       (
         user_id,
         customer_name,
         email,
         amount,
         card_id,
         mobile_id,
         order_datetime
       )
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      userId,
      name,
      cleanEmailType,
      amount,
      cardId,
      mobileId,
      orderDatetime
    );

    await db.runAsync(
      `INSERT INTO payments
       (
         user_id,
         order_id,
         card_id,
         mobile_id,
         payment_datetime
       )
       VALUES (?, ?, ?, ?, ?)`,
      userId,
      order.lastInsertRowId,
      cardId,
      mobileId,
      orderDatetime
    );

    await db.execAsync('COMMIT');

    return order.lastInsertRowId;
  } catch (error) {
    await db.execAsync(
      'ROLLBACK'
    );
    throw error;
  }
}

export async function updateOrder(
  userId: number,
  orderId: number,
  customerName: string,
  emailType: string,
  amount: number,
  cardId: number,
  mobileId: number,
  orderDatetime: string
) {
  const name = customerName.trim();
  const cleanEmailType =
    normalizeEmailType(emailType);

  if (!name) {
    throw new Error(
      'Name is required.'
    );
  }

  if (
    !Number.isFinite(amount) ||
    amount <= 0
  ) {
    throw new Error(
      'Amount must be greater than 0.'
    );
  }

  if (
    !Number.isFinite(
      new Date(orderDatetime).getTime()
    )
  ) {
    throw new Error(
      'Invalid date and time.'
    );
  }

  const db = await getDatabase();

  const order =
    await db.getFirstAsync<{ id: number }>(
      `SELECT id
       FROM orders
       WHERE id = ? AND user_id = ?`,
      orderId,
      userId
    );

  if (!order) {
    throw new Error(
      'Order was not found.'
    );
  }

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

  await db.execAsync('BEGIN');

  try {
    await db.runAsync(
      `UPDATE orders
       SET
         customer_name = ?,
         email = ?,
         amount = ?,
         card_id = ?,
         mobile_id = ?,
         order_datetime = ?
       WHERE id = ? AND user_id = ?`,
      name,
      cleanEmailType,
      amount,
      cardId,
      mobileId,
      orderDatetime,
      orderId,
      userId
    );

    /*
     * Only this order's automatically created
     * payment is updated.
     *
     * Manual payments have order_id = NULL.
     */
    await db.runAsync(
      `UPDATE payments
       SET
         card_id = ?,
         mobile_id = ?,
         payment_datetime = ?
       WHERE
         order_id = ?
         AND user_id = ?`,
      cardId,
      mobileId,
      orderDatetime,
      orderId,
      userId
    );

    await db.execAsync('COMMIT');
  } catch (error) {
    await db.execAsync(
      'ROLLBACK'
    );
    throw error;
  }
}

export async function deleteOrder(
  userId: number,
  orderId: number
) {
  const db = await getDatabase();

  const order =
    await db.getFirstAsync<{ id: number }>(
      `SELECT id
       FROM orders
       WHERE id = ? AND user_id = ?`,
      orderId,
      userId
    );

  if (!order) {
    throw new Error(
      'Order was not found.'
    );
  }

  await db.execAsync('BEGIN');

  try {
    /*
     * Delete the payment belonging to this order.
     * Manual payments have order_id = NULL,
     * so they are untouched.
     */
    await db.runAsync(
      `DELETE FROM payments
       WHERE order_id = ?
       AND user_id = ?`,
      orderId,
      userId
    );

    await db.runAsync(
      `DELETE FROM orders
       WHERE id = ?
       AND user_id = ?`,
      orderId,
      userId
    );

    await db.execAsync('COMMIT');
  } catch (error) {
    await db.execAsync(
      'ROLLBACK'
    );
    throw error;
  }
}

export async function getOrders(
  userId: number
) {
  const db = await getDatabase();

  return db.getAllAsync<Order>(
    `SELECT
       o.id,
       o.customer_name,
       o.email,
       o.amount,
       o.card_id,
       o.mobile_id,
       c.card_name,
       m.mobile_number,
       o.order_datetime,
       o.created_at
     FROM orders o
     LEFT JOIN cards c
       ON c.id = o.card_id
     LEFT JOIN mobile_numbers m
       ON m.id = o.mobile_id
     WHERE o.user_id = ?
     ORDER BY
       o.order_datetime ASC,
       o.id ASC`,
    userId
  );
}