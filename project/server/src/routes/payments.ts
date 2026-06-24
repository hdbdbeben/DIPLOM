import { Router, Request, Response } from 'express';
import * as payRepo from '../repositories/paymentRepo';
import type { PaymentUpdateBody } from '../types';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const { statementId, status, search } = req.query;
    const result = await payRepo.findAll({
      statementId: statementId ? Number(statementId) : undefined,
      status: status as string | undefined,
      search: search as string | undefined,
    });
    res.json(result);
  } catch (err) { res.status(500).json({ error: (err as Error).message }); }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const p = await payRepo.findById(Number(req.params.id));
    if (!p) return res.status(404).json({ error: 'Платёж не найден' });
    res.json(p);
  } catch (err) { res.status(500).json({ error: (err as Error).message }); }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    await payRepo.updatePayment(Number(req.params.id), req.body as PaymentUpdateBody);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: (err as Error).message }); }
});

export default router;
