import express from 'express';
import { BATCHES, ALERTS, USERS, resetSeedData } from '../db/store.js';
import { computeEventHash, verifyEventChain } from '../services/hashChain.js';
import { runAlertRules } from '../services/alertsEngine.js';
import { filterBatchesByRole } from '../services/roleScoping.js';
import { authenticateToken, optionalToken } from '../middleware/auth.js';
import { serializeBatchForViewer, serializeEventForViewer } from '../services/eventSerializer.js';

const router = express.Router();

// Helper to determine if user is the natural receiving actor
function isAllowedReceiver(event, user) {
  if (!user) return false;
  if (user.role === 'ADMIN') return true;

  const role = user.role;
  const type = event.event_type;

  // SALE -> SELLER or ADMIN can confirm/dispute retail counter sales
  if (type === 'SALE') return role === 'SELLER' || role === 'ADMIN';

  // The receiving actor cannot be the one who logged it
  if (event.actor_id && user.id && event.actor_id === user.id) return false;
  if (event.actor_name && user.name && event.actor_name.trim().toLowerCase() === user.name.trim().toLowerCase()) return false;

  // Natural sequence of custody:
  // LANDING -> TRADER (auction inspection/purchase)
  if (type === 'LANDING') return role === 'TRADER';
  // PURCHASE -> PROCESSOR or TRANSPORTER
  if (type === 'PURCHASE') return role === 'PROCESSOR' || role === 'TRANSPORTER';
  // PROCESSING -> TRANSPORTER or SELLER
  if (type === 'PROCESSING') return role === 'TRANSPORTER' || role === 'SELLER';
  // TRANSPORT_* -> SELLER or PROCESSOR
  if (type.startsWith('TRANSPORT')) return role === 'SELLER' || role === 'PROCESSOR';

  return true;
}

// GET /api/batches
router.get('/', optionalToken, (req, res) => {
  const { q, species, status, landing_centre, role, userId, userName, userOrg, userEmail, scope } = req.query;
  let results = [...BATCHES];

  const userRole = (req.user?.role || role || '').toUpperCase();
  if (userRole && userRole !== 'ADMIN') {
    const user = {
      role: userRole,
      id: req.user?.id || userId,
      name: req.user?.name || userName,
      org: req.user?.org || userOrg,
      email: req.user?.email || userEmail,
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

  const serialized = results.map((b) => serializeBatchForViewer(b, req.user));
  return res.json(serialized);
});

// POST /api/batches/reset
router.post('/reset', (req, res) => {
  resetSeedData();
  return res.json({ message: 'All demo batches and alerts reset to seed state.', total_batches: BATCHES.length });
});

// GET /api/batches/:id
router.get('/:id', optionalToken, (req, res) => {
  const targetId = (req.params.id || '').trim().toLowerCase();
  const batch = BATCHES.find((b) => b.batch_id && b.batch_id.toLowerCase() === targetId);
  if (!batch) {
    return res.status(404).json({ error: 'Batch not found' });
  }
  return res.json(serializeBatchForViewer(batch, req.user));
});

// POST /api/batches
router.post('/', optionalToken, (req, res) => {
  const data = req.body;
  if (!data || !data.species || !data.landing_centre) {
    return res.status(400).json({ error: 'Species and landing centre are required.' });
  }
  const initialWeight = Number(data.initial_weight_kg);
  if (isNaN(initialWeight) || initialWeight <= 0) {
    return res.status(400).json({ error: 'Initial weight must be a positive number.' });
  }

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
    actor_name: data.operator_name || req.user?.name || 'Ramesh Naik',
    weight_kg: initialWeight,
    occurred_at: data.landed_at || nowIso,
    notes: data.notes || '',
    prev_hash: 'GENESIS',
  });

  const landingEvent = {
    seq: 1,
    event_type: 'LANDING',
    title: 'Landed',
    actor_id: req.user?.id || data.user_id || 'usr_fisher_01',
    actor_name: `${data.operator_name || req.user?.name || 'Ramesh Naik'} (Fisher)`,
    org_name: data.boat_name ? `${data.boat_name} Crew` : (req.user?.org || 'Sea Queen Trawlers'),
    weight_kg: initialWeight,
    temp_c: 2.4,
    location: data.landing_centre,
    occurred_at: data.landed_at || nowIso,
    notes: data.notes || 'Landing recorded',
    grade_claimed: data.grade_claimed || 'A',
    grade_confirmed: null,
    confirmation_status: 'PENDING',
    confirmed_by: null,
    confirmed_at: null,
    dispute_note: null,
    photo_url: null,
    prev_hash: 'GENESIS',
    hash: landingHash,
  };

  const newBatch = {
    batch_id: batchId,
    species: data.species,
    landing_centre: data.landing_centre,
    landed_at: data.landed_at || nowIso,
    initial_weight_kg: initialWeight,
    current_weight_kg: initialWeight,
    boat_name: data.boat_name || 'Sea Queen',
    operator_name: data.operator_name || req.user?.name || 'Ramesh Naik',
    user_id: req.user?.id || data.user_id || '',
    user_email: req.user?.email || data.user_email || '',
    current_handler: data.boat_name || 'Landing Operator',
    status: 'ACTIVE',
    created_at: nowIso,
    image: 'https://images.unsplash.com/photo-1534943441045-1215b22bdf5f?w=600&auto=format&fit=crop&q=80',
    notes: data.notes || '',
    events: [landingEvent],
  };

  BATCHES.unshift(newBatch);
  return res.status(201).json(serializeBatchForViewer(newBatch, req.user));
});

