/**
 * @fileoverview Модуль маршрутов работы с ошибками обработки платежей.
 * Предоставляет просмотр и обновление статуса ошибок, возникающих
 * при автоматической обработке банковских выписок.
 * Маршруты: GET /api/errors, PUT /api/errors/:id.
 *
 * @module routes/errors
 */

import { Router, Request, Response } from 'express';
import * as errorRepo from '../repositories/errorRepo';
import type { ErrorUpdateBody } from '../types';

const router = Router();

/**
 * GET /api/errors
 * Получение списка ошибок обработки с фильтрацией по статусу.
 *
 * @route {GET} /
 * @param {Request} req - Объект запроса Express.
 *   Query-параметр: status (string, опционально) — фильтр по статусу ошибки (new/resolved).
 * @param {Response} res - Объект ответа Express.
 * @returns {Object[]} 200 — массив объектов ошибок.
 * @returns {Object} 500 — внутренняя ошибка сервера.
 */
router.get('/', async (req: Request, res: Response) => {
  try { res.json(await errorRepo.findAll(req.query.status as string)); } catch (err) { res.status(500).json({ error: (err as Error).message }); }
});

/**
 * PUT /api/errors/:id
 * Обновление статуса ошибки (разрешение/игнорирование).
 *
 * @description Позволяет изменить статус ошибки, например пометить её
 *   как разрешённую после ручной корректировки платежа.
 *
 * @route {PUT} /:id
 * @param {Request} req - Объект запроса Express.
 *   Параметр пути: id (number) — идентификатор ошибки.
 *   В теле запроса ожидаются поля типа ErrorUpdateBody (статус, примечание).
 * @param {Response} res - Объект ответа Express.
 * @returns {Object} 200 — объект { ok: true } при успешном обновлении.
 * @returns {Object} 500 — внутренняя ошибка сервера.
 */
router.put('/:id', async (req: Request, res: Response) => {
  try {
    await errorRepo.updateError(Number(req.params.id), req.body as ErrorUpdateBody);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: (err as Error).message }); }
});

export default router;
