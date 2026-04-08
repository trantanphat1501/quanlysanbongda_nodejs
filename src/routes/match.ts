import { Router } from 'express';
import prisma from '../prisma';
import { requireAuth, requireAdmin } from '../middleware/auth';
import { toMatchResponse, toMatchEventResponse } from '../utils/formatters';

const router = Router();

const matchInclude = {
  homeTeam: { include: { chuDoi: { include: { vaiTro: true } } } },
  awayTeam: { include: { chuDoi: { include: { vaiTro: true } } } },
  sanBong: true,
  tournament: true,
  events: {
    where: { deleted: false },
    include: {
      player: { include: { nguoiDung: { include: { vaiTro: true } } } },
      team: { include: { chuDoi: { include: { vaiTro: true } } } },
    },
    orderBy: { minute: 'asc' as const },
  },
};

router.get('/tournament/:tournamentId', requireAuth, async (req, res, next) => {
  try {
    const tournamentId = req.params.tournamentId as string;
    const rows = await prisma.match.findMany({
      where: { tournamentId, deleted: false },
      include: matchInclude,
      orderBy: [{ matchDate: 'asc' }, { id: 'asc' }],
    });
    res.json(rows.map(toMatchResponse));
  } catch (err) {
    next(err);
  }
});

router.get('/:id', requireAuth, async (req, res, next) => {
  try {
    const id = req.params.id as string;
    const m = await prisma.match.findUnique({ where: { id }, include: matchInclude });
    if (!m) return res.status(404).end();
    res.json(toMatchResponse(m));
  } catch (err) {
    next(err);
  }
});

router.post('/', requireAdmin, async (req, res, next) => {
  try {
    const { homeTeamId, awayTeamId, tournamentId, sanBongId, matchDate, round, referee, notes } = req.body || {};

    if (!homeTeamId || !awayTeamId || !tournamentId) {
      return res.status(400).send('homeTeamId, awayTeamId, tournamentId are required');
    }

    const tournament = await prisma.tournament.findUnique({ where: { id: String(tournamentId) } });
    if (!tournament) return res.status(400).send('Tournament not found');

    const homeTeam = await prisma.team.findUnique({ where: { id: String(homeTeamId) } });
    if (!homeTeam) return res.status(400).send('Home team not found');

    const awayTeam = await prisma.team.findUnique({ where: { id: String(awayTeamId) } });
    if (!awayTeam) return res.status(400).send('Away team not found');

    const created = await prisma.match.create({
      data: {
        homeTeamId: String(homeTeamId),
        awayTeamId: String(awayTeamId),
        tournamentId: String(tournamentId),
        sanBongId: sanBongId ? String(sanBongId) : null,
        matchDate: matchDate ? new Date(matchDate) : null,
        round: round || null,
        referee: referee || null,
        notes: notes || null,
        status: 'SCHEDULED',
        deleted: false,
      },
      include: matchInclude,
    });

    res.json(toMatchResponse(created));
  } catch (err) {
    next(err);
  }
});

router.put('/:id', requireAdmin, async (req, res, next) => {
  try {
    const id = req.params.id as string;
    const existing = await prisma.match.findUnique({ where: { id } });
    if (!existing) return res.status(404).end();

    const { homeTeamId, awayTeamId, sanBongId, matchDate, round, referee, notes } = req.body || {};

    const updated = await prisma.match.update({
      where: { id },
      data: {
        ...(homeTeamId != null ? { homeTeamId: String(homeTeamId) } : {}),
        ...(awayTeamId != null ? { awayTeamId: String(awayTeamId) } : {}),
        ...(sanBongId !== undefined ? { sanBongId: sanBongId ? String(sanBongId) : null } : {}),
        ...(matchDate !== undefined ? { matchDate: matchDate ? new Date(matchDate) : null } : {}),
        ...(round !== undefined ? { round } : {}),
        ...(referee !== undefined ? { referee } : {}),
        ...(notes !== undefined ? { notes } : {}),
      },
      include: matchInclude,
    });

    res.json(toMatchResponse(updated));
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', requireAdmin, async (req, res, next) => {
  try {
    const id = req.params.id as string;
    const existing = await prisma.match.findUnique({ where: { id } });
    if (!existing) return res.status(404).end();
    await prisma.match.update({ where: { id }, data: { deleted: true } });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

router.put('/:id/status', requireAdmin, async (req, res, next) => {
  try {
    const id = req.params.id as string;
    const status = String(req.query.status || '');

    const validStatuses = ['SCHEDULED', 'LIVE', 'HALF_TIME', 'FINISHED', 'POSTPONED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).send(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    const existing = await prisma.match.findUnique({ where: { id } });
    if (!existing) return res.status(404).end();

    const updated = await prisma.match.update({
      where: { id },
      data: { status: status as any },
      include: matchInclude,
    });

    res.json(toMatchResponse(updated));
  } catch (err) {
    next(err);
  }
});

router.put('/:id/score', requireAdmin, async (req, res, next) => {
  try {
    const id = req.params.id as string;
    const { homeScore, awayScore } = req.body || {};

    const existing = await prisma.match.findUnique({ where: { id } });
    if (!existing) return res.status(404).end();

    const updated = await prisma.match.update({
      where: { id },
      data: {
        ...(homeScore != null ? { homeScore: Number(homeScore) } : {}),
        ...(awayScore != null ? { awayScore: Number(awayScore) } : {}),
      },
      include: matchInclude,
    });

    res.json(toMatchResponse(updated));
  } catch (err) {
    next(err);
  }
});

router.get('/:matchId/events', requireAuth, async (req, res, next) => {
  try {
    const matchId = req.params.matchId as string;
    const match = await prisma.match.findUnique({ where: { id: matchId } });
    if (!match) return res.status(404).send('Match not found');

    const rows = await prisma.matchEvent.findMany({
      where: { matchId, deleted: false },
      include: {
        player: { include: { nguoiDung: { include: { vaiTro: true } } } },
        team: { include: { chuDoi: { include: { vaiTro: true } } } },
      },
      orderBy: { minute: 'asc' },
    });

    res.json(rows.map(toMatchEventResponse));
  } catch (err) {
    next(err);
  }
});

router.post('/:matchId/events', requireAdmin, async (req, res, next) => {
  try {
    const matchId = req.params.matchId as string;
    const { eventType, minute, description, playerId, teamId } = req.body || {};

    const match = await prisma.match.findUnique({ where: { id: matchId } });
    if (!match) return res.status(404).send('Match not found');

    if (!eventType || !teamId) {
      return res.status(400).send('eventType and teamId are required');
    }

    const validEvents = ['GOAL', 'OWN_GOAL', 'PENALTY', 'YELLOW_CARD', 'RED_CARD', 'SUBSTITUTION', 'INJURY'];
    if (!validEvents.includes(eventType)) {
      return res.status(400).send(`Invalid eventType. Must be one of: ${validEvents.join(', ')}`);
    }

    const created = await prisma.matchEvent.create({
      data: {
        matchId,
        eventType: eventType as any,
        minute: minute != null ? Number(minute) : null,
        description: description || null,
        playerId: playerId ? String(playerId) : null,
        teamId: String(teamId),
        deleted: false,
      },
      include: {
        player: { include: { nguoiDung: { include: { vaiTro: true } } } },
        team: { include: { chuDoi: { include: { vaiTro: true } } } },
      },
    });

    res.json(toMatchEventResponse(created));
  } catch (err) {
    next(err);
  }
});

export default router;
