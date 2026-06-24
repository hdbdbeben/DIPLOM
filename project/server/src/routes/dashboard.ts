/**
 * @fileoverview Модуль маршрута панели мониторинга (дашборда).
 * Предоставляет агрегированные метрики системы для отображения
 * на главной странице: количество выписок, платежей, ошибок и т.д.
 * Маршруты: GET /api/dashboard.
 *
 * @module routes/dashboard
 */

import { Router, Request, Response } from 'express';
import * as dashboardRepo from '../repositories/dashboardRepo';

const router = Router();

/**
 * GET /api/dashboard
 * Получение сводных показателей для панели мониторинга.
 *
 * @description Возвращает ключевые метрики системы: общее количество
 *   выписок, обработанных и необработанных платежей, активных ошибок,
 *   а также сводку за последние периоды.
 *
 * @route {GET} /
 * @param {Request} _req - Объект запроса Express (параметры не требуются).
 * @param {Response} res - Объект ответа Express.
 * @returns {Object} 200 — объект с агрегированными показателями дашборда.
 * @returns {Object} 500 — внутренняя ошибка сервера.
 */
router.get('/', async (_req: Request, res: Response) => {
  try { res.json(await dashboardRepo.getDashboard()); } catch (err) { res.status(500).json({ error: (err as Error).message }); }
});
export default router;
