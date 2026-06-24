import { Router, Request, Response } from 'express';
import * as clientRepo from '../repositories/clientRepo';
import type { ClientBody } from '../types';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try { res.json(await clientRepo.findAll(req.query.search as string)); } catch (err) { res.status(500).json({ error: (err as Error).message }); }
});

router.post('/', async (req: Request, res: Response) => {
  try { res.json({ id: await clientRepo.create(req.body as ClientBody) }); } catch (err) { res.status(500).json({ error: (err as Error).message }); }
});

router.put('/:id', async (req: Request, res: Response) => {
  try { await clientRepo.updateClient(Number(req.params.id), req.body as ClientBody); res.json({ ok: true }); } catch (err) { res.status(500).json({ error: (err as Error).message }); }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try { await clientRepo.deleteClient(Number(req.params.id)); res.json({ ok: true }); } catch (err) { res.status(500).json({ error: (err as Error).message }); }
});

export default router;
