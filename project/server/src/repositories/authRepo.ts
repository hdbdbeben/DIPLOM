/**
 * @file Репозиторий аутентификации — слой доступа к данным для входа в систему.
 *
 * Управляет проверкой учётных данных пользователей и логированием
 * действий в системе (вход, выход, неудачные попытки).
 */
import { query, queryOne } from '../db';
import type { UserRow, LoginBody } from '../types';

/**
 * Проверяет учётные данные пользователя и возвращает запись при успехе.
 *
 * Выполняет JOIN с таблицей ролей, чтобы сразу получить код и название роли.
 * Проверяет флаг `active = 1` — только активные пользователи могут войти.
 *
 * @param {LoginBody} params - Объект с полями `login` и `password`
 * @param {string} params.login - Логин пользователя
 * @param {string} params.password - Пароль (хранится в открытом виде, только для демо)
 * @returns {Promise<UserRow | null>} Запись пользователя с ролью или null, если учётные данные неверны
 */
export async function authenticate({ login, password }: LoginBody) {
  // Запрос на выборку пользователя с присоединением роли.
  // Проверяется логин, пароль и флаг активности (active = 1).
  const user = await queryOne<UserRow>(
    `SELECT u.*, r.code as role_code, r.name as role_name
     FROM users u JOIN roles r ON u.role_id = r.id
     WHERE u.login = ? AND u.password = ? AND u.active = 1`,
    [login, password]
  );
  return user;
}

/**
 * Записывает действие пользователя в таблицу логов.
 *
 * Используется для аудита: фиксируются входы, выходы и прочие значимые действия.
 * Если действие выполняется анонимно (userId = null), запись всё равно создаётся.
 *
 * @param {number | null} userId - ID пользователя или null для анонимных действий
 * @param {string} action - Текстовое описание действия (например, "Вход в систему")
 * @returns {Promise<void>}
 */
export async function logAction(userId: number | null, action: string) {
  // Вставка записи в таблицу логов. user_id может быть null для неавторизованных действий.
  await query('INSERT INTO logs (user_id, action) VALUES (?, ?)', [userId, action]);
}
