import { query, queryOne, update } from '../db';
import type { PaymentRow, PaymentUpdateBody } from '../types';

export async function findAll(params: {
  statementId?: number;
  status?: string;
  search?: string;
}): Promise<PaymentRow[]> {
  let sql = `SELECT p.*, c.name as client_name, pt.name as payment_type_name, a.name as article_name
             FROM payments p
             LEFT JOIN clients c ON p.client_id = c.id
             LEFT JOIN payment_types pt ON p.payment_type_id = pt.id
             LEFT JOIN articles a ON p.article_id = a.id
             WHERE 1=1`;
  const values: (string | number)[] = [];

  if (params.statementId) { sql += ' AND p.statement_id = ?'; values.push(params.statementId); }
  if (params.status && params.status !== 'all') { sql += ' AND p.status = ?'; values.push(params.status); }
  if (params.search) {
    sql += ' AND (p.payer_name LIKE ? OR p.payee_name LIKE ? OR p.payer_inn LIKE ? OR p.payee_inn LIKE ? OR p.purpose LIKE ?)';
    const s = `%${params.search}%`;
    values.push(s, s, s, s, s);
  }
  sql += ' ORDER BY p.id DESC LIMIT 500';
  return query<PaymentRow>(sql, values);
}

export async function findById(id: number): Promise<PaymentRow | null> {
  return queryOne<PaymentRow>(
    `SELECT p.*, c.name as client_name, pt.name as payment_type_name, a.name as article_name, s.file_name as statement_file
     FROM payments p
     LEFT JOIN clients c ON p.client_id = c.id
     LEFT JOIN payment_types pt ON p.payment_type_id = pt.id
     LEFT JOIN articles a ON p.article_id = a.id
     LEFT JOIN statements s ON p.statement_id = s.id
     WHERE p.id = ?`,
    [id]
  );
}

export async function updatePayment(id: number, data: PaymentUpdateBody): Promise<void> {
  await update('payments', id, {
    client_id: data.clientId,
    payment_type_id: data.paymentTypeId,
    article_id: data.articleId,
    status: data.status || 'processed',
  });
}
