/**
 * @file Репозиторий пользователей — слой доступа к данным пользователей системы.
 *
 * Управляет CRUD-операциями над пользователями: создание, чтение,
 * обновление, удаление. Каждый пользователь привязан к роли,
 * которая определяет его права доступа.
 */
import { query, queryOne, insert, update, remove } from '../db';
import type { UserRow, UserBody } from '../types';

/**
 * Возвращает список всех пользователей с информацией о ролях.
 *
 * Выполняет JOIN с таблицей ролей для получения кода и названия роли.
 * Пароли не возвращаются в результирующем наборе (выбраны только нужные поля).
 *
 * @returns {Promise<UserRow[]>} Массив пользователей с полями роли (role_code, role_name)
 */
export async function findAll(): Promise<UserRow[]> {
  // Выборка пользователей с присоединением ролей.
  // Пароль исключён из выборки — возвращаются только публичные поля.
  return query<UserRow>(
    `SELECT u.id, u.login, u.full_name, u.role_id, u.active,
            r.code as role_code, r.name as role_name
     FROM users u JOIN roles r ON u.role_id = r.id
     ORDER BY u.id`
  );
}

/**
 * Находит пользователя по идентификатору.
 *
 * Возвращает полную информацию о пользователе, включая роль (код и имя).
 * Используется для страницы редактирования профиля и проверки прав.
 *
 * @param {number} id - Идентификатор пользователя
 * @returns {Promise<UserRow | null>} Запись пользователя или null, если не найден
 */
export async function findById(id: number): Promise<UserRow | null> {
  // Точечная выборка одного пользователя по первичному ключу с присоединением роли
  return queryOne<UserRow>(
    `SELECT u.*, r.code as role_code, r.name as role_name
     FROM users u JOIN roles r ON u.role_id = r.id WHERE u.id = ?`,
    [id]
  );
}

/**
 * Проверяет существование пользователя с указанным логином.
 *
 * Используется при регистрации и редактировании для проверки уникальности логина.
 * Возвращает только ID — минимально необходимую информацию.
 *
 * @param {string} login - Логин для проверки
 * @returns {Promise<{ id: number } | null>} Объект с ID, если пользователь существует, иначе null
 */
export async function findByLogin(login: string): Promise<{ id: number } | null> {
  // Проверка уникальности логина: ищем запись только по логину
  return queryOne<{ id: number }>('SELECT id FROM users WHERE login = ?', [login]);
}

/**
 * Создаёт нового пользователя.
 *
 * При создании флаг `active` устанавливается в 1 (активен по умолчанию).
 * Поле `fullName` маппится в `full_name` (snake_case для БД).
 *
 * @param {Object} data - Данные нового пользователя
 * @param {string} data.login - Логин
 * @param {string} data.password - Пароль
 * @param {string} data.fullName - Полное имя (ФИО)
 * @param {number} data.roleId - ID роли
 * @returns {Promise<number | bigint>} ID созданной записи
 */
export async function create(data: { login: string; password: string; fullName: string; roleId: number }): Promise<number | bigint> {
  // Маппинг camelCase-полей в snake_case для вставки в БД.
  // Поле active = 1 (пользователь активен по умолчанию).
  return insert('users', { login: data.login, password: data.password, full_name: data.fullName, role_id: data.roleId, active: 1 });
}

/**
 * Обновляет данные пользователя по идентификатору.
 *
 * Принимает произвольный набор полей для обновления (частичное обновление).
 * Позволяет изменить логин, пароль, ФИО, роль, статус активности.
 *
 * @param {number} id - ID пользователя
 * @param {Record<string, unknown>} data - Объект с обновляемыми полями (ключи в snake_case)
 * @returns {Promise<void>}
 */
export async function updateUser(id: number, data: Record<string, unknown>): Promise<void> {
  await update('users', id, data);
}

/**
 * Удаляет пользователя по идентификатору.
 *
 * Физическое удаление записи из таблицы users.
 * ВАЖНО: не проверяет связанные записи (логи, операции) — каскадное удаление
 * должно быть настроено на уровне схемы БД или обрабатываться бизнес-логикой.
 *
 * @param {number} id - ID пользователя для удаления
 * @returns {Promise<void>}
 */
export async function deleteUser(id: number): Promise<void> {
  await remove('users', id);
}
