import { Router } from 'express';
import prisma from '../prisma';
import { requireAuth, requireAdmin } from '../middleware/auth';
import { toTeamResponse, toTournamentTeamResponse } from '../utils/formatters';
import { toPublicUser } from '../utils/helpers';

const router = Router();

router.get('/', requireAuth, async (_req, res, next) => {
  try {
    const teams = await prisma.team.findMany({ include: { chuDoi: { include: { vaiTro: true } } } });
    res.json(teams.map(toTeamResponse));
  } catch (err) {
    next(err);
  }
});

router.get('/my-teams', requireAuth, async (req, res, next) => {
  try {
    const user = await prisma.nguoiDung.findFirst({ where: { soDienThoai: req.user!.soDienThoai } });
    if (!user) throw new Error('User not found');

    const ownerTeams = await prisma.team.findMany({
      where: { chuDoiId: user.id },
      include: { chuDoi: { include: { vaiTro: true } } },
    });

    const acceptedMemberships = await prisma.teamMember.findMany({
      where: { nguoiDungId: user.id, trangThai: 'DA_CHAP_NHAN' },
    });

    const memberTeamIds = acceptedMemberships.map((m: any) => m.teamId);
    const memberTeams = memberTeamIds.length
      ? await prisma.team.findMany({
          where: { id: { in: memberTeamIds } },
          include: { chuDoi: { include: { vaiTro: true } } },
        })
      : [];

    const merged = [...ownerTeams];
    for (const team of memberTeams) {
      if (!merged.some((t) => t.id === team.id)) merged.push(team);
    }

    res.json(merged.map(toTeamResponse));
  } catch (err) {
    next(err);
  }
});

router.get('/my-invitations', requireAuth, async (req, res, next) => {
  try {
    const user = await prisma.nguoiDung.findFirst({ where: { soDienThoai: req.user!.soDienThoai } });
    if (!user) throw new Error('User not found');

    const rows = await prisma.teamMember.findMany({
      where: { nguoiDungId: user.id },
      include: {
        team: { include: { chuDoi: { include: { vaiTro: true } } } },
        nguoiDung: { include: { vaiTro: true } },
      },
    });

    res.json(
      rows.map((tm: any) => ({
        id: tm.id,
        team: toTeamResponse(tm.team),
        nguoiDung: toPublicUser(tm.nguoiDung),
        trangThai: tm.trangThai,
      })),
    );
  } catch (err) {
    next(err);
  }
});

router.get('/members/:memberId/status', requireAuth, async (req, res, next) => {
  next();
});

router.put('/members/:memberId/status', requireAuth, async (req, res, next) => {
  try {
    const memberId = req.params.memberId as string;
    const status = String(req.query.status || '');

    const user = await prisma.nguoiDung.findFirst({ where: { soDienThoai: req.user!.soDienThoai } });
    if (!user) throw new Error('User not found');

    const member = await prisma.teamMember.findUnique({ where: { id: memberId } });
    if (!member) throw new Error('Member not found');

    if (member.nguoiDungId !== user.id) {
      return res.status(400).send('You can only update your own status');
    }

    const saved = await prisma.teamMember.update({
      where: { id: memberId },
      data: { trangThai: status },
      include: {
        team: { include: { chuDoi: { include: { vaiTro: true } } } },
        nguoiDung: { include: { vaiTro: true } },
      },
    });

    res.json({
      id: saved.id,
      team: toTeamResponse(saved.team),
      nguoiDung: toPublicUser(saved.nguoiDung),
      trangThai: saved.trangThai,
    });
  } catch (err) {
    next(err);
  }
});

router.delete('/members/:memberId', requireAuth, async (req, res, next) => {
  try {
    const memberId = req.params.memberId as string;

    const user = await prisma.nguoiDung.findFirst({ where: { soDienThoai: req.user!.soDienThoai } });
    if (!user) throw new Error('User not found');

    const member = await prisma.teamMember.findUnique({ where: { id: memberId }, include: { team: true } });
    if (!member) throw new Error('Member not found');

    if (member.team.chuDoiId !== user.id) {
      return res.status(400).send('Only team owner can remove members');
    }

    await prisma.teamMember.delete({ where: { id: memberId } });
    res.status(200).end();
  } catch (err) {
    next(err);
  }
});

router.get('/:id', requireAuth, async (req, res, next) => {
  try {
    const id = req.params.id as string;

    const team = await prisma.team.findUnique({
      where: { id },
      include: { chuDoi: { include: { vaiTro: true } } },
    });
    if (!team) return res.status(404).end();
    res.json(toTeamResponse(team));
  } catch (err) {
    next(err);
  }
});

router.post('/', requireAuth, async (req, res, next) => {
  try {
    const user = await prisma.nguoiDung.findFirst({ where: { soDienThoai: req.user!.soDienThoai } });
    if (!user) throw new Error('User not found');

    const { tenDoi, moTa } = req.body || {};
    const team = await prisma.team.create({
      data: { tenDoi, moTa, chuDoiId: user.id },
      include: { chuDoi: { include: { vaiTro: true } } },
    });

    res.json(toTeamResponse(team));
  } catch (err) {
    next(err);
  }
});

