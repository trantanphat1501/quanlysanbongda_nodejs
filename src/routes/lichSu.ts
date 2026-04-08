import { Router } from 'express';
import prisma from '../prisma';
import { requireAuth } from '../middleware/auth';
import { toLichSuResponse } from '../utils/formatters';
import { getTodayYMD } from '../utils/helpers';

const router = Router();

router.post('/dat-san', requireAuth, async (req, res, next) => {
  try {
    const { sanBongId, giaTienId, ngayDat } = req.body || {};

    const nguoiDung = await prisma.nguoiDung.findFirst({ where: { soDienThoai: req.user!.soDienThoai } });
    if (!nguoiDung) throw new Error('Người dùng không tồn tại');

    const sanBong = await prisma.sanBong.findUnique({ where: { id: String(sanBongId) } });
    if (!sanBong) throw new Error('Sân bóng không tồn tại');
    if (sanBong.baoTri) return res.status(400).send('Sân đang bảo trì');

    const giaTien = await prisma.giaTien.findUnique({ where: { id: String(giaTienId) } });
    if (!giaTien) throw new Error('Khung giờ không tồn tại');
    if (giaTien.sanBongId !== String(sanBongId)) {
      return res.status(400).send('Khung giờ không thuộc sân này');
    }

    if (String(ngayDat) < getTodayYMD()) {
      return res.status(400).send('Không thể đặt sân trong quá khứ');
    }

    const sameSlot = await prisma.lichSu.count({
      where: {
        sanBongId: String(sanBongId),
        ngayDat: new Date(`${ngayDat}T00:00:00`),
        gioBatDau: giaTien.gioBatDau,
        gioKetThuc: giaTien.gioKetThuc,
        trangThai: { not: 'DA_HUY' },
      },
    });

    if (sameSlot > 0) return res.status(400).send('Khung giờ này đã được đặt');

    const created = await prisma.lichSu.create({
      data: {
        nguoiDungId: nguoiDung.id,
        sanBongId: String(sanBongId),
        ngayDat: new Date(`${ngayDat}T00:00:00`),
        gioBatDau: giaTien.gioBatDau,
        gioKetThuc: giaTien.gioKetThuc,
        giaTien: giaTien.giaTien,
        trangThai: 'CHO_XAC_NHAN',
      },
      include: { nguoiDung: true, sanBong: true },
    });

    res.json(toLichSuResponse(created));
  } catch (err) {
    next(err);
  }
});

router.get('/my-bookings', requireAuth, async (req, res, next) => {
  try {
    const nguoiDung = await prisma.nguoiDung.findFirst({ where: { soDienThoai: req.user!.soDienThoai } });
    if (!nguoiDung) throw new Error('Người dùng không tồn tại');

    const rows = await prisma.lichSu.findMany({
      where: { nguoiDungId: nguoiDung.id },
      orderBy: [{ ngayDat: 'desc' }, { gioBatDau: 'desc' }],
      include: { nguoiDung: true, sanBong: true },
    });

    res.json(rows.map(toLichSuResponse));
  } catch (err) {
    next(err);
  }
});

router.get('/san/:sanBongId', requireAuth, async (req, res, next) => {
  try {
    const sanBongId = req.params.sanBongId as string;
    const rows = await prisma.lichSu.findMany({
      where: { sanBongId },
      orderBy: [{ ngayDat: 'desc' }, { gioBatDau: 'desc' }],
      include: { nguoiDung: true, sanBong: true },
    });

    res.json(rows.map(toLichSuResponse));
  } catch (err) {
    next(err);
  }
});

router.get('/', requireAuth, async (_req, res, next) => {
  try {
    const rows = await prisma.lichSu.findMany({
      include: { nguoiDung: true, sanBong: true },
    });

    res.json(rows.map(toLichSuResponse));
  } catch (err) {
    next(err);
  }
});

router.put('/:id/status', requireAuth, async (req, res, next) => {
  try {
    const id = req.params.id as string;
    const status = req.query.status
      ? String(req.query.status)
      : req.body?.status
        ? String(req.body.status)
        : typeof req.body === 'string'
          ? req.body
          : '';

    const validStatuses = ['CHO_XAC_NHAN', 'DA_XAC_NHAN', 'DA_HUY'];
    if (!validStatuses.includes(status)) {
      return res.status(400).send(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    const existing = await prisma.lichSu.findUnique({ where: { id } });
    if (!existing) throw new Error('Lịch sử không tồn tại');

    const updated = await prisma.lichSu.update({
      where: { id },
      data: { trangThai: status as any },
      include: { nguoiDung: true, sanBong: true },
    });

    res.json(toLichSuResponse(updated));
  } catch (err) {
    next(err);
  }
});

export default router;
