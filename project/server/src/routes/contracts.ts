import { Router, Request, Response } from 'express';
import * as contractRepo from '../repositories/contractRepo';
import type { ContractBody } from '../types';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try { res.json(contractRepo.findAll(req.query.search as string)); } catch (err) { res.status(500).json({ error: (err as Error).message }); }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const c = contractRepo.findById(Number(req.params.id));
    if (!c) return res.status(404).json({ error: 'Договор не найден' });
    res.json(c);
  } catch (err) { res.status(500).json({ error: (err as Error).message }); }
});

router.post('/', async (req: Request, res: Response) => {
  try { res.json({ id: contractRepo.create(req.body as ContractBody) }); } catch (err) { res.status(500).json({ error: (err as Error).message }); }
});

router.put('/:id', async (req: Request, res: Response) => {
  try { contractRepo.updateContract(Number(req.params.id), req.body as ContractBody); res.json({ ok: true }); } catch (err) { res.status(500).json({ error: (err as Error).message }); }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try { contractRepo.deleteContract(Number(req.params.id)); res.json({ ok: true }); } catch (err) { res.status(500).json({ error: (err as Error).message }); }
});

export default router;
