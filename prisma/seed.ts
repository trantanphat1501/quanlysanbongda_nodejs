import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const adminRole =
    (await prisma.vaiTro.findFirst({ where: { name: 'Quan_tri' } })) ||
    (await prisma.vaiTro.create({ data: { name: 'Quan_tri' } }));

  const userRole =
    (await prisma.vaiTro.findFirst({ where: { name: 'Nguoi_dung' } })) ||
    (await prisma.vaiTro.create({ data: { name: 'Nguoi_dung' } }));

  const admin = await prisma.nguoiDung.findFirst({ where: { soDienThoai: '0000000000' } });
  if (!admin) {
    await prisma.nguoiDung.create({
      data: {
        name: 'Quan tri',
        soDienThoai: '0000000000',
        password: await bcrypt.hash('123456', 10),
        roleId: adminRole.id,
      },
    });
  }

  const user = await prisma.nguoiDung.findFirst({ where: { soDienThoai: '1111111111' } });
  if (!user) {
    await prisma.nguoiDung.create({
      data: {
        name: 'Nguoi dung',
        soDienThoai: '1111111111',
        password: await bcrypt.hash('123456', 10),
        roleId: userRole.id,
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
