/**
 * @fileoverview Модуль маршрутов справочника статей бюджета.
 * Обеспечивает CRUD-операции над бюджетными статьями (классификация платежей).
 * Маршруты: GET /api/articles, POST /api/articles, PUT /api/articles/:id, DELETE /api/articles/:id.
 *
 * @module routes/articles
 */

import { Router, Request, Response } from 'express';
import * as articleRepo from '../repositories/articleRepo';
import type { ArticleBody } from '../types';

const router = Router();

/**
 * GET /api/articles
 * Получение списка всех статей бюджета.
 *
 * @route {GET} /
 * @param {Request} _req - Объект запроса Express (параметры не требуются).
 * @param {Response} res - Объект ответа Express.
 * @returns {Object[]} 200 — массив объектов статей бюджета.
 * @returns {Object} 500 — внутренняя ошибка сервера.
 */
router.get('/', async (_req: Request, res: Response) => { try { res.json(await articleRepo.findAll()); } catch (err) { res.status(500).json({ error: (err as Error).message }); } });

/**
 * POST /api/articles
 * Создание новой статьи бюджета.
 *
 * @route {POST} /
 * @param {Request} req - Объект запроса Express.
 *   В теле запроса ожидаются поля типа ArticleBody.
 * @param {Response} res - Объект ответа Express.
 * @returns {Object} 200 — объект с полем `id` созданной статьи.
 * @returns {Object} 500 — внутренняя ошибка сервера.
 */
router.post('/', async (req: Request, res: Response) => { try { res.json({ id: await articleRepo.create(req.body as ArticleBody) }); } catch (err) { res.status(500).json({ error: (err as Error).message }); } });

/**
 * PUT /api/articles/:id
 * Обновление данных статьи бюджета по идентификатору.
 *
 * @route {PUT} /:id
 * @param {Request} req - Объект запроса Express.
 *   Параметр пути: id (number) — идентификатор статьи.
 *   В теле запроса ожидаются поля типа ArticleBody.
 * @param {Response} res - Объект ответа Express.
 * @returns {Object} 200 — объект { ok: true } при успешном обновлении.
 * @returns {Object} 500 — внутренняя ошибка сервера.
 */
router.put('/:id', async (req: Request, res: Response) => { try { await articleRepo.updateArticle(Number(req.params.id), req.body as ArticleBody); res.json({ ok: true }); } catch (err) { res.status(500).json({ error: (err as Error).message }); } });

/**
 * DELETE /api/articles/:id
 * Удаление статьи бюджета по идентификатору.
 *
 * @route {DELETE} /:id
 * @param {Request} req - Объект запроса Express.
 *   Параметр пути: id (number) — идентификатор статьи.
 * @param {Response} res - Объект ответа Express.
 * @returns {Object} 200 — объект { ok: true } при успешном удалении.
 * @returns {Object} 500 — внутренняя ошибка сервера.
 */
router.delete('/:id', async (req: Request, res: Response) => { try { await articleRepo.deleteArticle(Number(req.params.id)); res.json({ ok: true }); } catch (err) { res.status(500).json({ error: (err as Error).message }); } });

export default router;
