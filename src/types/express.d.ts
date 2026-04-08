import 'express';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        soDienThoai: string;
        role: string;
        roleId: string;
        name?: string | null;
      };
    }
  }
}

export {};
