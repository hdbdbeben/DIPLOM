import { Router, Request, Response } from 'express';
import * as roleRepo from '../repositories/roleRepo';

const router = Router();
router.get('/', async (_req: Request, res: Response) => {
  try { res.json(await roleRepo.findAll()); } catch (err) { res.status(500).json({ error: (err as Error).message }); }
});
export default router;
