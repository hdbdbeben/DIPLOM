/**
 * @file Репозиторий ошибок — слой доступа к данным ошибок обработки платежей.
 *
 * Ошибки возникают при парсинге банковской выписки, когда документ
 * не удалось автоматически разобрать или сопоставить со справочниками.
 * Оператор может назначить ошибку на себя, исправить и закрыть (resolved).
 */
import { query, update } from '../db';
import type { ErrorRow, ErrorUpdateBody } from '../types';

/**
 * Возвращает список ошибок с фильтрацией по статусу.
 *
 * JOIN с payments для отображения контекста ошибки (номер документа, сумма, стороны).
 * JOIN с users для отображения назначенного сотрудника (assigned_name).
 * Результат ограничен 200 записями.
 *
 * @param {string} [status] - Фильтр по статусу ошибки ('all' — все статусы)
 * @returns {Promise<ErrorRow[]>} Массив ошибок с контекстной информацией
 */
export async function findAll(status?: string): Promise<ErrorRow[]> {
  // Базовый запрос с LEFT JOIN к payments (контекст) и users (назначенный сотрудник)
  let sql = `SELECT e.*, p.doc_number, p.amount, p.payer_name, p.payee_name, u.full_name as assigned_name
             FROM errors e
             LEFT JOIN payments p ON e.payment_id = p.id
             LEFT JOIN users u ON e.assigned_to = u.id`;
  const params: string[] = [];
  // Динамическая фильтрация по статусу. 'all' означает без фильтра.
  if (status && status !== 'all') { sql += ' WHERE e.status = ?'; params.push(status); }
  // Ограничение для производительности
  sql += ' ORDER BY e.id DESC LIMIT 200';
  return query<ErrorRow>(sql, params);
}

/**
 * Обновляет статус и назначение ошибки.
 *
 * При переводе в статус 'resolved' автоматически проставляется
 * временная метка resolved_at (текущее время в формате БД).
 * Поддерживается частичное обновление: можно изменить только статус
 * или только назначенного сотрудника.
 *
 * @param {number} id - ID ошибки
 * @param {ErrorUpdateBody} data - Обновляемые поля (status, assignedTo)
 * @returns {Promise<void>}
 */
export async function updateError(id: number, data: ErrorUpdateBody): Promise<void> {
  const record: Record<string, unknown> = {};
  // Собираем только переданные поля для частичного обновления
  if (data.status) record.status = data.status;
  if (data.assignedTo) record.assigned_to = data.assignedTo;
  // При закрытии ошибки автоматически фиксируется время разрешения.
  // Формат: YYYY-MM-DD HH:MM:SS (совместимый с SQLite DATETIME).
  if (data.status === 'resolved') record.resolved_at = new Date().toISOString().replace('T', ' ').slice(0, 19);
  await update('errors', id, record);
}