// POST /api/batches/:id/events
router.post('/:id/events', optionalToken, (req, res) => {
  const targetId = (req.params.id || '').trim().toLowerCase();
  const batch = BATCHES.find((b) => b.batch_id && b.batch_id.toLowerCase() === targetId);
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
    actor_name: eventData.actor_name || req.user?.name || 'Authorized Actor',
    weight_kg: eventData.weight_kg || batch.current_weight_kg,
    occurred_at: occurredAt,
    notes: eventData.notes || '',
    prev_hash: prevHash,
  });

  const event = {
    seq,
    event_type: eventData.event_type,
    title: eventData.title || eventData.event_type,
    actor_id: req.user?.id || eventData.actor_id || 'usr_actor',
    actor_name: eventData.actor_name || req.user?.name || 'Authorized Handler',
    org_name: eventData.org_name || req.user?.org || 'Custody Partner',
    weight_kg: Number(eventData.weight_kg) || batch.current_weight_kg,
    price_per_kg: eventData.price_per_kg ? Number(eventData.price_per_kg) : undefined,
    customer_type: eventData.customer_type,
    counterparty: eventData.counterparty,
    temp_c: eventData.temp_c !== undefined ? Number(eventData.temp_c) : undefined,
    input_weight_kg: eventData.input_weight_kg ? Number(eventData.input_weight_kg) : undefined,
    yield_percent: eventData.yield_percent ? Number(eventData.yield_percent) : undefined,
    process_type: eventData.process_type,
    location: eventData.location,
    occurred_at: occurredAt,
    notes: eventData.notes || '',
    grade_claimed: eventData.grade_claimed || 'A',
    grade_confirmed: eventData.event_type === 'SALE' ? (eventData.grade_claimed || 'A') : null,
    confirmation_status: eventData.event_type === 'SALE' ? 'CONFIRMED' : 'PENDING',
    confirmed_by: eventData.event_type === 'SALE' ? (req.user?.name || req.user?.id || 'Retail Point-of-Sale Checkout') : null,
    confirmed_at: eventData.event_type === 'SALE' ? occurredAt : null,
    dispute_note: null,
    photo_url: eventData.photo_url || null,
    prev_hash: prevHash,
    hash: newHash,
  };

  const triggeredAlerts = runAlertRules(batch, event);
  if (triggeredAlerts.length > 0) {
    batch.status = 'FLAGGED';
    ALERTS.unshift(...triggeredAlerts);
  } else if (eventData.event_type === 'SALE') {
    batch.status = 'SOLD';
    // Increment the seller's confirmed_count upon successful retail checkout
    const sellerActor = Object.values(USERS).find(
      (u) => (event.actor_id && u.id === event.actor_id) || (event.actor_name && event.actor_name.toLowerCase().includes(u.name.toLowerCase()))
    );
    if (sellerActor) {
      sellerActor.confirmed_count = (sellerActor.confirmed_count || 0) + 1;
    }
  }

  batch.current_weight_kg = event.weight_kg;
  batch.events.push(event);

  return res.json({
    batch: serializeBatchForViewer(batch, req.user),
    event: serializeEventForViewer(event, req.user),
    triggeredAlerts,
  });
});

