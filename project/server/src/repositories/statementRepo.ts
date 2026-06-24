/**
 * @file Репозиторий выписок — слой доступа к данным банковских выписок и их обработки.
 *
 * Управляет жизненным циклом выписки: загрузка файла, парсинг документов,
 * вставка платежей и ошибок, финализация. Выписка — это загруженный файл
 * (например, выписка из банк-клиента в формате 1С), который разбирается
 * на отдельные платёжные документы.
 */
import { query, insert, update, remove } from '../db';
import type { StatementRow, ClientRow, StatementDocument } from '../types';
import { parseNumber, extractInn, extractName, normalizeDate } from '../utils/parsing';

/**
 * Возвращает список всех выписок с информацией о пользователе, загрузившем файл.
 *
 * LEFT JOIN с таблицей users позволяет получить имя пользователя (full_name).
 * Сортировка по ID в обратном порядке — свежие выписки сверху.
 *
 * @returns {Promise<StatementRow[]>} Массив выписок с полем uploaded_by (ФИО загрузившего)
 */
export async function findAll(): Promise<StatementRow[]> {
  // Выборка выписок с именем пользователя через LEFT JOIN.
  // LEFT JOIN гарантирует, что выписка вернётся даже если пользователь был удалён.
  return query<StatementRow>(
    'SELECT s.*, u.full_name as uploaded_by FROM statements s LEFT JOIN users u ON s.user_id = u.id ORDER BY s.id DESC'
  );
}

/**
 * Создаёт запись о новой выписке в статусе "processing".
 *
 * Выписка создаётся сразу после загрузки файла, до начала парсинга.
 * Статус `processing` означает, что идёт разбор документов.
 *
 * @param {string} fileName - Имя загруженного файла
 * @param {number} docCount - Количество документов, обнаруженных в файле
 * @param {number | null} userId - ID пользователя, загрузившего файл (null для системных загрузок)
 * @returns {Promise<number | bigint>} ID созданной выписки
 */
export async function createStatement(fileName: string, docCount: number, userId: number | null): Promise<number | bigint> {
  // Вставка выписки со статусом processing — парсинг ещё не завершён
  return insert('statements', { file_name: fileName, total_operations: docCount, status: 'processing', user_id: userId });
}

/**
 * Возвращает всех клиентов из справочника.
 *
 * Используется при автосопоставлении: для каждого платежа ищется
 * подходящий клиент по ИНН плательщика/получателя.
 *
 * @returns {Promise<ClientRow[]>} Полный массив записей справочника clients
 */
export async function getAllClients(): Promise<ClientRow[]> {
  // Загрузка всего справочника клиентов в память для автосопоставления
  return query<ClientRow>('SELECT * FROM clients');
}

/**
 * Вставляет обработанный платёж в таблицу payments.
 *
 * Вызывается в цикле при парсинге выписки. Каждый документ из файла
 * преобразуется в запись платежа с уже сопоставленными справочниками.
 *
 * @param {Record<string, unknown>} data - Данные платежа (набор полей в snake_case)
 * @returns {Promise<number | bigint>} ID созданной записи платежа
 */
export async function insertPayment(data: Record<string, unknown>): Promise<number | bigint> {
  return insert('payments', data);
}

/**
 * Вставляет запись об ошибке парсинга в таблицу errors.
 *
 * Если документ не удалось разобрать или сопоставить, создаётся запись
 * об ошибке для последующей ручной обработки оператором.
 *
 * @param {Record<string, unknown>} data - Данные ошибки (описание, ID платежа и т.д.)
 * @returns {Promise<number | bigint>} ID созданной записи ошибки
 */
export async function insertError(data: Record<string, unknown>): Promise<number | bigint> {
  return insert('errors', data);
}

/**
 * Финализирует обработку выписки: проставляет статистику и статус "processed".
 *
 * Вызывается после завершения парсинга всех документов. Сохраняет количество
 * успешно обработанных платежей и количество ошибок.
 *
 * @param {number} id - ID выписки
 * @param {number} autoProcessed - Количество автоматически обработанных документов
 * @param {number} errorCount - Количество документов с ошибками
 * @returns {Promise<void>}
 */
export async function finalizeStatement(id: number, autoProcessed: number, errorCount: number): Promise<void> {
  // Перевод выписки в финальный статус processed с сохранением статистики
  await update('statements', id, { auto_processed: autoProcessed, error_count: errorCount, status: 'processed' });
}

/**
 * Логирует действие загрузки выписки.
 *
 * Записывает информационное сообщение в лог аудита с именем файла
 * и количеством найденных операций. Логируется только если есть userId.
 *
 * @param {number | null} userId - ID пользователя
 * @param {string} fileName - Имя загруженного файла
 * @param {number} docCount - Количество документов в выписке
 * @returns {Promise<void>}
 */
export async function logUploadAction(userId: number | null, fileName: string, docCount: number): Promise<void> {
  // Логирование только для авторизованных пользователей
  if (userId) {
    await query('INSERT INTO logs (user_id, action) VALUES (?, ?)', [userId, `Загружена выписка: ${fileName} (${docCount} операций)`]);
  }
}

/**
 * Удаляет выписку по идентификатору.
 *
 * Физическое удаление записи. Связанные платежи и ошибки НЕ удаляются
 * каскадно — это ответственность схемы БД или вышестоящей бизнес-логики.
 *
 * @param {number} id - ID выписки для удаления
 * @returns {Promise<void>}
 */
export async function deleteStatement(id: number): Promise<void> {
  await remove('statements', id);
}
