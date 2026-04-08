import path from 'path';
import { Router } from 'express';
import multer from 'multer';
import prisma from '../prisma';
import { requireAuth, requireAdmin } from '../middleware/auth';
import { toSanBongResponse } from '../utils/formatters';
import { PORT } from '../config';

const uploadsDir = path.join(process.cwd(), 'uploads');

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${Date.now()}_${safe}`);
  },
});
const upload = multer({ storage });

const router = Router();

router.get('/', requireAuth, async (_req, res, next) => {
  try {
    const list = await prisma.sanBong.findMany({
      where: { deleted: false },
      include: { giaTiens: true, hinhAnhs: true },
    });
    res.json(list.map(toSanBongResponse));
  } catch (err) {
    next(err);
  }
});

router.get('/admin/all', requireAdmin, async (_req, res, next) => {
  try {
    const list = await prisma.sanBong.findMany({
      orderBy: [{ deleted: 'asc' }, { id: 'asc' }],
      include: { giaTiens: true, hinhAnhs: true },
    });
    res.json(list.map(toSanBongResponse));
  } catch (err) {
    next(err);
  }
});

router.get('/:id', requireAuth, async (req, res, next) => {
  try {
    const id = req.params.id as string;
    const found = await prisma.sanBong.findUnique({
      where: { id },
      include: { giaTiens: true, hinhAnhs: true },
    });
    if (!found) return res.status(404).end();
    res.json(toSanBongResponse(found));
  } catch (err) {
    next(err);
  }
});

router.post('/', requireAdmin, async (req, res, next) => {
  try {
    const { soNguoi, baoTri } = req.body || {};
    const created = await prisma.sanBong.create({
      data: { soNguoi, baoTri, deleted: false },
      include: { giaTiens: true, hinhAnhs: true },
    });
    res.json(toSanBongResponse(created));
  } catch (err) {
    next(err);
  }
});

router.put('/:id', requireAdmin, async (req, res, next) => {
  try {
    const id = req.params.id as string;
    const { soNguoi, baoTri } = req.body || {};
    const existing = await prisma.sanBong.findUnique({ where: { id } });
    if (!existing) return res.status(404).end();

    const updated = await prisma.sanBong.update({
      where: { id },
      data: { soNguoi, baoTri },
      include: { giaTiens: true, hinhAnhs: true },
    });
    res.json(toSanBongResponse(updated));
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', requireAdmin, async (req, res, next) => {
  try {
    const id = req.params.id as string;
    const existing = await prisma.sanBong.findUnique({ where: { id } });
    if (!existing) return res.status(404).end();
    await prisma.sanBong.update({ where: { id }, data: { deleted: true } });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

router.put('/:id/restore', requireAdmin, async (req, res, next) => {
  try {
    const id = req.params.id as string;
    const existing = await prisma.sanBong.findUnique({ where: { id } });
    if (!existing) return res.status(404).end();
    const updated = await prisma.sanBong.update({
      where: { id },
      data: { deleted: false },
      include: { giaTiens: true, hinhAnhs: true },
    });
    res.json(toSanBongResponse(updated));
  } catch (err) {
    next(err);
  }
});

router.put('/:id/bao-tri', requireAdmin, async (req, res, next) => {
  try {
    const id = req.params.id as string;
    const baoTri = String(req.query.baoTri) === 'true';
    const existing = await prisma.sanBong.findUnique({ where: { id } });
    if (!existing) return res.status(404).end();

    const updated = await prisma.sanBong.update({
      where: { id },
      data: { baoTri },
      include: { giaTiens: true, hinhAnhs: true },
    });
    res.json(toSanBongResponse(updated));
  } catch (err) {
    next(err);
  }
});

router.post('/:id/upload-anh', requireAdmin, upload.single('file'), async (req, res, next) => {
  try {
    const id = req.params.id as string;
    const san = await prisma.sanBong.findUnique({ where: { id } });
    if (!san) return res.status(400).send('San bong khong ton tai');
    if (!req.file) return res.status(400).end();

    const thuTuRaw = req.body?.thuTu;
    const thuTu = thuTuRaw == null || thuTuRaw === '' ? null : Number(thuTuRaw);
    const publicUrl = `http://localhost:${PORT}/uploads/${req.file.filename}`;

    const created = await prisma.hinhAnh.create({
      data: { thuTu, url: publicUrl, sanBongId: id },
    });

    res.json({ id: created.id, thuTu: created.thuTu, url: created.url });
  } catch (err) {
    next(err);
  }
});

export default router;
