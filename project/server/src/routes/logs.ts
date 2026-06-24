/**
 * @fileoverview Модуль маршрутов журнала действий пользователей.
 * Предоставляет просмотр истории действий (входы, загрузки выписок и т.д.).
 * Маршруты: GET /api/logs.
 *
 * @module routes/logs
 */

import { Router, Request, Response } from 'express';
import * as logRepo from '../repositories/logRepo';

const router = Router();

/**
 * GET /api/logs
 * Получение полного журнала действий пользователей.
 *
 * @description Возвращает все записи лога действий, отсортированные
 *   по времени события (от новых к старым).
 *
 * @route {GET} /
 * @param {Request} _req - Объект запроса Express (параметры не требуются).
 * @param {Response} res - Объект ответа Express.
 * @returns {Object[]} 200 — массив записей журнала действий.
 * @returns {Object} 500 — внутренняя ошибка сервера.
 */
router.get('/', async (_req: Request, res: Response) => {
  try { res.json(await logRepo.findAll()); } catch (err) { res.status(500).json({ error: (err as Error).message }); }
});
export default router;
