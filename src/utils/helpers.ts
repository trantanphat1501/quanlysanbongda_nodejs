import jwt from 'jsonwebtoken';
import { JWT_SECRET, JWT_EXPIRES_IN } from '../config';

export function toPublicUser(user: any) {
  return {
    id: user.id,
    name: user.name,
    soDienThoai: user.soDienThoai,
    vaiTro: {
      id: user.vaiTro.id,
      name: user.vaiTro.name,
    },
  };
}

export function decimalToNumber(value: number | null | undefined) {
  if (value == null) return null;
  return Number(value);
}

export function toDateOnly(input: Date | null | undefined) {
  if (!input) return null;
  const d = new Date(input);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function getTodayYMD() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

export function signAccessToken(soDienThoai: string, role: string) {
  return jwt.sign({ role }, JWT_SECRET, {
    subject: soDienThoai,
    expiresIn: JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
}
