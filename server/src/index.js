import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { config } from './config.js';

import authRouter from './routes/auth.js';
import batchesRouter from './routes/batches.js';
import publicRouter from './routes/public.js';
import dashboardRouter from './routes/dashboard.js';
import alertsRouter from './routes/alerts.js';
import exportRouter from './routes/export.js';
import usersRouter from './routes/users.js';
import uploadRouter from './routes/upload.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOADS_DIR = path.join(__dirname, '../uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static file hosting for captured live evidence
app.use('/uploads', express.static(UPLOADS_DIR));

// Routes
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/batches', batchesRouter);
app.use('/api/public', publicRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/alerts', alertsRouter);
app.use('/api/export', exportRouter);
app.use('/api/upload', uploadRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'CatchTrace API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

app.listen(config.PORT, () => {
  console.log(`CatchTrace Express API running on port ${config.PORT}`);
});
