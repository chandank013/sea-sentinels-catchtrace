import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { config } from './config.js';

import authRouter from './routes/auth.js';
import batchesRouter from './routes/batches.js';
import publicRouter from './routes/public.js';
import dashboardRouter from './routes/dashboard.js';
import alertsRouter from './routes/alerts.js';
import exportRouter from './routes/export.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRouter);
app.use('/api/batches', batchesRouter);
app.use('/api/public', publicRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/alerts', alertsRouter);
app.use('/api/export', exportRouter);

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
