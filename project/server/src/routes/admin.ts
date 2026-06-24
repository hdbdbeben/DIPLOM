/**
 * @fileoverview Модуль маршрутов администрирования системы.
 * Обеспечивает операции резервного копирования, восстановления из копии
 * и полного сброса данных.
 * Маршруты: POST /api/admin/backup, POST /api/admin/restore, POST /api/admin/reset.
 *
 * @module routes/admin
 */

import { Router, Request, Response } from 'express';
import * as adminRepo from '../repositories/adminRepo';

const router = Router();

/**
 * POST /api/admin/backup
 * Создание резервной копии базы данных.
 *
 * @description Создаёт полный дамп базы данных в файл.
 *   Принимает идентификатор пользователя для записи действия в лог.
 *
 * @route {POST} /backup
 * @param {Request} req - Объект запроса Express.
 *   В теле запроса: userId (number, опционально) — идентификатор пользователя.
 * @param {Response} res - Объект ответа Express.
 * @returns {Object} 200 — { ok: true, path: string } с путём к созданному файлу копии.
 * @returns {Object} 500 — внутренняя ошибка сервера.
 */
router.post('/backup', async (req: Request, res: Response) => {
  try { const p = await adminRepo.backup(req.body.userId ?? null); res.json({ ok: true, path: p }); }
  catch (err) { res.status(500).json({ error: (err as Error).message }); }
});

/**
 * POST /api/admin/restore
 * Восстановление базы данных из резервной копии.
 *
 * @description Восстанавливает состояние БД из ранее созданного файла
 *   резервной копии. Требует указания пути к файлу.
 *
 * @route {POST} /restore
 * @param {Request} req - Объект запроса Express.
 *   В теле запроса:
 *   - path (string) — путь к файлу резервной копии.
 *   - userId (number, опционально) — идентификатор пользователя.
 * @param {Response} res - Объект ответа Express.
 * @returns {Object} 200 — { ok: true, message: string } с сообщением о результате.
 * @returns {Object} 400 — файл резервной копии не найден.
 * @returns {Object} 500 — внутренняя ошибка сервера.
 */
router.post('/restore', async (req: Request, res: Response) => {
  try {
    const message = await adminRepo.restore(req.body.path, req.body.userId ?? null);
    res.json({ ok: true, message });
  } catch (err) { res.status((err as Error).message === 'Файл резервной копии не найден' ? 400 : 500).json({ error: (err as Error).message }); }
});

/**
 * POST /api/admin/reset
 * Полный сброс всех данных системы.
 *
 * @description Удаляет все платёжные данные, выписки, ошибки и логи,
 *   возвращая систему к начальному состоянию. Справочники сохраняются.
 *
 * @route {POST} /reset
 * @param {Request} _req - Объект запроса Express (параметры не требуются).
 * @param {Response} res - Объект ответа Express.
 * @returns {Object} 200 — { ok: true, message: string } с сообщением о результате.
 * @returns {Object} 500 — внутренняя ошибка сервера.
 */
router.post('/reset', async (_req: Request, res: Response) => {
  try { const message = await adminRepo.reset(); res.json({ ok: true, message }); }
  catch (err) { res.status(500).json({ error: (err as Error).message }); }
});

export default router;
