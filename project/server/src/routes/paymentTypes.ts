import { Router, Request, Response } from 'express';
import * as ptRepo from '../repositories/paymentTypeRepo';
import type { PaymentTypeBody } from '../types';

const router = Router();
router.get('/', async (_req: Request, res: Response) => { try { res.json(await ptRepo.findAll()); } catch (err) { res.status(500).json({ error: (err as Error).message }); } });
router.post('/', async (req: Request, res: Response) => { try { res.json({ id: await ptRepo.create(req.body as PaymentTypeBody) }); } catch (err) { res.status(500).json({ error: (err as Error).message }); } });
router.put('/:id', async (req: Request, res: Response) => { try { await ptRepo.updateType(Number(req.params.id), req.body as PaymentTypeBody); res.json({ ok: true }); } catch (err) { res.status(500).json({ error: (err as Error).message }); } });
router.delete('/:id', async (req: Request, res: Response) => { try { await ptRepo.deleteType(Number(req.params.id)); res.json({ ok: true }); } catch (err) { res.status(500).json({ error: (err as Error).message }); } });
export default router;
