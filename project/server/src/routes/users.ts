/**
 * @fileoverview Модуль маршрутов управления пользователями.
 * Обеспечивает CRUD-операции над учётными записями пользователей системы.
 * Маршруты: GET /api/users, POST /api/users, PUT /api/users/:id, DELETE /api/users/:id.
 *
 * @module routes/users
 */

import { Router, Request, Response } from 'express';
import * as userRepo from '../repositories/userRepo';
import type { UserBody } from '../types';

const router = Router();

/**
 * GET /api/users
 * Получение списка всех пользователей системы.
 *
 * @route {GET} /
 * @param {Request} _req - Объект запроса Express (параметры не требуются).
 * @param {Response} res - Объект ответа Express.
 * @returns {Object[]} 200 — массив объектов пользователей.
 * @returns {Object} 500 — внутренняя ошибка сервера.
 */
router.get('/', async (_req: Request, res: Response) => {
  try { res.json(await userRepo.findAll()); } catch (err) { res.status(500).json({ error: (err as Error).message }); }
});

/**
 * POST /api/users
 * Создание нового пользователя.
 *
 * @description Принимает данные нового пользователя, проверяет обязательность
 *   пароля и уникальность логина, затем создаёт запись в базе данных.
 *
 * @route {POST} /
 * @param {Request} req - Объект запроса Express.
 *   В теле запроса ожидаются поля: login, password, fullName, roleId.
 * @param {Response} res - Объект ответа Express.
 * @returns {Object} 200 — объект с полем `id` созданного пользователя.
 * @returns {Object} 400 — ошибка валидации (отсутствует пароль или логин уже занят).
 * @returns {Object} 500 — внутренняя ошибка сервера.
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { login, password, fullName, roleId } = req.body as UserBody;
    // Проверка обязательности пароля
    if (!password) return res.status(400).json({ error: 'Пароль обязателен' });
    // Проверка уникальности логина
    const existing = await userRepo.findByLogin(login);
    if (existing) return res.status(400).json({ error: 'Пользователь с таким логином уже существует' });
    // Создание пользователя в БД
    const id = await userRepo.create({ login, password, fullName, roleId });
    res.json({ id });
  } catch (err) { res.status(500).json({ error: (err as Error).message }); }
});

/**
 * PUT /api/users/:id
 * Обновление данных существующего пользователя.
 *
 * @description Принимает новые значения полей профиля. Пароль обновляется
 *   только если он передан непустым. Поле `active` преобразуется в числовой
 *   флаг (1/0) для хранения в БД.
 *
 * @route {PUT} /:id
 * @param {Request} req - Объект запроса Express.
 *   Параметр пути: id (number) — идентификатор пользователя.
 *   В теле запроса ожидаются поля: login, password (опционально), fullName, roleId, active.
 * @param {Response} res - Объект ответа Express.
 * @returns {Object} 200 — объект { ok: true } при успешном обновлении.
 * @returns {Object} 500 — внутренняя ошибка сервера.
 */
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { login, password, fullName, roleId, active } = req.body as UserBody;
    // Преобразование полей к формату хранения в БД (snake_case)
    const data: Record<string, unknown> = { login, full_name: fullName, role_id: roleId, active: active ? 1 : 0 };
    // Пароль обновляется только если передан (непустой)
    if (password) data.password = password;
    await userRepo.updateUser(Number(req.params.id), data);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: (err as Error).message }); }
});

/**
 * DELETE /api/users/:id
 * Удаление пользователя по идентификатору.
 *
 * @route {DELETE} /:id
 * @param {Request} req - Объект запроса Express.
 *   Параметр пути: id (number) — идентификатор пользователя.
 * @param {Response} res - Объект ответа Express.
 * @returns {Object} 200 — объект { ok: true } при успешном удалении.
 * @returns {Object} 500 — внутренняя ошибка сервера.
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try { await userRepo.deleteUser(Number(req.params.id)); res.json({ ok: true }); }
  catch (err) { res.status(500).json({ error: (err as Error).message }); }
});

export default router;
