import { getDatabase } from './database';

export async function initializeDatabase() {
  const db = await getDatabase();

  await db.execAsync(`
    PRAGMA foreign_keys = ON;
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL COLLATE NOCASE UNIQUE,
      password TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS user_settings (
      user_id INTEGER PRIMARY KEY,
      session_mode TEXT NOT NULL DEFAULT 'close'
        CHECK (session_mode IN ('close', '12h', '1d')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS device_settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      last_username TEXT,
      FOREIGN KEY (last_username) REFERENCES users(username)
        ON DELETE SET NULL ON UPDATE CASCADE
    );

    CREATE TABLE IF NOT EXISTS active_session (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      user_id INTEGER NOT NULL,
      expires_at TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS mobile_numbers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      mobile_number TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE (user_id, mobile_number)
    );

    CREATE TABLE IF NOT EXISTS cards (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      card_name TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE (user_id, card_name COLLATE NOCASE)
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      customer_name TEXT NOT NULL,
      email TEXT NOT NULL,
      amount REAL NOT NULL CHECK (amount > 0),
      card_id INTEGER,
      mobile_id INTEGER,
      order_datetime TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE SET NULL,
      FOREIGN KEY (mobile_id) REFERENCES mobile_numbers(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      order_id INTEGER,
      card_id INTEGER,
      mobile_id INTEGER,
      payment_datetime TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL,
      FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE SET NULL,
      FOREIGN KEY (mobile_id) REFERENCES mobile_numbers(id) ON DELETE SET NULL
    );

    CREATE INDEX IF NOT EXISTS idx_mobile_user
      ON mobile_numbers(user_id);

    CREATE INDEX IF NOT EXISTS idx_cards_user
      ON cards(user_id);

    CREATE INDEX IF NOT EXISTS idx_orders_user_datetime
      ON orders(user_id, order_datetime DESC);

    CREATE INDEX IF NOT EXISTS idx_payments_user_datetime
      ON payments(user_id, payment_datetime DESC);

    INSERT OR IGNORE INTO device_settings (id, last_username)
      VALUES (1, NULL);
  `);
}
