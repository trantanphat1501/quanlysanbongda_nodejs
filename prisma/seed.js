"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const adminRole = (await prisma.vaiTro.findFirst({ where: { name: 'Quan_tri' } })) ||
        (await prisma.vaiTro.create({ data: { name: 'Quan_tri' } }));
    const userRole = (await prisma.vaiTro.findFirst({ where: { name: 'Nguoi_dung' } })) ||
        (await prisma.vaiTro.create({ data: { name: 'Nguoi_dung' } }));
    await prisma.nguoiDung.upsert({
        where: { soDienThoai: '0000000000' },
        update: {},
        create: {
            name: 'Quan tri',
            soDienThoai: '0000000000',
            password: await bcryptjs_1.default.hash('123456', 10),
            roleId: adminRole.id,
        },
    });
    await prisma.nguoiDung.upsert({
        where: { soDienThoai: '1111111111' },
        update: {},
        create: {
            name: 'Nguoi dung',
            soDienThoai: '1111111111',
            password: await bcryptjs_1.default.hash('123456', 10),
            roleId: userRole.id,
        },
    });
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
