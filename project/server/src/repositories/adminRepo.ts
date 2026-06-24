/**
 * @file Репозиторий администрирования — слой доступа к данным для операций с базой данных.
 *
 * Предоставляет функции резервного копирования, восстановления и полного сброса
 * базы данных SQLite. Все операции логируются в журнал аудита.
 */
import fs from 'fs';
import path from 'path';
import { query, getDB } from '../db';
import { seedData, seedDemoIfEmpty } from '../db';

/** Абсолютный путь к файлу базы данных SQLite в корне проекта */
const DB_PATH = path.join(__dirname, '..', '..', '..', 'asbo.db');

/**
 * Создаёт резервную копию файла базы данных.
 *
 * Копирует текущий файл asbo.db в новый файл с суффиксом даты
 * (формат: asbo_backup_YYYYMMDD.db). Операция логируется.
 *
 * @param {number | null} userId - ID пользователя, выполняющего резервное копирование
 * @returns {Promise<string>} Путь к созданному файлу резервной копии
 */
export async function backup(userId: number | null): Promise<string> {
  // Формирование имени файла резервной копии с датой в формате YYYYMMDD
  const backupPath = path.join(__dirname, '..', '..', '..', `asbo_backup_${new Date().toISOString().slice(0, 10).replace(/-/g, '')}.db`);
  // Копирование файла БД. При существовании целевого файла он будет перезаписан.
  fs.copyFileSync(DB_PATH, backupPath);
  // Логирование факта создания резервной копии
  await query('INSERT INTO logs (user_id, action) VALUES (?, ?)', [userId, `Создана резервная копия БД: ${backupPath}`]);
  return backupPath;
}

/**
 * Восстанавливает базу данных из резервной копии.
 *
 * Проверяет существование указанного файла, затем копирует его поверх
 * текущей БД. Требуется перезапуск сервера для применения изменений,
 * так как SQLite хранит данные в памяти при открытом соединении.
 *
 * @param {string} backupPath - Путь к файлу резервной копии
 * @param {number | null} userId - ID пользователя, выполняющего восстановление
 * @returns {Promise<string>} Сообщение о результате операции
 * @throws {Error} Если файл резервной копии не найден
 */
export async function restore(backupPath: string, userId: number | null): Promise<string> {
  // Проверка существования файла резервной копии
  if (!backupPath || !fs.existsSync(backupPath)) throw new Error('Файл резервной копии не найден');
  // Копирование резервной копии поверх текущего файла БД
  fs.copyFileSync(backupPath, DB_PATH);
  // Логирование операции восстановления
  await query('INSERT INTO logs (user_id, action) VALUES (?, ?)', [userId, `Восстановлена БД из копии: ${backupPath}`]);
  return 'База данных восстановлена. Перезапустите сервер для применения изменений.';
}

/**
 * Полностью сбрасывает базу данных и переинициализирует её.
 *
 * Удаляет ВСЕ данные из всех таблиц (в правильном порядке с учётом
 * внешних ключей), затем запускает повторную инициализацию:
 * создание таблиц (seedData) и заполнение демо-данными (seedDemoIfEmpty).
 *
 * ВНИМАНИЕ: операция необратима! Все данные будут потеряны.
 *
 * @returns {Promise<string>} Сообщение о результате операции
 */
export async function reset(): Promise<string> {
  const d = getDB();
  // Удаление всех данных в порядке, безопасном для внешних ключей:
  // сначала дочерние таблицы (логи, ошибки, платежи, выписки),
  // затем справочники, затем пользователи и роли.
  d.exec(`
    DELETE FROM logs; DELETE FROM errors; DELETE FROM payments; DELETE FROM statements;
    DELETE FROM articles; DELETE FROM payment_types; DELETE FROM clients; DELETE FROM banks;
    DELETE FROM users; DELETE FROM roles;
  `);
  // Повторная инициализация схемы и демо-данных.
  // Параметр true в seedData означает принудительное создание таблиц.
  seedData(true);
  seedDemoIfEmpty();
  return 'Все данные сброшены и переинициализированы.';
}
