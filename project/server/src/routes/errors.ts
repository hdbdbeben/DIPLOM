import { Router, Request, Response } from 'express';
import * as errorRepo from '../repositories/errorRepo';
import type { ErrorUpdateBody } from '../types';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try { res.json(await errorRepo.findAll(req.query.status as string)); } catch (err) { res.status(500).json({ error: (err as Error).message }); }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    await errorRepo.updateError(Number(req.params.id), req.body as ErrorUpdateBody);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: (err as Error).message }); }
});

export default router;
