import fs from 'fs';
import path from 'path';
import { query, getDB } from '../db';
import { seedData, seedDemoIfEmpty } from '../db';

const DB_PATH = path.join(__dirname, '..', '..', '..', 'asbo.db');

export async function backup(userId: number | null): Promise<string> {
  const backupPath = path.join(__dirname, '..', '..', '..', `asbo_backup_${new Date().toISOString().slice(0, 10).replace(/-/g, '')}.db`);
  fs.copyFileSync(DB_PATH, backupPath);
  await query('INSERT INTO logs (user_id, action) VALUES (?, ?)', [userId, `Создана резервная копия БД: ${backupPath}`]);
  return backupPath;
}

export async function restore(backupPath: string, userId: number | null): Promise<string> {
  if (!backupPath || !fs.existsSync(backupPath)) throw new Error('Файл резервной копии не найден');
  fs.copyFileSync(backupPath, DB_PATH);
  await query('INSERT INTO logs (user_id, action) VALUES (?, ?)', [userId, `Восстановлена БД из копии: ${backupPath}`]);
  return 'База данных восстановлена. Перезапустите сервер для применения изменений.';
}

export async function reset(): Promise<string> {
  const d = getDB();
  d.exec(`
    DELETE FROM logs; DELETE FROM errors; DELETE FROM payments; DELETE FROM statements;
    DELETE FROM articles; DELETE FROM payment_types; DELETE FROM clients; DELETE FROM banks;
    DELETE FROM users; DELETE FROM roles;
  `);
  seedData(true);
  seedDemoIfEmpty();
  return 'Все данные сброшены и переинициализированы.';
}
