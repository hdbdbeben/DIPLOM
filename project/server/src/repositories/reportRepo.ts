import { query } from '../db';
import type { PaymentRow, ReportResult, ReportQuery, ReportArticle } from '../types';

export async function generateReport({ from, to }: ReportQuery): Promise<ReportResult> {
  let sql = `SELECT p.*, a.name as article_name, a.type as article_type, c.name as client_name
             FROM payments p
             LEFT JOIN articles a ON p.article_id = a.id
             LEFT JOIN clients c ON p.client_id = c.id
             WHERE 1=1`;
  const params: string[] = [];
  if (from) { sql += ' AND p.doc_date >= ?'; params.push(from); }
  if (to) { sql += ' AND p.doc_date <= ?'; params.push(to); }
  sql += ' ORDER BY p.doc_date';
  const payments = await query<PaymentRow>(sql, params);

  const articles: Record<string, ReportArticle> = {};
  let totalIncome = 0, totalExpense = 0;

  for (const p of payments) {
    const amount = parseFloat(String(p.amount)) || 0;
    const key = p.article_name || 'Нераспределённые';
    if (!articles[key]) articles[key] = { name: key, type: p.article_type || 'unknown', income: 0, expense: 0, count: 0 };
    articles[key].count++;
    if (p.payment_type_id === 1) { articles[key].income += amount; totalIncome += amount; }
    else { articles[key].expense += amount; totalExpense += amount; }
  }

  return {
    articles: Object.values(articles),
    totalIncome, totalExpense,
    netFlow: totalIncome - totalExpense,
    paymentCount: payments.length,
  };
}
