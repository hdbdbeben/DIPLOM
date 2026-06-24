import { query, queryOne } from '../db';
import type { UserRow, LoginBody } from '../types';

export async function authenticate({ login, password }: LoginBody) {
  const user = await queryOne<UserRow>(
    `SELECT u.*, r.code as role_code, r.name as role_name
     FROM users u JOIN roles r ON u.role_id = r.id
     WHERE u.login = ? AND u.password = ? AND u.active = 1`,
    [login, password]
  );
  return user;
}

export async function logAction(userId: number | null, action: string) {
  await query('INSERT INTO logs (user_id, action) VALUES (?, ?)', [userId, action]);
}
