import { Router, Request, Response } from 'express';
import * as reportRepo from '../repositories/reportRepo';

const router = Router();

router.get('/dds', async (req: Request, res: Response) => {
  try {
    const { from, to } = req.query as { from?: string; to?: string };
    res.json(await reportRepo.generateReport({ from, to }));
  } catch (err) { res.status(500).json({ error: (err as Error).message }); }
});

export default router;
