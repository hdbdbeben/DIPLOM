import { query, insert, update, remove } from '../db';
import type { ClientRow, ClientBody } from '../types';

export async function findAll(search?: string): Promise<ClientRow[]> {
  let sql = 'SELECT * FROM clients';
  const params: string[] = [];
  if (search) {
    sql += ' WHERE name LIKE ? OR inn LIKE ?';
    params.push(`%${search}%`, `%${search}%`);
  }
  sql += ' ORDER BY id';
  return query<ClientRow>(sql, params);
}

export async function create(data: ClientBody): Promise<number | bigint> {
  return insert('clients', { name: data.name, inn: data.inn, kpp: data.kpp || '', account: data.account || '', bik: data.bik || '' });
}

export async function updateClient(id: number, data: ClientBody): Promise<void> {
  await update('clients', id, { name: data.name, inn: data.inn, kpp: data.kpp || '', account: data.account || '', bik: data.bik || '' });
}

export async function deleteClient(id: number): Promise<void> {
  await remove('clients', id);
}
