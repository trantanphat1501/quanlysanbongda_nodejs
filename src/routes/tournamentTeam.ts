import { Router } from 'express';
import prisma from '../prisma';
import { requireAuth, requireAdmin } from '../middleware/auth';
import { toTournamentTeamResponse } from '../utils/formatters';

const router = Router();

router.get('/tournament/:tournamentId', requireAuth, async (req, res, next) => {
  try {
    const tournamentId = req.params.tournamentId as string;
    const rows = await prisma.tournamentTeam.findMany({
      where: { tournamentId },
      include: { team: { include: { chuDoi: { include: { vaiTro: true } } } } },
    });

    res.json(rows.map(toTournamentTeamResponse));
  } catch (err) {
    next(err);
  }
});

router.put('/:id/status', requireAdmin, async (req, res, next) => {
  try {
    const id = req.params.id as string;
    const status = String(req.query.status || '');

    const existing = await prisma.tournamentTeam.findUnique({ where: { id } });
    if (!existing) return res.status(404).end();

    const updated = await prisma.tournamentTeam.update({
      where: { id },
      data: { trangThai: status },
      include: { team: { include: { chuDoi: { include: { vaiTro: true } } } } },
    });

    res.json(toTournamentTeamResponse(updated));
  } catch (err) {
    next(err);
  }
});

router.put('/:id/standing', requireAdmin, async (req, res, next) => {
  try {
    const id = req.params.id as string;
    const body = req.body || {};

    const existing = await prisma.tournamentTeam.findUnique({ where: { id } });
    if (!existing) return res.status(404).end();

    const updated = await prisma.tournamentTeam.update({
      where: { id },
      data: {
        ...(body.soTranThang != null ? { soTranThang: Number(body.soTranThang) } : {}),
        ...(body.soTranHoa != null ? { soTranHoa: Number(body.soTranHoa) } : {}),
        ...(body.soTranThua != null ? { soTranThua: Number(body.soTranThua) } : {}),
        ...(body.soBanThang != null ? { soBanThang: Number(body.soBanThang) } : {}),
        ...(body.soBanThua != null ? { soBanThua: Number(body.soBanThua) } : {}),
        ...(body.diem != null ? { diem: Number(body.diem) } : {}),
      },
      include: { team: { include: { chuDoi: { include: { vaiTro: true } } } } },
    });

    res.json(toTournamentTeamResponse(updated));
  } catch (err) {
    next(err);
  }
});

export default router;
