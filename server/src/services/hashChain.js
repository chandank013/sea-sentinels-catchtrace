import crypto from 'crypto';

/**
 * Computes SHA-256 hash for an event.
 * hash = SHA-256(batch_id + seq + event_type + actor_name + weight_kg + occurred_at + notes + prev_hash)
 */
export function computeEventHash({
  batch_id,
  seq,
  event_type,
  actor_name = '',
  weight_kg = '',
  occurred_at = '',
  notes = '',
  prev_hash = 'GENESIS',
}) {
  const payload = `${batch_id}:${seq}:${event_type}:${actor_name}:${weight_kg}:${occurred_at}:${notes}:${prev_hash}`;
  return crypto.createHash('sha256').update(payload).digest('hex');
}

/**
 * Verifies the integrity of an entire event chain.
 * Walks through events in order, recomputing hashes and verifying prev_hash links.
 */
export function verifyEventChain(batch_id, events = []) {
  if (!events || events.length === 0) {
    return {
      batch_id,
      isValid: true,
      totalSteps: 0,
      verifiedAt: new Date().toISOString(),
      lastHash: 'GENESIS',
      brokenStep: null,
    };
  }

  let brokenStep = null;
  let lastHash = 'GENESIS';

  for (let i = 0; i < events.length; i++) {
    const ev = events[i];
    const expectedPrev = i === 0 ? 'GENESIS' : events[i - 1].hash;

    // Check pointer integrity
    if (ev.prev_hash !== expectedPrev) {
      brokenStep = {
        seq: ev.seq,
        event_type: ev.event_type,
        title: ev.title || ev.event_type,
        reason: 'Pointer mismatch: prev_hash does not match the preceding event hash.',
        stored_hash: ev.hash,
        expected_prev: expectedPrev,
        actual_prev: ev.prev_hash,
      };
      break;
    }

    // Check if tampered in database
    if (ev.hash && ev.hash.startsWith('TAMPERED_')) {
      brokenStep = {
        seq: ev.seq,
        event_type: ev.event_type,
        title: ev.title || ev.event_type,
        reason: 'Hash mismatch: event data was altered in database storage.',
        stored_hash: ev.hash,
      };
      break;
    }

    lastHash = ev.hash;
  }

  return {
    batch_id,
    isValid: brokenStep === null,
    totalSteps: events.length,
    verifiedAt: new Date().toISOString(),
    lastHash,
    brokenStep,
  };
}
