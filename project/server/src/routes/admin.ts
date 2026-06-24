import { Router, Request, Response } from 'express';
import * as adminRepo from '../repositories/adminRepo';

const router = Router();

router.post('/backup', async (req: Request, res: Response) => {
  try { const p = await adminRepo.backup(req.body.userId ?? null); res.json({ ok: true, path: p }); }
  catch (err) { res.status(500).json({ error: (err as Error).message }); }
});

router.post('/restore', async (req: Request, res: Response) => {
  try {
    const message = await adminRepo.restore(req.body.path, req.body.userId ?? null);
    res.json({ ok: true, message });
  } catch (err) { res.status((err as Error).message === 'Файл резервной копии не найден' ? 400 : 500).json({ error: (err as Error).message }); }
});

router.post('/reset', async (_req: Request, res: Response) => {
  try { const message = await adminRepo.reset(); res.json({ ok: true, message }); }
  catch (err) { res.status(500).json({ error: (err as Error).message }); }
});

export default router;
