import { query, insert, update, remove } from '../db';
import type { StatementRow, ClientRow, StatementDocument } from '../types';
import { parseNumber, extractInn, extractName, normalizeDate } from '../utils/parsing';

export async function findAll(): Promise<StatementRow[]> {
  return query<StatementRow>(
    'SELECT s.*, u.full_name as uploaded_by FROM statements s LEFT JOIN users u ON s.user_id = u.id ORDER BY s.id DESC'
  );
}

export async function createStatement(fileName: string, docCount: number, userId: number | null): Promise<number | bigint> {
  return insert('statements', { file_name: fileName, total_operations: docCount, status: 'processing', user_id: userId });
}

export async function getAllClients(): Promise<ClientRow[]> {
  return query<ClientRow>('SELECT * FROM clients');
}

export async function insertPayment(data: Record<string, unknown>): Promise<number | bigint> {
  return insert('payments', data);
}

export async function insertError(data: Record<string, unknown>): Promise<number | bigint> {
  return insert('errors', data);
}

export async function finalizeStatement(id: number, autoProcessed: number, errorCount: number): Promise<void> {
  await update('statements', id, { auto_processed: autoProcessed, error_count: errorCount, status: 'processed' });
}

export async function logUploadAction(userId: number | null, fileName: string, docCount: number): Promise<void> {
  if (userId) {
    await query('INSERT INTO logs (user_id, action) VALUES (?, ?)', [userId, `Загружена выписка: ${fileName} (${docCount} операций)`]);
  }
}

export async function deleteStatement(id: number): Promise<void> {
  await remove('statements', id);
}