// POST /api/batches/:id/events/:eventId/confirm
router.post('/:id/events/:eventId/confirm', authenticateToken, (req, res) => {
  const targetId = (req.params.id || '').trim().toLowerCase();
  const batch = BATCHES.find((b) => b.batch_id && b.batch_id.toLowerCase() === targetId);
  if (!batch) return res.status(404).json({ error: 'Batch not found' });

  const eventId = String(req.params.eventId);
  const event = (batch.events || []).find((e) => String(e.seq) === eventId || e.id === eventId || e._id === eventId);
  if (!event) return res.status(404).json({ error: 'Event not found in this batch' });

  if (event.confirmation_status === 'CONFIRMED') {
    return res.status(400).json({ error: 'This event has already been confirmed.' });
  }

  if (!isAllowedReceiver(event, req.user)) {
    return res.status(403).json({
      error: 'Only the authorized receiving actor or administrator can confirm this event.',
    });
  }

  event.confirmation_status = 'CONFIRMED';
  event.confirmed_by = req.user.id || req.user.name;
  event.confirmed_at = new Date().toISOString();
  if (req.body.grade_confirmed) {
    event.grade_confirmed = req.body.grade_confirmed;
  }

  // Increment the logging actor's confirmed_count
  const loggingActor = Object.values(USERS).find(
    (u) => (event.actor_id && u.id === event.actor_id) || (event.actor_name && event.actor_name.toLowerCase().includes(u.name.toLowerCase()))
  );
  if (loggingActor) {
    loggingActor.confirmed_count = (loggingActor.confirmed_count || 0) + 1;
  }

  return res.json({
    message: 'Event confirmed successfully',
    event: serializeEventForViewer(event, req.user),
    batch: serializeBatchForViewer(batch, req.user),
  });
});

// POST /api/batches/:id/events/:eventId/dispute
router.post('/:id/events/:eventId/dispute', authenticateToken, (req, res) => {
  const targetId = (req.params.id || '').trim().toLowerCase();
  const batch = BATCHES.find((b) => b.batch_id && b.batch_id.toLowerCase() === targetId);
  if (!batch) return res.status(404).json({ error: 'Batch not found' });

  const eventId = String(req.params.eventId);
  const event = (batch.events || []).find((e) => String(e.seq) === eventId || e.id === eventId || e._id === eventId);
  if (!event) return res.status(404).json({ error: 'Event not found in this batch' });

  const { dispute_note, photo_url, grade_confirmed } = req.body;
  if (!dispute_note || !dispute_note.trim()) {
    return res.status(400).json({ error: 'A dispute note is required to flag an anomaly.' });
  }

  if (!isAllowedReceiver(event, req.user)) {
    return res.status(403).json({
      error: 'Only the authorized receiving actor or administrator can dispute this event.',
    });
  }

  event.confirmation_status = 'DISPUTED';
  event.confirmed_by = req.user.id || req.user.name;
  event.confirmed_at = new Date().toISOString();
  event.dispute_note = dispute_note.trim();
  if (photo_url) event.photo_url = photo_url;
  if (grade_confirmed) event.grade_confirmed = grade_confirmed;

  // Increment the logging actor's disputed_count
  const loggingActor = Object.values(USERS).find(
    (u) => (event.actor_id && u.id === event.actor_id) || (event.actor_name && event.actor_name.toLowerCase().includes(u.name.toLowerCase()))
  );
  if (loggingActor) {
    loggingActor.disputed_count = (loggingActor.disputed_count || 0) + 1;
  }

  // Create High Severity Alert
  const newAlert = {
    id: `alt_disp_${Date.now()}`,
    batch_id: batch.batch_id,
    event_id: String(event.seq || eventId),
    type: 'INTEGRITY_DISPUTE',
    typeLabel: 'Disputed Handover',
    severity: 'HIGH',
    description: `Dispute logged on Step #${event.seq} (${event.title || event.event_type}) by ${req.user.name || req.user.role}: ${dispute_note.trim()}`,
    message: dispute_note.trim(),
    time: 'Just now',
    detected_at: new Date().toISOString(),
    status: 'OPEN',
    resolved: false,
    resolution_note: null,
  };
  ALERTS.unshift(newAlert);
  batch.status = 'FLAGGED';

  return res.json({
    message: 'Event dispute registered successfully',
    event: serializeEventForViewer(event, req.user),
    batch: serializeBatchForViewer(batch, req.user),
    alert: newAlert,
  });
});

