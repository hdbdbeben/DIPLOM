/**
 * @file Репозиторий отчётов — слой доступа к данным для формирования аналитических отчётов.
 *
 * Генерирует сводный отчёт по платежам за период: группировка по статьям ДДС,
 * расчёт итоговых сумм доходов и расходов, вычисление чистого денежного потока.
 * Все вычисления выполняются на стороне сервера (в оперативной памяти).
 */
import { query } from '../db';
import type { PaymentRow, ReportResult, ReportQuery, ReportArticle } from '../types';

/**
 * Генерирует отчёт по движению денежных средств за указанный период.
 *
 * Алгоритм:
 * 1. Выбираются все платежи за период с JOIN к статьям и клиентам
 * 2. Платежи группируются по названию статьи (article_name)
 * 3. Для каждой статьи суммируются доходы (payment_type_id === 1) и расходы (все остальные типы)
 * 4. Вычисляются итоги: общий доход, общий расход, чистый поток, количество платежей
 *
 * Платежи без статьи попадают в группу "Нераспределённые".
 * Платежи без типа статьи получают тип 'unknown'.
 *
 * @param {ReportQuery} params - Параметры периода отчёта
 * @param {string} [params.from] - Начальная дата (включительно), формат YYYY-MM-DD
 * @param {string} [params.to] - Конечная дата (включительно), формат YYYY-MM-DD
 * @returns {Promise<ReportResult>} Объект с分组ированными статьями и итоговыми суммами
 */
export async function generateReport({ from, to }: ReportQuery): Promise<ReportResult> {
  // Базовый запрос: все платежи с присоединением статей и клиентов
  let sql = `SELECT p.*, a.name as article_name, a.type as article_type, c.name as client_name
             FROM payments p
             LEFT JOIN articles a ON p.article_id = a.id
             LEFT JOIN clients c ON p.client_id = c.id
             WHERE 1=1`;
  const params: string[] = [];
  // Динамическое добавление фильтров по дате документа
  if (from) { sql += ' AND p.doc_date >= ?'; params.push(from); }
  if (to) { sql += ' AND p.doc_date <= ?'; params.push(to); }
  sql += ' ORDER BY p.doc_date';
  const payments = await query<PaymentRow>(sql, params);

  // Агрегация платежей по статьям.
  // Ключ — название статьи; если статья отсутствует — "Нераспределённые".
  const articles: Record<string, ReportArticle> = {};
  let totalIncome = 0, totalExpense = 0;

  for (const p of payments) {
    // Приведение суммы к числу с защитой от null/undefined/нечисловых строк
    const amount = parseFloat(String(p.amount)) || 0;
    const key = p.article_name || 'Нераспределённые';
    // Инициализация группы статьи при первом появлении
    if (!articles[key]) articles[key] = { name: key, type: p.article_type || 'unknown', income: 0, expense: 0, count: 0 };
    articles[key].count++;
    // Классификация: payment_type_id === 1 — доход, всё остальное — расход
    if (p.payment_type_id === 1) { articles[key].income += amount; totalIncome += amount; }
    else { articles[key].expense += amount; totalExpense += amount; }
  }

  return {
    articles: Object.values(articles),
    totalIncome, totalExpense,
    // Чистый денежный поток = доходы минус расходы
    netFlow: totalIncome - totalExpense,
    paymentCount: payments.length,
  };
}
