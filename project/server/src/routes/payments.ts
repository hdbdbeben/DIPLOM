/**
 * @fileoverview Модуль маршрутов работы с платёжными документами.
 * Обеспечивает просмотр, фильтрацию и редактирование платёжных записей,
 * полученных в результате обработки банковских выписок.
 * Маршруты: GET /api/payments, GET /api/payments/:id, PUT /api/payments/:id.
 *
 * @module routes/payments
 */

import { Router, Request, Response } from 'express';
import * as payRepo from '../repositories/paymentRepo';
import { generatePaymentOrders } from '../utils/payment-order-export';
import { uploadToBank } from '../utils/ftp-transfer';
import { query, insert, update } from '../db';
import type { PaymentUpdateBody, PaymentCreateBody, PaymentRow } from '../types';

const router = Router();

/**
 * GET /api/payments
 * Получение списка платежей с фильтрацией.
 *
 * @description Поддерживает фильтрацию по выписке, статусу обработки
 *   и поисковому запросу. Параметры передаются через query string.
 *
 * @route {GET} /
 * @param {Request} req - Объект запроса Express.
 *   Query-параметры (все опциональные):
 *   - statementId (string) — фильтр по идентификатору выписки.
 *   - status (string) — фильтр по статусу платежа (processed/manual).
 *   - search (string) — поисковая строка по полям платежа.
 * @param {Response} res - Объект ответа Express.
 * @returns {Object[]} 200 — массив объектов платежей.
 * @returns {Object} 500 — внутренняя ошибка сервера.
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { statementId, status, search } = req.query;
    // Преобразование строковых параметров запроса в нужные типы
    const result = await payRepo.findAll({
      statementId: statementId ? Number(statementId) : undefined,
      status: status as string | undefined,
      search: search as string | undefined,
    });
    res.json(result);
  } catch (err) { res.status(500).json({ error: (err as Error).message }); }
});

/**
 * GET /api/payments/:id
 * Получение одного платежа по идентификатору.
 *
 * @route {GET} /:id
 * @param {Request} req - Объект запроса Express.
 *   Параметр пути: id (number) — идентификатор платежа.
 * @param {Response} res - Объект ответа Express.
 * @returns {Object} 200 — объект платежа с детальной информацией.
 * @returns {Object} 404 — платёж не найден.
 * @returns {Object} 500 — внутренняя ошибка сервера.
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const p = await payRepo.findById(Number(req.params.id));
    if (!p) return res.status(404).json({ error: 'Платёж не найден' });
    res.json(p);
  } catch (err) { res.status(500).json({ error: (err as Error).message }); }
});

/**
 * PUT /api/payments/:id
 * Обновление данных платежа (ручная корректировка).
 *
 * @description Позволяет вручную изменить атрибуты платежа:
 *   привязать клиента, статью бюджета, изменить статус.
 *
 * @route {PUT} /:id
 * @param {Request} req - Объект запроса Express.
 *   Параметр пути: id (number) — идентификатор платежа.
 *   В теле запроса ожидаются поля типа PaymentUpdateBody.
 * @param {Response} res - Объект ответа Express.
 * @returns {Object} 200 — объект { ok: true } при успешном обновлении.
 * @returns {Object} 500 — внутренняя ошибка сервера.
 */
router.put('/:id', async (req: Request, res: Response) => {
  try {
    await payRepo.updatePayment(Number(req.params.id), req.body as PaymentUpdateBody);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: (err as Error).message }); }
});

/**
 * POST /api/payments
 * Создание нового платежа (ручной ввод пользователем).
 *
 * @description Создаёт новый платёж без привязки к банковской выписке.
 *   Используется для ручного ввода платежей через интерфейс.
 *
 * @route {POST} /
 * @param {Request} req - Объект запроса Express.
 *   В теле запроса ожидаются поля типа PaymentCreateBody.
 * @param {Response} res - Объект ответа Express.
 * @returns {Object} 201 — созданный объект платежа.
 * @returns {Object} 500 — внутренняя ошибка сервера.
 */
/**
 * POST /api/payments/send-to-bank
 * Формирование файла платёжных поручений для отправки в банк.
 *
 * @description Генерирует файл в формате 1CClientBankExchange, содержащий
 *   выбранные платёжные поручения для отправки в банк. Файл возвращается
 *   как вложение для загрузки. Платежи помечаются статусом 'sent_to_bank'.
 *
 * @route {POST} /send-to-bank
 * @param {Request} req - Объект запроса Express.
 *   В теле запроса ожидаются: paymentIds (number[]), userId (number|null).
 * @param {Response} res - Объект ответа Express.
 * @returns {text/plain} 200 — файл платёжных поручений.
 * @returns {Object} 500 — внутренняя ошибка сервера.
 */
router.post('/send-to-bank', async (req: Request, res: Response) => {
  try {
    const { paymentIds, userId } = req.body as { paymentIds: number[]; userId?: number };
    const payments: PaymentRow[] = [];
    for (const id of paymentIds) {
      const p = await payRepo.findById(id);
      if (p) {
        payments.push(p);
        update('payments', id, { status: 'sent_to_bank' });
      }
    }

    const content = generatePaymentOrders(payments);
    const filename = `payment_orders_${new Date().toISOString().slice(0, 10).replace(/-/g, '')}.txt`;

    insert('logs', {
      user_id: userId ?? null,
      action: `Сформирован файл платёжных поручений для банка: ${filename} (${payments.length} шт.)`,
    });

    res.setHeader('Content-Type', 'text/plain; charset=windows-1251');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(Buffer.from(content, 'utf-8'));
  } catch (err) { res.status(500).json({ error: (err as Error).message }); }
});

/**
 * POST /api/payments/send-to-bank-ftp
 * Формирование и отправка платёжных поручений в банк через FTP.
 *
 * @description Генерирует файл платёжных поручений и отправляет его
 *   на FTP-сервер банка. Настройки FTP берутся из переменных окружения.
 *
 * @route {POST} /send-to-bank-ftp
 * @param {Request} req - Объект запроса Express.
 *   В теле запроса ожидаются: paymentIds (number[]), userId (number|null).
 * @param {Response} res - Объект ответа Express.
 * @returns {Object} 200 — результат отправки { success, path, paymentsSent }.
 * @returns {Object} 500 — внутренняя ошибка сервера.
 */
router.post('/send-to-bank-ftp', async (req: Request, res: Response) => {
  try {
    const { paymentIds, userId } = req.body as { paymentIds: number[]; userId?: number };
    const payments: PaymentRow[] = [];
    for (const id of paymentIds) {
      const p = await payRepo.findById(id);
      if (p) payments.push(p);
    }

    const content = generatePaymentOrders(payments);
    const filename = `payment_orders_${new Date().toISOString().slice(0, 10).replace(/-/g, '')}.txt`;

    const result = await uploadToBank(content, filename, {}, userId);

    if (result.success) {
      for (const p of payments) {
        update('payments', p.id, { status: 'sent_to_bank' });
      }
      res.json({ success: true, path: result.path, paymentsSent: payments.length });
    } else {
      res.json({ success: false, error: result.error, paymentsSent: 0 });
    }
  } catch (err) { res.status(500).json({ error: (err as Error).message }); }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const payment = await payRepo.createPayment(req.body as PaymentCreateBody);
    res.status(201).json(payment);
  } catch (err) { res.status(500).json({ error: (err as Error).message }); }
});

export default router;