// TODO: BUYER_PAID account_type gate for certificate bulk export and dashboard analytics
// GET /api/batches/:id/certificate
router.get('/:id/certificate', (req, res) => {
  const targetId = (req.params.id || '').trim().toLowerCase();
  const batch = BATCHES.find((b) => b.batch_id && b.batch_id.toLowerCase() === targetId);
  if (!batch) {
    return res.status(404).json({ error: 'Batch record not found.' });
  }

  // Condition 1: Must be SOLD
  if (batch.status !== 'SOLD') {
    return res.status(400).json({
      error: 'Not yet eligible — batch must be sold with no disputes.',
      reason: 'BATCH_NOT_SOLD',
      status: batch.status,
    });
  }

  // Condition 2: No DISPUTED events permitted
  const hasDispute = (batch.events || []).some((e) => e.confirmation_status === 'DISPUTED');
  if (hasDispute) {
    return res.status(400).json({
      error: 'Not yet eligible — batch contains disputed events.',
      reason: 'DISPUTE_PRESENT',
      status: batch.status,
    });
  }

  const all_confirmed = (batch.events || []).every((e) => e.confirmation_status === 'CONFIRMED');

  const certifiedEvents = (batch.events || []).map((e) => ({
    seq: e.seq,
    event_type: e.event_type,
    title: e.title,
    actor_name: e.actor_name,
    org_name: e.org_name,
    location: e.location,
    weight_kg: e.weight_kg,
    occurred_at: e.occurred_at,
    grade_claimed: e.grade_claimed || 'A',
    grade_confirmed: e.grade_confirmed || null,
    confirmation_status: e.confirmation_status || 'CONFIRMED',
    confirmed_by: e.confirmed_by || null,
    confirmed_at: e.confirmed_at || null,
  }));

  return res.json({
    certificate_id: `CT-CERT-${batch.batch_id}`,
    batch_id: batch.batch_id,
    species: batch.species,
    landing_centre: batch.landing_centre,
    landed_at: batch.landed_at,
    initial_weight_kg: batch.initial_weight_kg,
    current_weight_kg: batch.current_weight_kg,
    boat_name: batch.boat_name,
    operator_name: batch.operator_name,
    status: batch.status,
    all_confirmed,
    events: certifiedEvents,
    certified_at: new Date().toISOString(),
    qr_url: `https://catchtrace.in/trace/${batch.batch_id}`,
    verifier: 'CatchTrace National Seafood Traceability Ledger',
  });
});

// GET /api/batches/:id/verify
router.get('/:id/verify', (req, res) => {
  const targetId = (req.params.id || '').trim().toLowerCase();
  const batch = BATCHES.find((b) => b.batch_id && b.batch_id.toLowerCase() === targetId);
  if (!batch) return res.status(404).json({ error: 'Batch not found' });

  const result = verifyEventChain(batch.batch_id, batch.events);
  return res.json(result);
});

export default router;
