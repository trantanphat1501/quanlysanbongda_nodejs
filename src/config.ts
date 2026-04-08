import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '..', '.env'), override: true });

export const PORT = Number(process.env.PORT || 8080);
export const JWT_SECRET = process.env.JWT_SECRET || 'change_this_super_secret_key';
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';
