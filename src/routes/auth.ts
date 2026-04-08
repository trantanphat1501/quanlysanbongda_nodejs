import { Router } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../prisma';
import { requireAuth } from '../middleware/auth';
import { toPublicUser, signAccessToken } from '../utils/helpers';

const router = Router();

router.post('/login', async (req, res, next) => {
  try {
    const { soDienThoai, password } = req.body || {};
    if (!soDienThoai || !password) {
      return res.status(400).send('Missing soDienThoai or password');
    }

    const user = await prisma.nguoiDung.findFirst({
      where: { soDienThoai },
      include: { vaiTro: true },
    });

    if (!user) {
      return res.status(401).send('Authentication failed: User not found');
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(401).send('Authentication failed: Bad credentials');
    }

    const token = signAccessToken(user.soDienThoai, `ROLE_${user.vaiTro.name}`);
    return res.json({ accessToken: token });
  } catch (err) {
    next(err);
  }
});

router.post('/dang-ky', async (req, res, next) => {
  try {
    const { name, soDienThoai, password } = req.body || {};
    if (!name || !soDienThoai || !password) {
      return res.status(400).send('Missing register fields');
    }

    const existed = await prisma.nguoiDung.findFirst({ where: { soDienThoai } });
    if (existed) {
      return res.status(400).send('So dien thoai da ton tai');
    }

    const role = await prisma.vaiTro.findFirst({ where: { name: 'Nguoi_dung' } });
    if (!role) {
      throw new Error("Vai tro 'Nguoi_dung' khong ton tai");
    }

    const created = await prisma.nguoiDung.create({
      data: {
        name,
        soDienThoai,
        password: await bcrypt.hash(password, 10),
        roleId: role.id,
      },
      include: { vaiTro: true },
    });

    res.json(toPublicUser(created));
  } catch (err) {
    next(err);
  }
});

router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const user = await prisma.nguoiDung.findFirst({
      where: { soDienThoai: req.user!.soDienThoai },
      include: { vaiTro: true },
    });

    if (!user) return res.status(404).end();
    res.json(toPublicUser(user));
  } catch (err) {
    next(err);
  }
});

export default router;
