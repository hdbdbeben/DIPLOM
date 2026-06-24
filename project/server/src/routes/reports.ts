/**
 * @fileoverview Модуль маршрутов формирования отчётов.
 * Обеспечивает генерацию аналитических отчётов по платёжным данным
 * за заданный период.
 * Маршруты: GET /api/reports/dds.
 *
 * @module routes/reports
 */

import { Router, Request, Response } from 'express';
import * as reportRepo from '../repositories/reportRepo';

const router = Router();

/**
 * GET /api/reports/dds
 * Генерация отчёта о движении денежных средств (ДДС).
 *
 * @description Формирует сводный отчёт по поступлениям и списаниям
 *   за указанный период (или за всё время, если период не задан).
 *   Принимает query-параметры `from` и `to` для фильтрации по дате.
 *
 * @route {GET} /dds
 * @param {Request} req - Объект запроса Express.
 *   Query-параметры (все опциональные):
 *   - from (string) — начальная дата периода в формате ISO.
 *   - to (string) — конечная дата периода в формате ISO.
 * @param {Response} res - Объект ответа Express.
 * @returns {Object} 200 — объект отчёта со сводными данными.
 * @returns {Object} 500 — внутренняя ошибка сервера.
 */
router.get('/dds', async (req: Request, res: Response) => {
  try {
    const { from, to } = req.query as { from?: string; to?: string };
    res.json(await reportRepo.generateReport({ from, to }));
  } catch (err) { res.status(500).json({ error: (err as Error).message }); }
});

export default router;
