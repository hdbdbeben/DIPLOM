import { Router, Request, Response } from 'express';
import * as bankRepo from '../repositories/bankRepo';
import type { BankBody } from '../types';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  try { res.json(await bankRepo.findAll()); } catch (err) { res.status(500).json({ error: (err as Error).message }); }
});

router.post('/', async (req: Request, res: Response) => {
  try { res.json({ id: await bankRepo.create(req.body as BankBody) }); } catch (err) { res.status(500).json({ error: (err as Error).message }); }
});

router.put('/:id', async (req: Request, res: Response) => {
  try { await bankRepo.updateBank(Number(req.params.id), req.body as BankBody); res.json({ ok: true }); } catch (err) { res.status(500).json({ error: (err as Error).message }); }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try { await bankRepo.deleteBank(Number(req.params.id)); res.json({ ok: true }); } catch (err) { res.status(500).json({ error: (err as Error).message }); }
});

export default router;
