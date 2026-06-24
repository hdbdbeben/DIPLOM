import { Router, Request, Response } from 'express';
import * as dashboardRepo from '../repositories/dashboardRepo';

const router = Router();
router.get('/', async (_req: Request, res: Response) => {
  try { res.json(await dashboardRepo.getDashboard()); } catch (err) { res.status(500).json({ error: (err as Error).message }); }
});
export default router;
