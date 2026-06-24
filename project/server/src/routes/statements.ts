import { Router, Request, Response } from 'express';
import * as stmtRepo from '../repositories/statementRepo';
import type { StatementBody } from '../types';
import { parseNumber, extractInn, extractName, normalizeDate } from '../utils/parsing';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  try { res.json(await stmtRepo.findAll()); } catch (err) { res.status(500).json({ error: (err as Error).message }); }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const { fileName, documents, userId } = req.body as StatementBody;
    const statementId = await stmtRepo.createStatement(fileName, documents.length, userId) as number;
    const clients = await stmtRepo.getAllClients();

    let autoProcessed = 0, errorCount = 0;

    for (const doc of documents) {
      try {
        const amount = parseNumber(doc['Сумма'] || '0');
        const payerName = extractName(doc['Плательщик']);
        const payerInn = extractInn(doc['Плательщик']);
        const payeeName = extractName(doc['Получатель']);
        const payeeInn = extractInn(doc['Получатель']);

        const matchedClient = clients.find(c =>
          c.inn === payerInn || c.inn === payeeInn ||
          c.name.toLowerCase().includes(payerName.toLowerCase()) ||
          c.name.toLowerCase().includes(payeeName.toLowerCase())
        );

        const isIncome = payeeInn === '7713699602' || payeeName.toLowerCase().includes('социальные услуги');
        const paymentTypeId = isIncome ? 1 : 2;

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

    await stmtRepo.finalizeStatement(statementId, autoProcessed, errorCount);
    await stmtRepo.logUploadAction(userId, fileName, documents.length);

    res.json({ statementId, autoProcessed, errorCount, total: documents.length });
  } catch (err) { res.status(500).json({ error: (err as Error).message }); }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try { await stmtRepo.deleteStatement(Number(req.params.id)); res.json({ ok: true }); }
  catch (err) { res.status(500).json({ error: (err as Error).message }); }
});

export default router;
