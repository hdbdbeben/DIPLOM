/**
 * @fileoverview Модуль маршрутов обработки банковских выписок.
 * Обеспечивает загрузку, парсинг и автоматическую обработку платёжных документов
 * из файлов выписок, сопоставление контрагентов и классификацию платежей.
 * Маршруты: GET /api/statements, POST /api/statements, DELETE /api/statements/:id.
 *
 * @module routes/statements
 */

import { Router, Request, Response } from 'express';
import * as stmtRepo from '../repositories/statementRepo';
import type { StatementBody, StatementRow, PaymentRow } from '../types';
import { parseNumber, extractInn, extractName, normalizeDate } from '../utils/parsing';
import { generate1CClientBankExchange } from '../utils/1c-export';
import { query, queryOne } from '../db';

const router = Router();

/**
 * GET /api/statements
 * Получение списка всех загруженных выписок.
 *
 * @route {GET} /
 * @param {Request} _req - Объект запроса Express (параметры не требуются).
 * @param {Response} res - Объект ответа Express.
 * @returns {Object[]} 200 — массив объектов выписок с метаданными.
 * @returns {Object} 500 — внутренняя ошибка сервера.
 */
router.get('/', async (_req: Request, res: Response) => {
  try { res.json(await stmtRepo.findAll()); } catch (err) { res.status(500).json({ error: (err as Error).message }); }
});

/**
 * POST /api/statements
 * Загрузка и обработка банковской выписки.
 *
 * @description Основной маршрут импорта платёжных документов. Выполняет:
 *   1. Создание записи выписки в БД.
 *   2. Итеративный парсинг каждого документа: извлечение суммы, ИНН, наименований.
 *   3. Сопоставление плательщика/получателя со справочником клиентов по ИНН или наименованию.
 *   4. Определение направления платежа (поступление/списание) по ИНН организации.
 *   5. Сохранение платежа с автоматическим статусом «processed» (если найден контрагент) или «manual».
 *   6. Регистрация ошибок для платежей, по которым не удалось определить контрагента.
 *   7. Финализацию выписки с подсчётом обработанных и ошибочных записей.
 *   8. Запись действия загрузки в лог.
 *
 * @route {POST} /
 * @param {Request} req - Объект запроса Express.
 *   В теле запроса ожидаются поля типа StatementBody:
 *   fileName (string), documents (массив платёжных документов), userId (number).
 * @param {Response} res - Объект ответа Express.
 * @returns {Object} 200 — объект со сводкой: { statementId, autoProcessed, errorCount, total }.
 * @returns {Object} 500 — внутренняя ошибка сервера.
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { fileName, documents, userId } = req.body as StatementBody;
    // Создание заголовка выписки в БД
    const statementId = await stmtRepo.createStatement(fileName, documents.length, userId) as number;
    // Загрузка справочника клиентов для сопоставления
    const clients = await stmtRepo.getAllClients();

    let autoProcessed = 0, errorCount = 0;

    // Итеративная обработка каждого платёжного документа
    for (const doc of documents) {
      try {
        // Извлечение суммы платежа из строкового представления
        const amount = parseNumber(doc['Сумма'] || '0');
        // Извлечение наименования и ИНН плательщика
        const payerName = extractName(doc['Плательщик']);
        const payerInn = extractInn(doc['Плательщик']);
        // Извлечение наименования и ИНН получателя
        const payeeName = extractName(doc['Получатель']);
        const payeeInn = extractInn(doc['Получатель']);

        // Сопоставление с клиентом: поиск по ИНН или по вхождению наименования
        const matchedClient = clients.find(c =>
          c.inn === payerInn || c.inn === payeeInn ||
          c.name.toLowerCase().includes(payerName.toLowerCase()) ||
          c.name.toLowerCase().includes(payeeName.toLowerCase())
        );

        // Определение направления платежа: ИНН организации или ключевые слова в наименовании
        const isIncome = payeeInn === '7713699602' || payeeName.toLowerCase().includes('социальные услуги');
        const paymentTypeId = isIncome ? 1 : 2;

        // Вставка записи платежа в БД
        const paymentId = await stmtRepo.insertPayment({
          statement_id: statementId,
          doc_number: doc['Номер'] || '',
          doc_date: normalizeDate(doc['Дата']),
          amount, payer_name: payerName, payer_inn: payerInn, payer_account: '',
          payee_name: payeeName, payee_inn: payeeInn, payee_account: '',
          purpose: doc['НазначениеПлатежа'] || '',
          payment_type_id: paymentTypeId,
          client_id: matchedClient?.id ?? null,
          article_id: null,
          status: matchedClient ? 'processed' : 'manual',
        });

        // Если контрагент не найден — регистрируем ошибку для ручной обработки
        if (!matchedClient) {
          await stmtRepo.insertError({
            payment_id: paymentId,
            error_type: 'Неизвестный контрагент',
            description: 'Не удалось найти контрагента: ' + (payerName || payeeName),
            status: 'new',
          });
          errorCount++;
        } else {
          autoProcessed++;
        }
      } catch { errorCount++; }
    }

    // Финализация выписки: запись итоговых счётчиков
    await stmtRepo.finalizeStatement(statementId, autoProcessed, errorCount);
    // Запись действия в лог
    await stmtRepo.logUploadAction(userId, fileName, documents.length);

    res.json({ statementId, autoProcessed, errorCount, total: documents.length });
  } catch (err) { res.status(500).json({ error: (err as Error).message }); }
});

/**
 * DELETE /api/statements/:id
 * Удаление выписки со всеми связанными платежами и ошибками.
 *
 * @route {DELETE} /:id
 * @param {Request} req - Объект запроса Express.
 *   Параметр пути: id (number) — идентификатор выписки.
 * @param {Response} res - Объект ответа Express.
 * @returns {Object} 200 — объект { ok: true } при успешном удалении.
 * @returns {Object} 500 — внутренняя ошибка сервера.
 */
/**
 * GET /api/statements/:id/export
 * Экспорт выписки в формате 1CClientBankExchange для последующей загрузки в 1С.
 *
 * @description Генерирует текстовый файл, содержащий все платёжные документы
 *   выписки в формате, совместимом со штатной обработкой 1С «Загрузка из банка».
 *   Возвращает файл как вложение с Content-Type text/plain и кодировкой Windows-1251.
 *
 * @route {GET} /:id/export
 * @param {Request} req - Объект запроса Express.
 *   Параметр пути: id (number) — идентификатор выписки.
 * @param {Response} res - Объект ответа Express.
 * @returns {text/plain} 200 — текстовый файл в формате 1CClientBankExchange.
 * @returns {Object} 404 — выписка не найдена.
 * @returns {Object} 500 — внутренняя ошибка сервера.
 */
router.get('/:id/export', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const statement = queryOne<StatementRow>('SELECT * FROM statements WHERE id = ?', [id]);
    if (!statement) return res.status(404).json({ error: 'Выписка не найдена' });

    const payments = query<PaymentRow>(
      'SELECT * FROM payments WHERE statement_id = ? ORDER BY id', [id]
    );

    const content = generate1CClientBankExchange(statement, payments);

    res.setHeader('Content-Type', 'text/plain; charset=windows-1251');
    res.setHeader('Content-Disposition', `attachment; filename="export_${id}.txt"`);
    res.send(Buffer.from(content, 'utf-8'));
  } catch (err) { res.status(500).json({ error: (err as Error).message }); }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try { await stmtRepo.deleteStatement(Number(req.params.id)); res.json({ ok: true }); }
  catch (err) { res.status(500).json({ error: (err as Error).message }); }
});

export default router;
