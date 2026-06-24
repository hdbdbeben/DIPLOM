import { Router, Request, Response } from 'express';
import * as userRepo from '../repositories/userRepo';
import type { UserBody } from '../types';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  try { res.json(await userRepo.findAll()); } catch (err) { res.status(500).json({ error: (err as Error).message }); }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const { login, password, fullName, roleId } = req.body as UserBody;
    if (!password) return res.status(400).json({ error: 'Пароль обязателен' });
    const existing = await userRepo.findByLogin(login);
    if (existing) return res.status(400).json({ error: 'Пользователь с таким логином уже существует' });
    const id = await userRepo.create({ login, password, fullName, roleId });
    res.json({ id });
  } catch (err) { res.status(500).json({ error: (err as Error).message }); }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { login, password, fullName, roleId, active } = req.body as UserBody;
    const data: Record<string, unknown> = { login, full_name: fullName, role_id: roleId, active: active ? 1 : 0 };
    if (password) data.password = password;
    await userRepo.updateUser(Number(req.params.id), data);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: (err as Error).message }); }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try { await userRepo.deleteUser(Number(req.params.id)); res.json({ ok: true }); }
  catch (err) { res.status(500).json({ error: (err as Error).message }); }
});

export default router;
