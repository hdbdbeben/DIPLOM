import { query, queryOne, insert, update, remove } from '../db';
import type { ContractRow, ContractBody } from '../types';

export function findAll(search?: string): ContractRow[] {
  let sql = `SELECT c.*, cl.name as client_name, cl.inn as client_inn
     FROM contracts c
     LEFT JOIN clients cl ON c.client_id = cl.id`;
  const params: string[] = [];
  if (search) {
    sql += ' WHERE LOWER(c.number) LIKE LOWER(?) OR LOWER(cl.name) LIKE LOWER(?) OR LOWER(cl.inn) LIKE LOWER(?)';
    const s = `%${search}%`;
    params.push(s, s, s);
  }
  sql += ' ORDER BY c.id DESC';
  return query<ContractRow>(sql, search ? params : undefined);
}

export function findById(id: number): ContractRow | null {
  return queryOne<ContractRow>(
    `SELECT c.*, cl.name as client_name, cl.inn as client_inn
     FROM contracts c
     LEFT JOIN clients cl ON c.client_id = cl.id
     WHERE c.id = ?`,
    [id]
  );
}

export function create(data: ContractBody): number | bigint {
  return insert('contracts', {
    number: data.number,
    date: data.date,
    client_id: data.clientId,
    type: data.type,
    amount: data.amount ?? 0,
    status: data.status || 'active',
  });
}

export function updateContract(id: number, data: ContractBody): void {
  update('contracts', id, {
    number: data.number,
    date: data.date,
    client_id: data.clientId,
    type: data.type,
    amount: data.amount ?? 0,
    status: data.status || 'active',
  });
}

export function deleteContract(id: number): void {
  remove('contracts', id);
}
