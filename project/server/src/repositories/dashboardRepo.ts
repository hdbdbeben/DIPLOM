/**
 * @file Репозиторий панели управления (Dashboard) — слой доступа к агрегированным данным.
 *
 * Предоставляет сводную статистику для главной страницы системы:
 * количество выписок, платежей, процент автообработки, количество открытых ошибок,
 * а также списки последних выписок и ошибок для быстрого доступа.
 */
import { query } from '../db';
import type { DashboardResult, StatementRow, ErrorRow } from '../types';

/**
 * Собирает агрегированные данные для панели управления.
 *
 * Выполняет 6 параллельных запросов:
 * 1. Общее количество выписок
 * 2. Общее количество платежей
 * 3. Статистика автообработки (всего / обработано автоматически)
 * 4. Количество неразрешённых ошибок
 * 5. Последние 5 выписок
 * 6. Последние 5 ошибок с номерами документов
 *
 * Процент автообработки вычисляется как (auto_count / total) * 100,
 * округлённый до целого числа. При отсутствии платежей — 0.
 *
 * @returns {Promise<DashboardResult>} Объект с ключевыми метриками и списками
 */
export async function getDashboard(): Promise<DashboardResult> {
  // Запрос 1: общее количество выписок
  const stmtCount = (await query<{ cnt: number }>('SELECT COUNT(*) as cnt FROM statements'))[0];
  // Запрос 2: общее количество платежей
  const payCount  = (await query<{ cnt: number }>('SELECT COUNT(*) as cnt FROM payments'))[0];
  // Запрос 3: статистика автообработки — общее число и число обработанных автоматически.
  // CASE WHEN status = 'processed' THEN 1 ELSE 0 END считает автообработанные платежи.
  const autoStats = (await query<{ total: number; auto_count: number }>("SELECT COUNT(*) as total, SUM(CASE WHEN status = 'processed' THEN 1 ELSE 0 END) as auto_count FROM payments"))[0];
  // Запрос 4: количество неразрешённых ошибок (все статусы кроме resolved)
  const errCount  = (await query<{ cnt: number }>("SELECT COUNT(*) as cnt FROM errors WHERE status != 'resolved'"))[0];
  // Запрос 5: последние 5 выписок для быстрого доступа
  const recentStmts = await query<StatementRow>('SELECT * FROM statements ORDER BY id DESC LIMIT 5');
  // Запрос 6: последние 5 ошибок с JOIN для получения номера документа
  const recentErrors = await query<ErrorRow>('SELECT e.*, p.doc_number FROM errors e LEFT JOIN payments p ON e.payment_id = p.id ORDER BY e.id DESC LIMIT 5');

  // Вычисление процента автообработки с защитой от деления на ноль
  const autoPct = autoStats && autoStats.total > 0 ? Math.round((autoStats.auto_count / autoStats.total) * 100) : 0;

  return {
    // Использование ?? для подстановки 0, если запрос вернул пустой результат
    statementCount: stmtCount?.cnt ?? 0,
    paymentCount: payCount?.cnt ?? 0,
    autoPercent: autoPct,
    errorCount: errCount?.cnt ?? 0,
    recentStatements: recentStmts,
    recentErrors,
  };
}
