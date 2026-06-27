import { Router, Request, Response } from 'express';
import * as oneCRepo from '../repositories/oneCRepo';
import * as contractRepo from '../repositories/contractRepo';
import { query, insert, update } from '../db';
import type { ClientRow } from '../types';

const router = Router();

router.get('/organizations', (_req: Request, res: Response) => {
  try {
    res.json([
      { id: 1, name: 'ООО «Социальные услуги»', inn: '7713699602', kpp: '771301001', account: '40702810800220100505', bik: '044525225', guid: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' },
      { id: 2, name: 'ООО «Социальные услуги-НН»', inn: '7713699603', kpp: '526201001', account: '40702810800220100506', bik: '044525225', guid: 'b2c3d4e5-f6a7-8901-bcde-f12345678901' },
      { id: 3, name: 'ООО «Мави Джинс»', inn: '7734660892', kpp: '773401001', account: '40702810500010001234', bik: '044525225', guid: 'c3d4e5f6-a7b8-9012-cdef-123456789012' },
      { id: 4, name: 'АО «Флант»', inn: '7702033720', kpp: '770201001', account: '40702810700020004567', bik: '044525411', guid: 'd4e5f6a7-b8c9-0123-defa-234567890123' },
      { id: 5, name: 'Департамент труда и соцзащиты г. Москвы', inn: '7710660053', kpp: '771001001', account: '40102810545370000003', bik: '044525225', guid: 'e5f6a7b8-c9d0-1234-efab-345678901234' },
      { id: 6, name: 'ООО «Ромашка»', inn: '7728300200', kpp: '772801001', account: '40702810600050009876', bik: '044525999', guid: 'f6a7b8c9-d0e1-2345-fabc-456789012345' },
      { id: 7, name: 'ИП Иванов И.И.', inn: '771501001234', kpp: '', account: '40802810200030007890', bik: '044525225', guid: 'a7b8c9d0-e1f2-3456-abcd-567890123456' },
      { id: 8, name: 'ООО «Медтехника-Сервис»', inn: '7718014456', kpp: '771801001', account: '40702810900070006543', bik: '044525555', guid: 'b8c9d0e1-f2a3-4567-bcde-678901234567' },
      { id: 9, name: 'ПАО «МГТС»', inn: '7710016640', kpp: '771001001', account: '40702810400110001234', bik: '044525225', guid: 'c9d0e1f2-a3b4-5678-cdef-789012345678' },
      { id: 10, name: 'АО «Мосэнергосбыт»', inn: '7736520080', kpp: '773601001', account: '40702810000130009876', bik: '044525225', guid: 'd0e1f2a3-b4c5-6789-defa-890123456789' },
      { id: 11, name: 'ООО «Клининг-Профи»', inn: '7719078562', kpp: '771901001', account: '40702810500120005678', bik: '044525555', guid: 'e1f2a3b4-c5d6-7890-efab-901234567890' },
      { id: 12, name: 'АО «ВСК»', inn: '7710026574', kpp: '771001001', account: '40702810100170008765', bik: '044525985', guid: 'f2a3b4c5-d6e7-8901-fabc-012345678901' },
      { id: 13, name: 'ИП Петрова М.С.', inn: '772000112345', kpp: '', account: '40802810800150007654', bik: '044525225', guid: 'a3b4c5d6-e7f8-9012-abcd-123456789012' },
      { id: 14, name: 'ООО «Фарм-Поставка»', inn: '7710645000', kpp: '771001001', account: '40702810800190001234', bik: '044525555', guid: 'b4c5d6e7-f8a9-0123-bcde-234567890123' },
      { id: 15, name: 'ООО «СофтЛайн Трейд»', inn: '7728543046', kpp: '772801001', account: '40702810700140005432', bik: '044525700', guid: 'c5d6e7f8-a9b0-1234-cdef-345678901234' },
    ]);
  } catch (err) { res.status(500).json({ error: (err as Error).message }); }
});

router.get('/contracts', (_req: Request, res: Response) => {
  try {
    const contracts = contractRepo.findAll();
    const result = contracts.map((c, i) => ({
      id: c.id,
      number: c.number,
      date: c.date,
      clientName: c.client_name || '',
      clientInn: c.client_inn || '',
      clientGuid: `c001-${String(c.client_id).padStart(4, '0')}`,
      type: c.type,
      amount: c.amount,
      guid: `ctr-${String(i + 1).padStart(3, '0')}`,
    }));
    res.json(result);
  } catch (err) { res.status(500).json({ error: (err as Error).message }); }
});

router.post('/import-contracts', (req: Request, res: Response) => {
  try {
    const contracts = contractRepo.findAll();
    const clients = oneCRepo.getAllClients();
    const { contractIds } = req.body as { contractIds: number[] };
    let imported = 0, clientsCreated = 0;

    for (const cid of contractIds) {
      const contract = contracts.find((c) => c.id === cid);
      if (!contract) continue;
      const exists = clients.find((cl) => cl.inn === contract.client_inn);
      if (!exists && contract.client_name && contract.client_inn) {
        insert('clients', {
          name: contract.client_name,
          inn: contract.client_inn,
          kpp: '',
          account: '',
          bik: '',
          status: 'active',
        });
        clientsCreated++;
      }
      imported++;
    }

    insert('onec_exchange_log', {
      operation: 'import_contracts',
      direction: 'import',
      description: `Импорт договоров из 1С (${imported} записей, создано клиентов: ${clientsCreated})`,
      count: imported,
      status: 'success',
      user_id: (req.body as { userId?: number }).userId ?? null,
    });

    res.json({ imported, clientsCreated });
  } catch (err) { res.status(500).json({ error: (err as Error).message }); }
});

router.get('/export-ready', (_req: Request, res: Response) => {
  try {
    const payments = oneCRepo.getPaymentsReadyForExport();
    const docs = payments.map((p: Record<string, unknown>) => ({
      paymentId: p.id,
      docNumber: p.doc_number || '',
      docDate: p.doc_date || '',
      amount: p.amount || 0,
      clientName: p.client_name || '',
      clientInn: '',
      operationType: p.payment_type_name === 'Поступление' ? 'Поступление' : 'Списание',
      articleName: p.article_name || '',
      purpose: p.purpose || '',
      exportStatus: 'ready',
    }));
    res.json(docs);
  } catch (err) { res.status(500).json({ error: (err as Error).message }); }
});

router.post('/export', (req: Request, res: Response) => {
  try {
    const { paymentIds, userId } = req.body as { paymentIds: number[]; userId?: number };
    let posted = 0, errors = 0;
    const details: { paymentId: number; status: string; oneCDocNumber?: string; error?: string }[] = [];

    for (const pid of paymentIds) {
      try {
        const oneCDocNumber = pid % 2 === 0
          ? `ПТД-${String(1000000 + pid).slice(1)}`
          : `СТД-${String(1000000 + pid).slice(1)}`;

        update('payments', pid, { status: 'exported' });

        details.push({ paymentId: pid, status: 'posted', oneCDocNumber });
        posted++;
      } catch (err) {
        details.push({ paymentId: pid, status: 'error', error: (err as Error).message });
        errors++;
      }
    }

    insert('onec_exchange_log', {
      operation: 'export_payments',
      direction: 'export',
      description: `Экспорт платежей в 1С (отправлено: ${paymentIds.length}, проведено: ${posted}, ошибок: ${errors})`,
      count: paymentIds.length,
      status: errors > 0 ? 'partial' : 'success',
      user_id: userId ?? null,
    });

    res.json({ totalSent: paymentIds.length, posted, errors, details });
  } catch (err) { res.status(500).json({ error: (err as Error).message }); }
});

router.get('/exchange-log', (_req: Request, res: Response) => {
  try {
    const logs = query<Record<string, unknown>>(
      `SELECT l.*, u.full_name as user_name
       FROM onec_exchange_log l
       LEFT JOIN users u ON l.user_id = u.id
       ORDER BY l.timestamp DESC LIMIT 100`
    );
    res.json(logs.map((l) => ({
      id: l.id,
      operation: l.operation,
      direction: l.direction,
      description: l.description,
      count: l.count,
      status: l.status,
      timestamp: l.timestamp,
      userId: l.user_id,
      userName: l.user_name || null,
    })));
  } catch (err) { res.status(500).json({ error: (err as Error).message }); }
});

export default router;
