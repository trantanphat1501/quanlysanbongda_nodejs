import { Router } from 'express';
import prisma from '../prisma';
import { requireAdmin } from '../middleware/auth';
import { decimalToNumber } from '../utils/helpers';

const router = Router();

router.get('/', requireAdmin, async (req, res, next) => {
  try {
    const sanBongIdRaw = req.query.sanBongId;
    const list = await prisma.giaTien.findMany({
      where: sanBongIdRaw ? { sanBongId: String(sanBongIdRaw) } : {},
    });

    res.json(
      list.map((g: any) => ({
        id: g.id,
        gioBatDau: g.gioBatDau,
        gioKetThuc: g.gioKetThuc,
        giaTien: decimalToNumber(g.giaTien),
      })),
    );
  } catch (err) {
    next(err);
  }
});

router.get('/:id', requireAdmin, async (req, res, next) => {
  try {
    const id = req.params.id as string;
    const g = await prisma.giaTien.findUnique({ where: { id } });
    if (!g) return res.status(404).end();
    res.json({
      id: g.id,
      gioBatDau: g.gioBatDau,
      gioKetThuc: g.gioKetThuc,
      giaTien: decimalToNumber(g.giaTien),
    });
  } catch (err) {
    next(err);
  }
});

router.post('/', requireAdmin, async (req, res, next) => {
  try {
    const { gioBatDau, gioKetThuc, giaTien, sanBongId } = req.body || {};
    const san = await prisma.sanBong.findUnique({ where: { id: String(sanBongId) } });
    if (!san) return res.status(400).send('San bong khong ton tai');

    const created = await prisma.giaTien.create({
      data: {
        gioBatDau,
        gioKetThuc,
        giaTien: giaTien != null ? Number(giaTien) : null,
        sanBongId: String(sanBongId),
      },
    });

    res.json({
      id: created.id,
      gioBatDau: created.gioBatDau,
      gioKetThuc: created.gioKetThuc,
      giaTien: decimalToNumber(created.giaTien),
    });
  } catch (err) {
    next(err);
  }
});

router.put('/:id', requireAdmin, async (req, res, next) => {
  try {
    const id = req.params.id as string;
    const { gioBatDau, gioKetThuc, giaTien, sanBongId } = req.body || {};

    const existing = await prisma.giaTien.findUnique({ where: { id } });
    if (!existing) return res.status(404).end();

    if (sanBongId != null) {
      const san = await prisma.sanBong.findUnique({ where: { id: String(sanBongId) } });
      if (!san) return res.status(400).send('San bong khong ton tai');
    }

    const updated = await prisma.giaTien.update({
      where: { id },
      data: {
        gioBatDau,
        gioKetThuc,
        giaTien: giaTien != null ? Number(giaTien) : undefined,
        sanBongId: sanBongId != null ? String(sanBongId) : undefined,
      },
    });

    res.json({
      id: updated.id,
      gioBatDau: updated.gioBatDau,
      gioKetThuc: updated.gioKetThuc,
      giaTien: decimalToNumber(updated.giaTien),
    });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', requireAdmin, async (req, res, next) => {
  try {
    const id = req.params.id as string;
    const existing = await prisma.giaTien.findUnique({ where: { id } });
    if (!existing) return res.status(404).end();
    await prisma.giaTien.delete({ where: { id } });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

export default router;
