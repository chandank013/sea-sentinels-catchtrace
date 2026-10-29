/**
 * Privacy Rule:
 * Strip price_per_kg and sensitive counterparty identity/contact fields
 * UNLESS viewerUser is role ADMIN or one of the two actors directly party to the event.
 */
export function serializeEventForViewer(event, viewerUser = null) {
  if (!event) return null;

  const viewerId = viewerUser?.id || '';
  const viewerName = (viewerUser?.name || '').toLowerCase();
  const viewerOrg = (viewerUser?.org || '').toLowerCase();
  const viewerRole = (viewerUser?.role || '').toUpperCase();

  const isAdmin = viewerRole === 'ADMIN';

  // Check if viewer is the logging actor
  const isLoggingActor =
    Boolean(viewerId && event.actor_id && viewerId === event.actor_id) ||
    Boolean(viewerName && event.actor_name && event.actor_name.toLowerCase().includes(viewerName)) ||
    Boolean(viewerOrg && event.org_name && event.org_name.toLowerCase().includes(viewerOrg));

  // Check if viewer is the receiving / confirming actor
  const isReceivingActor =
    Boolean(viewerId && event.confirmed_by && viewerId === event.confirmed_by) ||
    Boolean(viewerName && event.confirmed_by && String(event.confirmed_by).toLowerCase().includes(viewerName));

  const isPartyToEvent = isLoggingActor || isReceivingActor;
  const isAuthorized = isAdmin || isPartyToEvent;

  const baseEvent = {
    seq: event.seq,
    event_type: event.event_type,
    title: event.title,
    actor_id: event.actor_id,
    actor_name: event.actor_name,
    org_name: event.org_name,
    location: event.location,
    weight_kg: event.weight_kg,
    input_weight_kg: event.input_weight_kg,
    yield_percent: event.yield_percent,
    process_type: event.process_type,
    temp_c: event.temp_c,
    occurred_at: event.occurred_at,
    recorded_at: event.recorded_at,
    notes: event.notes,
    grade_claimed: event.grade_claimed || 'A',
    grade_confirmed: event.grade_confirmed || null,
    confirmation_status: event.confirmation_status || 'PENDING',
    confirmed_by: event.confirmed_by || null,
    confirmed_at: event.confirmed_at || null,
    dispute_note: event.dispute_note || null,
    photo_url: event.photo_url || null,
    photo_hash: event.photo_hash || null,
    prev_hash: event.prev_hash,
    hash: event.hash,
  };

  if (isAuthorized) {
    baseEvent.price_per_kg = event.price_per_kg;
    baseEvent.customer_type = event.customer_type;
    baseEvent.counterparty = event.counterparty;
  }

  return baseEvent;
}

export function serializeBatchForViewer(batch, viewerUser = null) {
  if (!batch) return null;
  return {
    ...batch,
    events: (batch.events || []).map((e) => serializeEventForViewer(e, viewerUser)),
  };
}
