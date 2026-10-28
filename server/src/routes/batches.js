import express from 'express';
import { BATCHES, ALERTS } from '../db/store.js';
import { computeEventHash, verifyEventChain } from '../services/hashChain.js';
import { runAlertRules } from '../services/alertsEngine.js';
import { filterBatchesByRole } from '../services/roleScoping.js';

const router = express.Router();

// GET /api/batches
router.get('/', (req, res) => {
  const { q, species, status, landing_centre, role, userId, userName, userOrg, userEmail, scope } = req.query;
  let results = [...BATCHES];

  const userRole = (role || '').toUpperCase();
  if (userRole && userRole !== 'ADMIN') {
    const user = {
      role: userRole,
      id: userId,
      name: userName,
      org: userOrg,
      email: userEmail,
    };
    results = filterBatchesByRole(results, user);
  }

  if (species && species !== 'ALL') {
    results = results.filter((b) => b.species.toLowerCase() === species.toLowerCase());
  }
  if (status && status !== 'ALL') {
    results = results.filter((b) => b.status === status);
  }
  if (landing_centre && landing_centre !== 'ALL') {
    results = results.filter((b) => b.landing_centre === landing_centre);
  }
  if (q) {
    const query = q.toLowerCase();
    results = results.filter(
      (b) =>
        b.batch_id.toLowerCase().includes(query) ||
        b.species.toLowerCase().includes(query) ||
        b.landing_centre.toLowerCase().includes(query) ||
        (b.boat_name && b.boat_name.toLowerCase().includes(query)) ||
        (b.operator_name && b.operator_name.toLowerCase().includes(query))
    );
  }

  return res.json(results);
});

// GET /api/batches/:id
router.get('/:id', (req, res) => {
  const batch = BATCHES.find((b) => b.batch_id === req.params.id);
  if (!batch) {
    return res.status(404).json({ error: 'Batch not found' });
  }
  return res.json(batch);
});

// POST /api/batches
router.post('/', (req, res) => {
  const data = req.body;
  const todayStr = '20261028';
  let maxSeq = 45;
  BATCHES.forEach((b) => {
    if (b.batch_id && b.batch_id.startsWith(`FB-${todayStr}-`)) {
      const seq = parseInt(b.batch_id.split('-')[2], 10);
      if (!isNaN(seq) && seq > maxSeq) maxSeq = seq;
    }
  });

  const nextSeq = (maxSeq + 1).toString().padStart(4, '0');
  const batchId = `FB-${todayStr}-${nextSeq}`;
  const nowIso = new Date().toISOString();

  const landingHash = computeEventHash({
    batch_id: batchId,
    seq: 1,
    event_type: 'LANDING',
    actor_name: data.operator_name || 'Ramesh Naik',
    weight_kg: data.initial_weight_kg,
    occurred_at: data.landed_at || nowIso,
    notes: data.notes || '',
    prev_hash: 'GENESIS',
  });

  const landingEvent = {
    seq: 1,
    event_type: 'LANDING',
    title: 'Landed',
    actor_name: `${data.operator_name || 'Ramesh Naik'} (Fisher)`,
    org_name: data.boat_name ? `${data.boat_name} Crew` : 'Sea Queen Trawlers',
    weight_kg: Number(data.initial_weight_kg),
    temp_c: 2.4,
    location: data.landing_centre,
    occurred_at: data.landed_at || nowIso,
    notes: data.notes || 'Landing recorded',
    prev_hash: 'GENESIS',
    hash: landingHash,
  };

  const newBatch = {
    batch_id: batchId,
    species: data.species,
    landing_centre: data.landing_centre,
    landed_at: data.landed_at || nowIso,
    initial_weight_kg: Number(data.initial_weight_kg),
    current_weight_kg: Number(data.initial_weight_kg),
    boat_name: data.boat_name || 'Sea Queen',
    operator_name: data.operator_name || 'Ramesh Naik',
    user_id: data.user_id || '',
    user_email: data.user_email || '',
    current_handler: data.boat_name || 'Landing Operator',
    status: 'ACTIVE',
    created_at: nowIso,
    image: 'https://images.unsplash.com/photo-1534943441045-1215b22bdf5f?w=600&auto=format&fit=crop&q=80',
    notes: data.notes || '',
    events: [landingEvent],
  };

  BATCHES.unshift(newBatch);
  return res.status(201).json(newBatch);
});

// POST /api/batches/:id/events
router.post('/:id/events', (req, res) => {
  const batch = BATCHES.find((b) => b.batch_id === req.params.id);
  if (!batch) return res.status(404).json({ error: 'Batch not found' });

  if (batch.status === 'SOLD') {
    return res.status(400).json({ error: 'Batch is SOLD. No further chain events permitted.' });
  }

  const eventData = req.body;
  const events = batch.events || [];
  const seq = events.length + 1;
  const prevHash = events.length > 0 ? events[events.length - 1].hash : 'GENESIS';
  const occurredAt = eventData.occurred_at || new Date().toISOString();

  const newHash = computeEventHash({
    batch_id: batch.batch_id,
    seq,
    event_type: eventData.event_type,
    actor_name: eventData.actor_name || 'Authorized Actor',
    weight_kg: eventData.weight_kg || batch.current_weight_kg,
    occurred_at: occurredAt,
    notes: eventData.notes || '',
    prev_hash: prevHash,
  });

  const event = {
    seq,
    event_type: eventData.event_type,
    title: eventData.title || eventData.event_type,
    actor_name: eventData.actor_name || 'Authorized Handler',
    org_name: eventData.org_name || 'Custody Partner',
    weight_kg: Number(eventData.weight_kg) || batch.current_weight_kg,
    temp_c: eventData.temp_c !== undefined ? Number(eventData.temp_c) : undefined,
    location: eventData.location,
    occurred_at: occurredAt,
    notes: eventData.notes || '',
    prev_hash: prevHash,
    hash: newHash,
  };

  const triggeredAlerts = runAlertRules(batch, event);
  if (triggeredAlerts.length > 0) {
    batch.status = 'FLAGGED';
    ALERTS.unshift(...triggeredAlerts);
  } else if (eventData.event_type === 'SALE') {
    batch.status = 'SOLD';
  }

  batch.current_weight_kg = event.weight_kg;
  batch.events.push(event);

  return res.json({ batch, event, triggeredAlerts });
});

// GET /api/batches/:id/verify
router.get('/:id/verify', (req, res) => {
  const batch = BATCHES.find((b) => b.batch_id === req.params.id);
  if (!batch) return res.status(404).json({ error: 'Batch not found' });

  const result = verifyEventChain(batch.batch_id, batch.events);
  return res.json(result);
});

export default router;
