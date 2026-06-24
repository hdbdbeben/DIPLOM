/**
 * @file Репозиторий статей — слой доступа к данным справочника статей движения денежных средств.
 *
 * Статьи используются для классификации платежей по экономическому смыслу:
 * доходные статьи, расходные статьи (например: "Оплата поставщику",
 * "Поступление от клиента", "Налоги", "Зарплата").
 * Поле `type` определяет направление: income (доход) или expense (расход).
 */
import { query, insert, update, remove } from '../db';
import type { ArticleRow, ArticleBody } from '../types';

/**
 * Возвращает полный список статей ДДС.
 *
 * Используется при ручном сопоставлении платежей со статьями,
 * а также при формировании отчётов по статьям доходов/расходов.
 *
 * @returns {Promise<ArticleRow[]>} Массив всех статей, отсортированный по ID
 */
export async function findAll(): Promise<ArticleRow[]> {
  // Получение всех статей в порядке возрастания ID
  return query<ArticleRow>('SELECT * FROM articles ORDER BY id');
}

/**
 * Создаёт новую статью движения денежных средств.
 *
 * @param {ArticleBody} data - Данные статьи (code — код, name — название, type — income/expense)
 * @returns {Promise<number | bigint>} ID созданной записи
 */
export async function create(data: ArticleBody): Promise<number | bigint> {
  return insert('articles', { code: data.code, name: data.name, type: data.type });
}

/**
 * Обновляет статью по идентификатору.
 *
 * @param {number} id - ID статьи
 * @param {ArticleBody} data - Новые данные статьи (code, name, type)
 * @returns {Promise<void>}
 */
export async function updateArticle(id: number, data: ArticleBody): Promise<void> {
  await update('articles', id, { code: data.code, name: data.name, type: data.type });
}

/**
 * Удаляет статью из справочника.
 *
 * ВАЖНО: удаление статьи, используемой в существующих платежах,
 * приведёт к нарушению ссылочной целостности.
 *
 * @param {number} id - ID статьи для удаления
 * @returns {Promise<void>}
 */
export async function deleteArticle(id: number): Promise<void> {
  await remove('articles', id);
}
