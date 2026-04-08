import { Router } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../prisma';
import { requireAdmin } from '../middleware/auth';
import { toPublicUser } from '../utils/helpers';

const router = Router();

router.get('/', requireAdmin, async (_req, res, next) => {
  try {
    const users = await prisma.nguoiDung.findMany({ include: { vaiTro: true } });
    res.json(users.map(toPublicUser));
  } catch (err) {
    next(err);
  }
});

router.get('/search', async (req, res, next) => {
  try {
    const soDienThoai = String(req.query.soDienThoai || '');
    const user = await prisma.nguoiDung.findFirst({ where: { soDienThoai }, include: { vaiTro: true } });
    if (!user) return res.status(404).end();
    res.json(toPublicUser(user));
  } catch (err) {
    next(err);
  }
});

router.get('/:id', requireAdmin, async (req, res, next) => {
  try {
    const id = req.params.id as string;
    const user = await prisma.nguoiDung.findUnique({ where: { id }, include: { vaiTro: true } });
    if (!user) return res.status(404).end();
    res.json(toPublicUser(user));
  } catch (err) {
    next(err);
  }
});

router.put('/:id', requireAdmin, async (req, res, next) => {
  try {
    const id = req.params.id as string;
    const { name, soDienThoai, password, vaiTroId } = req.body || {};

    const existing = await prisma.nguoiDung.findUnique({ where: { id } });
    if (!existing) return res.status(404).end();

    if (vaiTroId != null) {
      const role = await prisma.vaiTro.findUnique({ where: { id: String(vaiTroId) } });
      if (!role) return res.status(400).send('Vai tro khong ton tai');
    }

    const updated = await prisma.nguoiDung.update({
      where: { id },
      data: {
        name,
        soDienThoai,
        ...(password ? { password: await bcrypt.hash(password, 10) } : {}),
        ...(vaiTroId != null ? { roleId: String(vaiTroId) } : {}),
      },
      include: { vaiTro: true },
    });

    res.json(toPublicUser(updated));
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', requireAdmin, async (req, res, next) => {
  try {
    const id = req.params.id as string;
    const existing = await prisma.nguoiDung.findUnique({ where: { id } });
    if (!existing) return res.status(404).end();
    await prisma.nguoiDung.delete({ where: { id } });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

export default router;
