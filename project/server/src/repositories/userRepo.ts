import { query, queryOne, insert, update, remove } from '../db';
import type { UserRow, UserBody } from '../types';

export async function findAll(): Promise<UserRow[]> {
  return query<UserRow>(
    `SELECT u.id, u.login, u.full_name, u.role_id, u.active,
            r.code as role_code, r.name as role_name
     FROM users u JOIN roles r ON u.role_id = r.id
     ORDER BY u.id`
  );
}

export async function findById(id: number): Promise<UserRow | null> {
  return queryOne<UserRow>(
    `SELECT u.*, r.code as role_code, r.name as role_name
     FROM users u JOIN roles r ON u.role_id = r.id WHERE u.id = ?`,
    [id]
  );
}

export async function findByLogin(login: string): Promise<{ id: number } | null> {
  return queryOne<{ id: number }>('SELECT id FROM users WHERE login = ?', [login]);
}

export async function create(data: { login: string; password: string; fullName: string; roleId: number }): Promise<number | bigint> {
  return insert('users', { login: data.login, password: data.password, full_name: data.fullName, role_id: data.roleId, active: 1 });
}

export async function updateUser(id: number, data: Record<string, unknown>): Promise<void> {
  await update('users', id, data);
}

export async function deleteUser(id: number): Promise<void> {
  await remove('users', id);
}
