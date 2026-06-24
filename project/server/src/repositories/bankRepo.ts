import { query, insert, update, remove } from '../db';
import type { BankRow, BankBody } from '../types';

export async function findAll(): Promise<BankRow[]> {
  return query<BankRow>('SELECT * FROM banks ORDER BY id');
}

export async function create(data: BankBody): Promise<number | bigint> {
  return insert('banks', { name: data.name, bik: data.bik, corr_account: data.corrAccount });
}

export async function updateBank(id: number, data: BankBody): Promise<void> {
  await update('banks', id, { name: data.name, bik: data.bik, corr_account: data.corrAccount });
}

export async function deleteBank(id: number): Promise<void> {
  await remove('banks', id);
}
