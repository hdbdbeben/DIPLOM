import { Router, Request, Response } from 'express';
import * as oneCRepo from '../repositories/oneCRepo';

const router = Router();

router.get('/organizations', (_req: Request, res: Response) => {
  try {
    res.json([
      { id: 1, name: 'ООО «Социальные услуги»', inn: '7713699602', kpp: '771301001', account: '40702810800220100505', bik: '044525225', guid: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' },
      { id: 2, name: 'ООО «Социальные услуги-НН»', inn: '7713699603', kpp: '526201001', account: '40702810800220100506', bik: '044525225', guid: 'b2c3d4e5-f6a7-8901-bcde-f12345678901' },
    ]);
  } catch (err) { res.status(500).json({ error: (err as Error).message }); }
});

router.get('/contracts', (_req: Request, res: Response) => {
  try {
    res.json([
      { id: 1, number: '1595/92', date: '2026-04-01', clientName: 'ООО «Мави Джинс»', clientInn: '7734660892', clientGuid: 'c001-0001', type: 'С покупателем', amount: 500000, guid: 'ctr-001' },
      { id: 2, number: '2026-045', date: '2026-01-15', clientName: 'Департамент труда и соцзащиты г. Москвы', clientInn: '7710660053', clientGuid: 'c001-0004', type: 'С покупателем', amount: 2500000, guid: 'ctr-002' },
      { id: 3, number: '45', date: '2026-02-12', clientName: 'ООО «Ромашка»', clientInn: '7728300200', clientGuid: 'c001-0005', type: 'С поставщиком', amount: 180000, guid: 'ctr-003' },
      { id: 4, number: 'FL-887', date: '2026-03-01', clientName: 'АО «Флант»', clientInn: '7702033720', clientGuid: 'c001-0002', type: 'С поставщиком', amount: 96000, guid: 'ctr-004' },
      { id: 5, number: 'МТ-445', date: '2026-04-10', clientName: 'ООО «Медтехника-Сервис»', clientInn: '7718014456', clientGuid: 'c001-0007', type: 'С поставщиком', amount: 43200, guid: 'ctr-005' },
      { id: 6, number: '567-С/2026', date: '2026-01-20', clientName: 'АО «ВСК»', clientInn: '7710026574', clientGuid: 'c001-0017', type: 'С поставщиком', amount: 128000, guid: 'ctr-006' },
      { id: 7, number: 'КЛ-556', date: '2026-05-01', clientName: 'ООО «Клининг-Профи»', clientInn: '7719078562', clientGuid: 'c001-0012', type: 'С поставщиком', amount: 77000, guid: 'ctr-007' },
      { id: 8, number: 'МЭ-334', date: '2026-01-01', clientName: 'АО «Мосэнергосбыт»', clientInn: '7736520080', clientGuid: 'c001-0013', type: 'С поставщиком', amount: 324000, guid: 'ctr-008' },
    ]);
  } catch (err) { res.status(500).json({ error: (err as Error).message }); }
});

router.post('/import-contracts', (req: Request, res: Response) => {
  try {
    const { contractIds } = req.body as { contractIds: number[] };
    const contracts = [
      { clientName: 'ООО «Мави Джинс»', clientInn: '7734660892' },
      { clientName: 'Департамент труда и соцзащиты г. Москвы', clientInn: '7710660053' },
      { clientName: 'ООО «Ромашка»', clientInn: '7728300200' },
      { clientName: 'АО «Флант»', clientInn: '7702033720' },
      { clientName: 'ООО «Медтехника-Сервис»', clientInn: '7718014456' },
      { clientName: 'АО «ВСК»', clientInn: '7710026574' },
      { clientName: 'ООО «Клининг-Профи»', clientInn: '7719078562' },
      { clientName: 'АО «Мосэнергосбыт»', clientInn: '7736520080' },
    ];
    let imported = 0;
    const clients = oneCRepo.getAllClients();
    for (const cid of contractIds) {
      const contract = contracts[cid - 1];
      if (contract) {
        const exists = clients.find((cl) => cl.inn === contract.clientInn);
        if (!exists) {
          imported++;
        }
      }
    }
    res.json({ imported: contractIds.length, clientsCreated: 0 });
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
    const { paymentIds } = req.body as { paymentIds: number[] };
    const details = paymentIds.map((pid, i) => ({
      paymentId: pid,
      status: 'posted',
      oneCDocNumber: i % 2 === 0 ? `ПТД-${String(1000000 + pid).slice(1)}` : `СТД-${String(1000000 + pid).slice(1)}`,
    }));
    res.json({ totalSent: paymentIds.length, posted: paymentIds.length, errors: 0, details });
  } catch (err) { res.status(500).json({ error: (err as Error).message }); }
});

router.get('/exchange-log', (_req: Request, res: Response) => {
  try {
    res.json([
      { id: 1, operation: 'import_orgs', direction: 'import', description: 'Импорт организаций из 1С (2 записи)', count: 2, status: 'success', timestamp: new Date().toISOString().slice(0, 10) + ' 09:00:00', userId: 1, userName: 'Чистякова М.В.' },
    ]);
  } catch (err) { res.status(500).json({ error: (err as Error).message }); }
});

export default router;
