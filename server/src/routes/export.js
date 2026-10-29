import express from 'express';
import { BATCHES } from '../db/store.js';

const router = express.Router();

// TODO: BUYER_PAID account_type gate for certificate bulk export and dashboard analytics
// GET /api/export/batches.csv & /api/export/csv
router.get(['/batches.csv', '/csv'], (req, res) => {
  const headers = [
    'Batch ID',
    'Species',
    'Landing Centre',
    'Landed Date',
    'Initial Weight (kg)',
    'Current Weight (kg)',
    'Current Handler',
    'Status',
    'Total Events',
  ];

  const rows = BATCHES.map((b) => [
    b.batch_id,
    b.species,
    `"${b.landing_centre}"`,
    b.landed_at,
    b.initial_weight_kg,
    b.current_weight_kg,
    `"${b.current_handler || ''}"`,
    b.status,
    b.events ? b.events.length : 0,
  ]);

  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename=CatchTrace_Batches_${Date.now()}.csv`);
  return res.send(csv);
});

export default router;
