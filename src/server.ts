import './config';
import bcrypt from 'bcryptjs';
import app from './app';
import prisma from './prisma';
import { PORT } from './config';

app.listen(PORT, async () => {
  const adminRole = await prisma.vaiTro.findFirst({ where: { name: 'Quan_tri' } });
  const userRole = await prisma.vaiTro.findFirst({ where: { name: 'Nguoi_dung' } });

  if (!adminRole) await prisma.vaiTro.create({ data: { name: 'Quan_tri' } });
  if (!userRole) await prisma.vaiTro.create({ data: { name: 'Nguoi_dung' } });

  const admin = await prisma.nguoiDung.findFirst({ where: { soDienThoai: '0000000000' } });
  if (!admin) {
    const role = await prisma.vaiTro.findFirst({ where: { name: 'Quan_tri' } });
    if (role) {
      await prisma.nguoiDung.create({
        data: {
          name: 'Quan tri',
          soDienThoai: '0000000000',
          password: await bcrypt.hash('123456', 10),
          roleId: role.id,
        },
      });
    }
  }

  const user = await prisma.nguoiDung.findFirst({ where: { soDienThoai: '1111111111' } });
  if (!user) {
    const role = await prisma.vaiTro.findFirst({ where: { name: 'Nguoi_dung' } });
    if (role) {
      await prisma.nguoiDung.create({
        data: {
          name: 'Nguoi dung',
          soDienThoai: '1111111111',
          password: await bcrypt.hash('123456', 10),
          roleId: role.id,
        },
      });
    }
  }

  console.log(`Server running on http://localhost:${PORT}`);
});
