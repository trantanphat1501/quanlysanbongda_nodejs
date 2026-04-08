import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import jwt from 'jsonwebtoken';

import { authMiddleware } from './middleware/auth';
import { openApiDoc } from './swagger';

import authRouter from './routes/auth';
import nguoiDungRouter from './routes/nguoiDung';
import sanBongRouter from './routes/sanBong';
import giaTienRouter from './routes/giaTien';
import hinhAnhRouter from './routes/hinhAnh';
import lichSuRouter from './routes/lichSu';
import teamRouter from './routes/team';
import tournamentRouter from './routes/tournament';
import tournamentTeamRouter from './routes/tournamentTeam';
import matchRouter from './routes/match';
import matchEventRouter from './routes/matchEvent';

const app = express();

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Core middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use('/uploads', express.static(uploadsDir));

// Swagger docs
app.use('/swagger-ui', swaggerUi.serve, swaggerUi.setup(openApiDoc));
app.get('/v3/api-docs', (_req, res) => res.json(openApiDoc));

// Auth middleware (reads JWT and populates req.user if token present)
app.use(authMiddleware);

// Routes
app.use('/api/auth', authRouter);
app.use('/api/nguoi-dung', nguoiDungRouter);
app.use('/api/san-bong', sanBongRouter);
app.use('/api/gia-tien', giaTienRouter);
app.use('/api/hinh-anh', hinhAnhRouter);
app.use('/api/lich-su', lichSuRouter);
app.use('/api/teams', teamRouter);
app.use('/api/tournaments', tournamentRouter);
app.use('/api/tournament-teams', tournamentTeamRouter);
app.use('/api/matches', matchRouter);
app.use('/api/match-events', matchEventRouter);

// Global error handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof jwt.JsonWebTokenError) {
    return res.status(401).send('Invalid or expired token');
  }
  const message: string = err?.message || 'Internal server error';
  if (
    message.includes('not found') ||
    message.includes('khong ton tai') ||
    message.includes('không tồn tại')
  ) {
    return res.status(400).send(message);
  }
  console.error(err);
  return res.status(500).send(`Internal server error: ${message}`);
});

export default app;
