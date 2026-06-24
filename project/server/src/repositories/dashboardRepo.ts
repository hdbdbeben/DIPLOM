import { query } from '../db';
import type { DashboardResult, StatementRow, ErrorRow } from '../types';

export async function getDashboard(): Promise<DashboardResult> {
  const stmtCount = (await query<{ cnt: number }>('SELECT COUNT(*) as cnt FROM statements'))[0];
  const payCount  = (await query<{ cnt: number }>('SELECT COUNT(*) as cnt FROM payments'))[0];
  const autoStats = (await query<{ total: number; auto_count: number }>("SELECT COUNT(*) as total, SUM(CASE WHEN status = 'processed' THEN 1 ELSE 0 END) as auto_count FROM payments"))[0];
  const errCount  = (await query<{ cnt: number }>("SELECT COUNT(*) as cnt FROM errors WHERE status != 'resolved'"))[0];
  const recentStmts = await query<StatementRow>('SELECT * FROM statements ORDER BY id DESC LIMIT 5');
  const recentErrors = await query<ErrorRow>('SELECT e.*, p.doc_number FROM errors e LEFT JOIN payments p ON e.payment_id = p.id ORDER BY e.id DESC LIMIT 5');

  const autoPct = autoStats && autoStats.total > 0 ? Math.round((autoStats.auto_count / autoStats.total) * 100) : 0;

  return {
    statementCount: stmtCount?.cnt ?? 0,
    paymentCount: payCount?.cnt ?? 0,
    autoPercent: autoPct,
    errorCount: errCount?.cnt ?? 0,
    recentStatements: recentStmts,
    recentErrors,
  };
}
