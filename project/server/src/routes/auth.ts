/**
 * @fileoverview Модуль маршрутов аутентификации.
 * Обрабатывает HTTP-запросы, связанные с входом пользователей в систему.
 * Маршруты: POST /api/auth/login.
 *
 * @module routes/auth
 */

import { Router, Request, Response } from 'express';
import * as authRepo from '../repositories/authRepo';

const router = Router();

/**
 * POST /api/auth/login
 * Аутентификация пользователя по логину и паролю.
 *
 * @description Принимает учётные данные пользователя, проверяет их
 *   через репозиторий аутентификации. При успешной проверке записывает
 *   действие в лог и возвращает профиль пользователя (без пароля).
 *
 * @route {POST} /login
 * @param {Request} req - Объект запроса Express.
 *   В теле запроса ожидаются поля `login` и `password`.
 * @param {Response} res - Объект ответа Express.
 * @returns {Object} 200 — профиль пользователя (id, login, fullName, roleId, role, roleName).
 * @returns {Object} 401 — ошибка «Неверный логин или пароль» при несовпадении учётных данных.
 * @returns {Object} 500 — внутренняя ошибка сервера.
 */
router.post('/login', async (req: Request, res: Response) => {
  try {
    // Аутентификация через репозиторий: возвращает null при неверных учётных данных
    const user = await authRepo.authenticate(req.body);
    if (!user) return res.status(401).json({ error: 'Неверный логин или пароль' });
    // Запись факта входа в лог действий
    await authRepo.logAction(user.id, 'Вход в систему');
    // Возврат публичной информации о пользователе (пароль исключён)
    res.json({
      id: user.id, login: user.login, fullName: user.full_name,
      roleId: user.role_id, role: user.role_code, roleName: user.role_name,
    });
  } catch (err) { res.status(500).json({ error: (err as Error).message }); }
});

export default router;
