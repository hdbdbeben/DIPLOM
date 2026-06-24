import { query } from '../db';
import type { LogRow } from '../types';

export async function findAll(): Promise<LogRow[]> {
  return query<LogRow>(
    'SELECT l.*, u.login, u.full_name FROM logs l LEFT JOIN users u ON l.user_id = u.id ORDER BY l.id DESC LIMIT 200'
  );
}
