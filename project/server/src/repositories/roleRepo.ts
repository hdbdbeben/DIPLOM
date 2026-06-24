import { query } from '../db';
import type { RoleRow } from '../types';

export async function findAll(): Promise<RoleRow[]> {
  return query<RoleRow>('SELECT * FROM roles ORDER BY id');
}
