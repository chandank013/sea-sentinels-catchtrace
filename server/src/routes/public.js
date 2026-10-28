import express from 'express';
import { BATCHES } from '../db/store.js';

const router = express.Router();

// GET /api/public/trace/:id
router.get('/trace/:id', (req, res) => {
  const batch = BATCHES.find((b) => b.batch_id === req.params.id);
  if (!batch) {
    return res.status(404).json({ error: 'Batch not found' });
  }

  const isTampered = batch.events.some((e) => e.hash && e.hash.startsWith('TAMPERED_'));

  // Consumer safe fields
  const sanitizedEvents = batch.events.map((e) => ({
    seq: e.seq,
    event_type: e.event_type,
    title: e.title,
    org_name: e.org_name,
    location: e.location,
    weight_kg: e.weight_kg,
    occurred_at: e.occurred_at,
    temp_c: e.temp_c,
  }));

  return res.json({
    batch_id: batch.batch_id,
    species: batch.species,
    landing_centre: batch.landing_centre,
    landed_at: batch.landed_at,
    initial_weight_kg: batch.initial_weight_kg,
    current_weight_kg: batch.current_weight_kg,
    status: batch.status,
    image: batch.image,
    isVerified: !isTampered,
    events: sanitizedEvents,
  });
});

export default router;
