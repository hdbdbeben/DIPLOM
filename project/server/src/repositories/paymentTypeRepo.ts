/**
 * @file Репозиторий типов платежей — слой доступа к данным справочника типов платёжных операций.
 *
 * Определяет виды платежей: входящий (поступление) и исходящий (списание).
 * Используется при классификации операций из банковской выписки.
 */
import { query, insert, update, remove } from '../db';
import type { PaymentTypeRow, PaymentTypeBody } from '../types';

/**
 * Возвращает полный список типов платежей.
 *
 * Справочник небольшой и редко меняется. Используется в формах
 * фильтрации платежей и при ручном редактировании операций.
 *
 * @returns {Promise<PaymentTypeRow[]>} Массив всех типов платежей (например: income, expense)
 */
export async function findAll(): Promise<PaymentTypeRow[]> {
  // Получение всех типов платежей в порядке возрастания ID
  return query<PaymentTypeRow>('SELECT * FROM payment_types ORDER BY id');
}

/**
 * Создаёт новый тип платежа.
 *
 * @param {PaymentTypeBody} data - Данные типа платежа (code — системный код, name — читаемое название)
 * @returns {Promise<number | bigint>} ID созданной записи
 */
export async function create(data: PaymentTypeBody): Promise<number | bigint> {
  return insert('payment_types', { code: data.code, name: data.name });
}

/**
 * Обновляет тип платежа по идентификатору.
 *
 * @param {number} id - ID типа платежа
 * @param {PaymentTypeBody} data - Новые данные (code, name)
 * @returns {Promise<void>}
 */
export async function updateType(id: number, data: PaymentTypeBody): Promise<void> {
  await update('payment_types', id, { code: data.code, name: data.name });
}

/**
 * Удаляет тип платежа из справочника.
 *
 * ВАЖНО: удаление типа, используемого в существующих платежах,
 * приведёт к нарушению ссылочной целостности.
 *
 * @param {number} id - ID типа платежа для удаления
 * @returns {Promise<void>}
 */
export async function deleteType(id: number): Promise<void> {
  await remove('payment_types', id);
}
