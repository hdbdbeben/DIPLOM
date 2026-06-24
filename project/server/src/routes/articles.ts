import { Router, Request, Response } from 'express';
import * as articleRepo from '../repositories/articleRepo';
import type { ArticleBody } from '../types';

const router = Router();
router.get('/', async (_req: Request, res: Response) => { try { res.json(await articleRepo.findAll()); } catch (err) { res.status(500).json({ error: (err as Error).message }); } });
router.post('/', async (req: Request, res: Response) => { try { res.json({ id: await articleRepo.create(req.body as ArticleBody) }); } catch (err) { res.status(500).json({ error: (err as Error).message }); } });
router.put('/:id', async (req: Request, res: Response) => { try { await articleRepo.updateArticle(Number(req.params.id), req.body as ArticleBody); res.json({ ok: true }); } catch (err) { res.status(500).json({ error: (err as Error).message }); } });
router.delete('/:id', async (req: Request, res: Response) => { try { await articleRepo.deleteArticle(Number(req.params.id)); res.json({ ok: true }); } catch (err) { res.status(500).json({ error: (err as Error).message }); } });
export default router;
