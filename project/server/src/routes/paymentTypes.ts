/**
 * @fileoverview Модуль маршрутов справочника типов платежей.
 * Обеспечивает CRUD-операции над типами платежей (поступление, списание и т.д.).
 * Маршруты: GET /api/payment-types, POST /api/payment-types,
 *   PUT /api/payment-types/:id, DELETE /api/payment-types/:id.
 *
 * @module routes/paymentTypes
 */

import { Router, Request, Response } from 'express';
import * as ptRepo from '../repositories/paymentTypeRepo';
import type { PaymentTypeBody } from '../types';

const router = Router();

/**
 * GET /api/payment-types
 * Получение списка всех типов платежей.
 *
 * @route {GET} /
 * @param {Request} _req - Объект запроса Express (параметры не требуются).
 * @param {Response} res - Объект ответа Express.
 * @returns {Object[]} 200 — массив объектов типов платежей.
 * @returns {Object} 500 — внутренняя ошибка сервера.
 */
router.get('/', async (_req: Request, res: Response) => { try { res.json(await ptRepo.findAll()); } catch (err) { res.status(500).json({ error: (err as Error).message }); } });

/**
 * POST /api/payment-types
 * Создание нового типа платежа.
 *
 * @route {POST} /
 * @param {Request} req - Объект запроса Express.
 *   В теле запроса ожидаются поля типа PaymentTypeBody.
 * @param {Response} res - Объект ответа Express.
 * @returns {Object} 200 — объект с полем `id` созданного типа платежа.
 * @returns {Object} 500 — внутренняя ошибка сервера.
 */
router.post('/', async (req: Request, res: Response) => { try { res.json({ id: await ptRepo.create(req.body as PaymentTypeBody) }); } catch (err) { res.status(500).json({ error: (err as Error).message }); } });

/**
 * PUT /api/payment-types/:id
 * Обновление данных типа платежа по идентификатору.
 *
 * @route {PUT} /:id
 * @param {Request} req - Объект запроса Express.
 *   Параметр пути: id (number) — идентификатор типа платежа.
 *   В теле запроса ожидаются поля типа PaymentTypeBody.
 * @param {Response} res - Объект ответа Express.
 * @returns {Object} 200 — объект { ok: true } при успешном обновлении.
 * @returns {Object} 500 — внутренняя ошибка сервера.
 */
router.put('/:id', async (req: Request, res: Response) => { try { await ptRepo.updateType(Number(req.params.id), req.body as PaymentTypeBody); res.json({ ok: true }); } catch (err) { res.status(500).json({ error: (err as Error).message }); } });

/**
 * DELETE /api/payment-types/:id
 * Удаление типа платежа по идентификатору.
 *
 * @route {DELETE} /:id
 * @param {Request} req - Объект запроса Express.
 *   Параметр пути: id (number) — идентификатор типа платежа.
 * @param {Response} res - Объект ответа Express.
 * @returns {Object} 200 — объект { ok: true } при успешном удалении.
 * @returns {Object} 500 — внутренняя ошибка сервера.
 */
router.delete('/:id', async (req: Request, res: Response) => { try { await ptRepo.deleteType(Number(req.params.id)); res.json({ ok: true }); } catch (err) { res.status(500).json({ error: (err as Error).message }); } });

export default router;
