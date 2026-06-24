/**
 * @file Репозиторий банков — слой доступа к данным справочника банков.
 *
 * Управляет списком банков, используемых в платёжных документах.
 * Каждый банк имеет наименование, БИК и корреспондентский счёт.
 */
import { query, insert, update, remove } from '../db';
import type { BankRow, BankBody } from '../types';

/**
 * Возвращает полный список банков, отсортированный по идентификатору.
 *
 * Используется в формах выбора банка при создании/редактировании
 * клиентов и платёжных поручений.
 *
 * @returns {Promise<BankRow[]>} Массив всех записей справочника банков
 */
export async function findAll(): Promise<BankRow[]> {
  // Получение всех банков в порядке возрастания ID
  return query<BankRow>('SELECT * FROM banks ORDER BY id');
}

/**
 * Создаёт новый банк в справочнике.
 *
 * Поля из camelCase (входной DTO) маппятся в snake_case для БД:
 * `corrAccount` → `corr_account`.
 *
 * @param {BankBody} data - Данные нового банка (name, bik, corrAccount)
 * @returns {Promise<number | bigint>} ID созданной записи
 */
export async function create(data: BankBody): Promise<number | bigint> {
  // Маппинг полей из camelCase в snake_case перед вставкой
  return insert('banks', { name: data.name, bik: data.bik, corr_account: data.corrAccount });
}

/**
 * Обновляет данные банка по идентификатору.
 *
 * Все три поля (name, bik, corr_account) обновляются целиком —
 * частичное обновление не поддерживается на уровне этого метода.
 *
 * @param {number} id - ID банка
 * @param {BankBody} data - Новые данные банка
 * @returns {Promise<void>}
 */
export async function updateBank(id: number, data: BankBody): Promise<void> {
  // Обновление всех полей банка с маппингом camelCase → snake_case
  await update('banks', id, { name: data.name, bik: data.bik, corr_account: data.corrAccount });
}

/**
 * Удаляет банк из справочника по идентификатору.
 *
 * Физическое удаление записи. Связанные клиенты не затрагиваются —
 * целостность данных должна обеспечиваться на уровне бизнес-логики.
 *
 * @param {number} id - ID банка для удаления
 * @returns {Promise<void>}
 */
export async function deleteBank(id: number): Promise<void> {
  await remove('banks', id);
}
