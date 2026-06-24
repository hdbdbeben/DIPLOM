import { query } from '../db';
import type { ClientRow } from '../types';

export function getAllClients(): ClientRow[] {
  return query<ClientRow>('SELECT * FROM clients ORDER BY id');
}

export function getPaymentsReadyForExport(): Record<string, unknown>[] {
  return query(`SELECT p.*, c.name as client_name, pt.name as payment_type_name, a.name as article_name
    FROM payments p
    LEFT JOIN clients c ON p.client_id = c.id
    LEFT JOIN payment_types pt ON p.payment_type_id = pt.id
    LEFT JOIN articles a ON p.article_id = a.id
    WHERE p.status = 'processed' AND p.client_id IS NOT NULL
    ORDER BY p.id DESC LIMIT 100`);
}
