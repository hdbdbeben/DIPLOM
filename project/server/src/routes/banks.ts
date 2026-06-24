/**
 * @fileoverview Модуль маршрутов справочника банков.
 * Обеспечивает CRUD-операции над записями банковских организаций.
 * Маршруты: GET /api/banks, POST /api/banks, PUT /api/banks/:id, DELETE /api/banks/:id.
 *
 * @module routes/banks
 */

import { Router, Request, Response } from 'express';
import * as bankRepo from '../repositories/bankRepo';
import type { BankBody } from '../types';

const router = Router();

/**
 * GET /api/banks
 * Получение списка всех банков.
 *
 * @route {GET} /
 * @param {Request} _req - Объект запроса Express (параметры не требуются).
 * @param {Response} res - Объект ответа Express.
 * @returns {Object[]} 200 — массив объектов банков.
 * @returns {Object} 500 — внутренняя ошибка сервера.
 */
router.get('/', async (_req: Request, res: Response) => {
  try { res.json(await bankRepo.findAll()); } catch (err) { res.status(500).json({ error: (err as Error).message }); }
});

/**
 * POST /api/banks
 * Создание новой записи банка.
 *
 * @route {POST} /
 * @param {Request} req - Объект запроса Express.
 *   В теле запроса ожидаются поля типа BankBody.
 * @param {Response} res - Объект ответа Express.
 * @returns {Object} 200 — объект с полем `id` созданного банка.
 * @returns {Object} 500 — внутренняя ошибка сервера.
 */
router.post('/', async (req: Request, res: Response) => {
  try { res.json({ id: await bankRepo.create(req.body as BankBody) }); } catch (err) { res.status(500).json({ error: (err as Error).message }); }
});

/**
 * PUT /api/banks/:id
 * Обновление данных банка по идентификатору.
 *
 * @route {PUT} /:id
 * @param {Request} req - Объект запроса Express.
 *   Параметр пути: id (number) — идентификатор банка.
 *   В теле запроса ожидаются поля типа BankBody.
 * @param {Response} res - Объект ответа Express.
 * @returns {Object} 200 — объект { ok: true } при успешном обновлении.
 * @returns {Object} 500 — внутренняя ошибка сервера.
 */
router.put('/:id', async (req: Request, res: Response) => {
  try { await bankRepo.updateBank(Number(req.params.id), req.body as BankBody); res.json({ ok: true }); } catch (err) { res.status(500).json({ error: (err as Error).message }); }
});

/**
 * DELETE /api/banks/:id
 * Удаление банка по идентификатору.
 *
 * @route {DELETE} /:id
 * @param {Request} req - Объект запроса Express.
 *   Параметр пути: id (number) — идентификатор банка.
 * @param {Response} res - Объект ответа Express.
 * @returns {Object} 200 — объект { ok: true } при успешном удалении.
 * @returns {Object} 500 — внутренняя ошибка сервера.
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try { await bankRepo.deleteBank(Number(req.params.id)); res.json({ ok: true }); } catch (err) { res.status(500).json({ error: (err as Error).message }); }
});

export default router;
