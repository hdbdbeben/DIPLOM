/**
 * @fileoverview Модуль маршрутов справочника ролей.
 * Предоставляет доступ к списку ролей системы (администратор, оператор и т.д.).
 * Маршруты: GET /api/roles.
 *
 * @module routes/roles
 */

import { Router, Request, Response } from 'express';
import * as roleRepo from '../repositories/roleRepo';

const router = Router();

/**
 * GET /api/roles
 * Получение списка всех ролей системы.
 *
 * @description Возвращает полный перечень ролей из базы данных,
 *   используемых для разграничения прав доступа.
 *
 * @route {GET} /
 * @param {Request} _req - Объект запроса Express (параметры не требуются).
 * @param {Response} res - Объект ответа Express.
 * @returns {Object[]} 200 — массив объектов ролей.
 * @returns {Object} 500 — внутренняя ошибка сервера.
 */
router.get('/', async (_req: Request, res: Response) => {
  try { res.json(await roleRepo.findAll()); } catch (err) { res.status(500).json({ error: (err as Error).message }); }
});
export default router;
