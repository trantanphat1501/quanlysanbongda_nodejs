import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../prisma';
import { JWT_SECRET } from '../config';

export async function authMiddleware(req: Request, _res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return next();
  }

  try {
    const token = auth.slice(7);
    const payload = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;
    const soDienThoai = payload.sub;
    if (!soDienThoai) return next();

    const user = await prisma.nguoiDung.findFirst({
      where: { soDienThoai },
      include: { vaiTro: true },
    });

    if (!user) return next();

    req.user = {
      id: user.id,
      soDienThoai: user.soDienThoai,
      role: `ROLE_${user.vaiTro.name}`,
      roleId: user.roleId,
      name: user.name,
    };

    next();
  } catch (_e) {
    next();
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).send('Authentication failed: Unauthorized');
  }
  next();
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).send('Authentication failed: Unauthorized');
  }
  if (req.user.role !== 'ROLE_Quan_tri') {
    return res.status(403).send('Access denied: Forbidden');
  }
  next();
}
