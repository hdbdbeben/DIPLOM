import { query, insert, update, remove } from '../db';
import type { PaymentTypeRow, PaymentTypeBody } from '../types';

export async function findAll(): Promise<PaymentTypeRow[]> {
  return query<PaymentTypeRow>('SELECT * FROM payment_types ORDER BY id');
}

export async function create(data: PaymentTypeBody): Promise<number | bigint> {
  return insert('payment_types', { code: data.code, name: data.name });
}

export async function updateType(id: number, data: PaymentTypeBody): Promise<void> {
  await update('payment_types', id, { code: data.code, name: data.name });
}

export async function deleteType(id: number): Promise<void> {
  await remove('payment_types', id);
}
