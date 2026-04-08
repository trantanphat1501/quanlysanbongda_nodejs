import { Router } from 'express';
import prisma from '../prisma';
import { requireAuth, requireAdmin } from '../middleware/auth';
import { toDateOnly } from '../utils/helpers';

const router = Router();

function toTournamentResponse(t: any) {
  return {
    id: t.id,
    tenGiai: t.tenGiai,
    moTa: t.moTa,
    ngayBatDau: toDateOnly(t.ngayBatDau),
    ngayKetThuc: toDateOnly(t.ngayKetThuc),
    soDoiToiDa: t.soDoiToiDa,
    trangThai: t.trangThai,
  };
}

router.get('/', requireAuth, async (_req, res, next) => {
  try {
    const rows = await prisma.tournament.findMany();
    res.json(rows.map(toTournamentResponse));
  } catch (err) {
    next(err);
  }
});

router.get('/:id', requireAuth, async (req, res, next) => {
  try {
    const id = req.params.id as string;
    const t = await prisma.tournament.findUnique({ where: { id } });
    if (!t) return res.status(404).end();
    res.json(toTournamentResponse(t));
  } catch (err) {
    next(err);
  }
});

router.post('/', requireAdmin, async (req, res, next) => {
  try {
    const { tenGiai, moTa, ngayBatDau, ngayKetThuc, soDoiToiDa } = req.body || {};
    const created = await prisma.tournament.create({
      data: {
        tenGiai,
        moTa,
        ngayBatDau: ngayBatDau ? new Date(`${ngayBatDau}T00:00:00`) : null,
        ngayKetThuc: ngayKetThuc ? new Date(`${ngayKetThuc}T00:00:00`) : null,
        soDoiToiDa,
        trangThai: 'DANG_MO',
      },
    });

    res.json(toTournamentResponse(created));
  } catch (err) {
    next(err);
  }
});

router.put('/:id', requireAdmin, async (req, res, next) => {
  try {
    const id = req.params.id as string;
    const existing = await prisma.tournament.findUnique({ where: { id } });
    if (!existing) return res.status(404).end();

    const { tenGiai, moTa, ngayBatDau, ngayKetThuc, soDoiToiDa, trangThai } = req.body || {};
    const updated = await prisma.tournament.update({
      where: { id },
      data: {
        ...(tenGiai !== undefined ? { tenGiai } : {}),
        ...(moTa !== undefined ? { moTa } : {}),
        ...(ngayBatDau !== undefined ? { ngayBatDau: ngayBatDau ? new Date(`${ngayBatDau}T00:00:00`) : null } : {}),
        ...(ngayKetThuc !== undefined ? { ngayKetThuc: ngayKetThuc ? new Date(`${ngayKetThuc}T00:00:00`) : null } : {}),
        ...(soDoiToiDa !== undefined ? { soDoiToiDa } : {}),
        ...(trangThai != null ? { trangThai } : {}),
      },
    });

    res.json(toTournamentResponse(updated));
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', requireAdmin, async (req, res, next) => {
  try {
    const id = req.params.id as string;
    await prisma.tournament.delete({ where: { id } });
    res.status(200).end();
  } catch (err) {
    next(err);
  }
});

export default router;
