import { query, update } from '../db';
import type { ErrorRow, ErrorUpdateBody } from '../types';

export async function findAll(status?: string): Promise<ErrorRow[]> {
  let sql = `SELECT e.*, p.doc_number, p.amount, p.payer_name, p.payee_name, u.full_name as assigned_name
             FROM errors e
             LEFT JOIN payments p ON e.payment_id = p.id
             LEFT JOIN users u ON e.assigned_to = u.id`;
  const params: string[] = [];
  if (status && status !== 'all') { sql += ' WHERE e.status = ?'; params.push(status); }
  sql += ' ORDER BY e.id DESC LIMIT 200';
  return query<ErrorRow>(sql, params);
}

export async function updateError(id: number, data: ErrorUpdateBody): Promise<void> {
  const record: Record<string, unknown> = {};
  if (data.status) record.status = data.status;
  if (data.assignedTo) record.assigned_to = data.assignedTo;
  if (data.status === 'resolved') record.resolved_at = new Date().toISOString().replace('T', ' ').slice(0, 19);
  await update('errors', id, record);
}
