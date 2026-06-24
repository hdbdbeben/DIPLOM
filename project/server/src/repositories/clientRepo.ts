/**
 * @file Репозиторий клиентов — слой доступа к данным справочника клиентов (контрагентов).
 *
 * Управляет списком организаций-контрагентов, участвующих в платёжных операциях.
 * Клиент идентифицируется по ИНН, КПП, расчётному счёту и БИК банка.
 */
import { query, insert, update, remove } from '../db';
import type { ClientRow, ClientBody } from '../types';

/**
 * Возвращает список клиентов с опциональным поиском.
 *
 * Если передан параметр `search`, фильтрация выполняется по полям
 * `name` (название организации) и `inn` (ИНН) с использованием LIKE.
 * Поиск нечувствителен к регистру (зависит от collation БД).
 *
 * @param {string} [search] - Необязательная строка поиска по названию или ИНН
 * @returns {Promise<ClientRow[]>} Массив клиентов, отсортированный по ID
 */
export async function findAll(search?: string): Promise<ClientRow[]> {
  // Базовый запрос на выборку всех клиентов
  let sql = 'SELECT * FROM clients';
  const params: string[] = [];
  // Динамическое добавление условий поиска по названию и ИНН
  if (search) {
    sql += ' WHERE name LIKE ? OR inn LIKE ?';
    // Оборачиваем поисковую строку в % для частичного совпадения
    params.push(`%${search}%`, `%${search}%`);
  }
  sql += ' ORDER BY id';
  return query<ClientRow>(sql, params);
}

/**
 * Создаёт нового клиента.
 *
 * Необязательные поля (kpp, account, bik) заполняются пустой строкой,
 * если не переданы — это позволяет хранить неполные данные контрагента.
 *
 * @param {ClientBody} data - Данные клиента (name, inn, kpp, account, bik)
 * @returns {Promise<number | bigint>} ID созданной записи
 */
export async function create(data: ClientBody): Promise<number | bigint> {
  // Поля kpp, account, bik — опциональные, при отсутствии сохраняется пустая строка
  return insert('clients', { name: data.name, inn: data.inn, kpp: data.kpp || '', account: data.account || '', bik: data.bik || '' });
}

/**
 * Обновляет данные клиента по идентификатору.
 *
 * Аналогично созданию, необязательные поля принимают пустую строку при отсутствии.
 *
 * @param {number} id - ID клиента
 * @param {ClientBody} data - Новые данные клиента
 * @returns {Promise<void>}
 */
export async function updateClient(id: number, data: ClientBody): Promise<void> {
  await update('clients', id, { name: data.name, inn: data.inn, kpp: data.kpp || '', account: data.account || '', bik: data.bik || '' });
}

/**
 * Удаляет клиента из справочника по идентификатору.
 *
 * Физическое удаление записи. Связанные платежи не удаляются —
 * внешний ключ в таблице payments должен быть учтён в схеме БД (ON DELETE SET NULL).
 *
 * @param {number} id - ID клиента для удаления
 * @returns {Promise<void>}
 */
export async function deleteClient(id: number): Promise<void> {
  await remove('clients', id);
}