router.put('/:id', requireAuth, async (req, res, next) => {
  try {
    const id = req.params.id as string;
    const user = await prisma.nguoiDung.findFirst({ where: { soDienThoai: req.user!.soDienThoai } });
    if (!user) throw new Error('User not found');

    const team = await prisma.team.findUnique({ where: { id } });
    if (!team) return res.status(404).end();
    if (team.chuDoiId !== user.id) throw new Error('Only team owner can update');

    const { tenDoi, moTa } = req.body || {};
    const updated = await prisma.team.update({
      where: { id },
      data: { tenDoi, moTa },
      include: { chuDoi: { include: { vaiTro: true } } },
    });

    res.json(toTeamResponse(updated));
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const id = req.params.id as string;
    const user = await prisma.nguoiDung.findFirst({ where: { soDienThoai: req.user!.soDienThoai } });
    if (!user) throw new Error('User not found');

    const team = await prisma.team.findUnique({ where: { id } });
    if (!team) throw new Error('Team not found');
    if (team.chuDoiId !== user.id) throw new Error('Only team owner can delete');

    await prisma.team.delete({ where: { id } });
    res.status(200).end();
  } catch (err) {
    next(err);
  }
});

router.get('/:teamId/members', requireAuth, async (req, res, next) => {
  try {
    const teamId = req.params.teamId as string;
    const rows = await prisma.teamMember.findMany({
      where: { teamId },
      include: {
        team: { include: { chuDoi: { include: { vaiTro: true } } } },
        nguoiDung: { include: { vaiTro: true } },
      },
    });

    res.json(
      rows.map((tm: any) => ({
        id: tm.id,
        team: toTeamResponse(tm.team),
        nguoiDung: toPublicUser(tm.nguoiDung),
        trangThai: tm.trangThai,
      })),
    );
  } catch (err) {
    next(err);
  }
});

router.post('/:teamId/members', requireAuth, async (req, res, next) => {
  try {
    const teamId = req.params.teamId as string;
    const { nguoiDungId } = req.body || {};

    const user = await prisma.nguoiDung.findFirst({ where: { soDienThoai: req.user!.soDienThoai } });
    if (!user) throw new Error('User not found');

    const team = await prisma.team.findUnique({ where: { id: teamId } });
    if (!team) throw new Error('Team not found');
    if (team.chuDoiId !== user.id) return res.status(400).send('Only team owner can invite members');

    const member = await prisma.nguoiDung.findUnique({ where: { id: String(nguoiDungId) }, include: { vaiTro: true } });
    if (!member) throw new Error('Member not found');

    const exists = await prisma.teamMember.findFirst({ where: { teamId, nguoiDungId: String(nguoiDungId) } });
    if (exists) return res.status(400).send('Member already in team');

    const saved = await prisma.teamMember.create({
      data: { teamId, nguoiDungId: String(nguoiDungId), trangThai: 'CHO_XAC_NHAN' },
      include: {
        team: { include: { chuDoi: { include: { vaiTro: true } } } },
        nguoiDung: { include: { vaiTro: true } },
      },
    });

    res.json({
      id: saved.id,
      team: toTeamResponse(saved.team),
      nguoiDung: toPublicUser(saved.nguoiDung),
      trangThai: saved.trangThai,
    });
  } catch (err) {
    next(err);
  }
});

router.post('/:teamId/register-tournament/:tournamentId', requireAuth, async (req, res, next) => {
  try {
    const teamId = req.params.teamId as string;
    const tournamentId = req.params.tournamentId as string;

    const user = await prisma.nguoiDung.findFirst({ where: { soDienThoai: req.user!.soDienThoai } });
    if (!user) throw new Error('User not found');

    const team = await prisma.team.findUnique({ where: { id: teamId } });
    if (!team) throw new Error('Team not found');
    if (team.chuDoiId !== user.id) {
      return res.status(403).send('Chỉ chủ đội mới có quyền đăng ký tham gia giải đấu');
    }

    const tournament = await prisma.tournament.findUnique({ where: { id: tournamentId } });
    if (!tournament) throw new Error('Tournament not found');
    if (tournament.trangThai !== 'DANG_MO') {
      return res.status(400).send('Tournament is not open for registration');
    }

    const existed = await prisma.tournamentTeam.findFirst({ where: { tournamentId, teamId } });
    if (existed) return res.status(400).send('Team already registered');

    const registeredCount = await prisma.tournamentTeam.count({
      where: { tournamentId, trangThai: 'DA_DUYET' },
    });

    if (registeredCount >= (tournament.soDoiToiDa ?? 0)) {
      return res.status(400).send('Tournament is full');
    }

    const created = await prisma.tournamentTeam.create({
      data: { tournamentId, teamId, trangThai: 'CHO_DUYET' },
      include: { team: { include: { chuDoi: { include: { vaiTro: true } } } } },
    });

    res.json(toTournamentTeamResponse(created));
  } catch (err) {
    next(err);
  }
});

export default router;
