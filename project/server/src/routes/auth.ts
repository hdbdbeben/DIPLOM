import { Router, Request, Response } from 'express';
import * as authRepo from '../repositories/authRepo';

const router = Router();

router.post('/login', async (req: Request, res: Response) => {
  try {
    const user = await authRepo.authenticate(req.body);
    if (!user) return res.status(401).json({ error: 'Неверный логин или пароль' });
    await authRepo.logAction(user.id, 'Вход в систему');
    res.json({
      id: user.id, login: user.login, fullName: user.full_name,
      roleId: user.role_id, role: user.role_code, roleName: user.role_name,
    });
  } catch (err) { res.status(500).json({ error: (err as Error).message }); }
});

export default router;
