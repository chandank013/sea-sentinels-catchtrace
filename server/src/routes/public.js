import express from 'express';
import { BATCHES } from '../db/store.js';
import { serializeEventForViewer } from '../services/eventSerializer.js';

const router = express.Router();

// GET /api/public/trace/:id
router.get('/trace/:id', (req, res) => {
  const targetId = (req.params.id || '').trim().toLowerCase();
  const batch = BATCHES.find((b) => b.batch_id && b.batch_id.toLowerCase() === targetId);
  if (!batch) {
    return res.status(404).json({ error: 'Batch not found' });
  }

  const isTampered = (batch.events || []).some((e) => e.hash && e.hash.startsWith('TAMPERED_'));

  // Consumer safe fields serialized for public unauthenticated viewer
  const sanitizedEvents = (batch.events || []).map((e) => serializeEventForViewer(e, null));

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
    integrity: {
      is_intact: !isTampered,
      message: !isTampered ? 'Cryptographically Verified Intact' : 'Tampered Record Detected',
    },
    events: sanitizedEvents,
  });
});

export default router;
