import { Router } from 'express';
import prisma from '../prisma';
import { requireAdmin } from '../middleware/auth';
import { toMatchEventResponse } from '../utils/formatters';

const router = Router();

router.put('/:id', requireAdmin, async (req, res, next) => {
  try {
    const id = req.params.id as string;
    const existing = await prisma.matchEvent.findUnique({ where: { id } });
    if (!existing) return res.status(404).end();

    const { eventType, minute, description, playerId, teamId } = req.body || {};

    const validEvents = ['GOAL', 'OWN_GOAL', 'PENALTY', 'YELLOW_CARD', 'RED_CARD', 'SUBSTITUTION', 'INJURY'];
    if (eventType && !validEvents.includes(eventType)) {
      return res.status(400).send(`Invalid eventType. Must be one of: ${validEvents.join(', ')}`);
    }

    const updated = await prisma.matchEvent.update({
      where: { id },
      data: {
        ...(eventType ? { eventType: eventType as any } : {}),
        ...(minute !== undefined ? { minute: minute != null ? Number(minute) : null } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(playerId !== undefined ? { playerId: playerId ? String(playerId) : null } : {}),
        ...(teamId != null ? { teamId: String(teamId) } : {}),
      },
      include: {
        player: { include: { nguoiDung: { include: { vaiTro: true } } } },
        team: { include: { chuDoi: { include: { vaiTro: true } } } },
      },
    });

    res.json(toMatchEventResponse(updated));
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', requireAdmin, async (req, res, next) => {
  try {
    const id = req.params.id as string;
    const existing = await prisma.matchEvent.findUnique({ where: { id } });
    if (!existing) return res.status(404).end();
    await prisma.matchEvent.update({ where: { id }, data: { deleted: true } });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

export default router;
