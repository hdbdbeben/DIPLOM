/**
 * @fileoverview Модуль маршрутов справочника клиентов (контрагентов).
 * Обеспечивает CRUD-операции над записями клиентов, а также поиск по наименованию.
 * Маршруты: GET /api/clients, POST /api/clients, PUT /api/clients/:id, DELETE /api/clients/:id.
 *
 * @module routes/clients
 */

import { Router, Request, Response } from 'express';
import * as clientRepo from '../repositories/clientRepo';
import type { ClientBody } from '../types';

const router = Router();

/**
 * GET /api/clients
 * Получение списка клиентов с возможностью поиска.
 *
 * @description Поддерживает фильтрацию по поисковому запросу,
 *   переданному в query-параметре `search`.
 *
 * @route {GET} /
 * @param {Request} req - Объект запроса Express.
 *   Query-параметр: search (string, опционально) — строка поиска по наименованию клиента.
 * @param {Response} res - Объект ответа Express.
 * @returns {Object[]} 200 — массив объектов клиентов.
 * @returns {Object} 500 — внутренняя ошибка сервера.
 */
router.get('/', async (req: Request, res: Response) => {
  try { res.json(await clientRepo.findAll(req.query.search as string)); } catch (err) { res.status(500).json({ error: (err as Error).message }); }
});

/**
 * POST /api/clients
 * Создание нового клиента.
 *
 * @route {POST} /
 * @param {Request} req - Объект запроса Express.
 *   В теле запроса ожидаются поля типа ClientBody.
 * @param {Response} res - Объект ответа Express.
 * @returns {Object} 200 — объект с полем `id` созданного клиента.
 * @returns {Object} 500 — внутренняя ошибка сервера.
 */
router.post('/', async (req: Request, res: Response) => {
  try { res.json({ id: await clientRepo.create(req.body as ClientBody) }); } catch (err) { res.status(500).json({ error: (err as Error).message }); }
});

/**
 * PUT /api/clients/:id
 * Обновление данных клиента по идентификатору.
 *
 * @route {PUT} /:id
 * @param {Request} req - Объект запроса Express.
 *   Параметр пути: id (number) — идентификатор клиента.
 *   В теле запроса ожидаются поля типа ClientBody.
 * @param {Response} res - Объект ответа Express.
 * @returns {Object} 200 — объект { ok: true } при успешном обновлении.
 * @returns {Object} 500 — внутренняя ошибка сервера.
 */
router.put('/:id', async (req: Request, res: Response) => {
  try { await clientRepo.updateClient(Number(req.params.id), req.body as ClientBody); res.json({ ok: true }); } catch (err) { res.status(500).json({ error: (err as Error).message }); }
});

/**
 * DELETE /api/clients/:id
 * Удаление клиента по идентификатору.
 *
 * @route {DELETE} /:id
 * @param {Request} req - Объект запроса Express.
 *   Параметр пути: id (number) — идентификатор клиента.
 * @param {Response} res - Объект ответа Express.
 * @returns {Object} 200 — объект { ok: true } при успешном удалении.
 * @returns {Object} 500 — внутренняя ошибка сервера.
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try { await clientRepo.deleteClient(Number(req.params.id)); res.json({ ok: true }); } catch (err) { res.status(500).json({ error: (err as Error).message }); }
});

export default router;
