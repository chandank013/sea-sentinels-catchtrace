import express from 'express';
import { ALERTS } from '../db/store.js';

const router = express.Router();

// GET /api/alerts
router.get('/', (req, res) => {
  const { type, severity, resolved, status } = req.query;
  let results = [...ALERTS];

  if (type && type !== 'ALL') {
    results = results.filter((a) => a.type === type);
  }
  if (severity && severity !== 'ALL') {
    results = results.filter((a) => a.severity === severity);
  }
  if (status && status !== 'ALL') {
    const isResolved = status === 'RESOLVED';
    results = results.filter((a) => a.resolved === isResolved);
  } else if (resolved !== undefined && resolved !== 'ALL') {
    const isRes = resolved === 'true' || resolved === true;
    results = results.filter((a) => a.resolved === isRes);
  }

  return res.json(results);
});

// PATCH /api/alerts/:id
router.patch('/:id', (req, res) => {
  const alert = ALERTS.find((a) => a.id === req.params.id);
  if (!alert) return res.status(404).json({ error: 'Alert not found' });

  const { resolved, resolution_note } = req.body;
  if (resolved !== undefined) alert.resolved = resolved;
  if (resolution_note !== undefined) alert.resolution_note = resolution_note;
  alert.status = alert.resolved ? 'RESOLVED' : 'OPEN';

  return res.json(alert);
});

export default router;
