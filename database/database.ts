import * as SQLite from 'expo-sqlite';

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

export function getDatabase() {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync('offline_order_manager_v2.db');
  }
  return dbPromise;
}
