import { config } from '../config.js';

export function runAlertRules(batch, newEvent) {
  const generatedAlerts = [];
  const events = batch.events || [];
  const lastEvent = events.length > 0 ? events[events.length - 1] : null;

  // 1. DUPLICATE: Same batch, same type, same actor within window
  if (lastEvent) {
    const isSameType = lastEvent.event_type === newEvent.event_type;
    const isSameActor = lastEvent.actor_name === newEvent.actor_name;
    const timeDiffMs = Math.abs(new Date(newEvent.occurred_at) - new Date(lastEvent.occurred_at));
    const windowMs = config.THRESHOLDS.DUPLICATE_TIME_WINDOW_MINUTES * 60 * 1000;

    if (isSameType && isSameActor && timeDiffMs <= windowMs) {
      generatedAlerts.push({
        id: `alt_${Date.now()}_dup`,
        batch_id: batch.batch_id,
        type: 'DUPLICATE',
        typeLabel: 'Duplicate Entry',
        description: `Duplicate ${newEvent.event_type} entry submitted within 5 minutes by ${newEvent.actor_name}`,
        time: 'Just now',
        detected_at: new Date().toISOString(),
        severity: 'MED',
        status: 'OPEN',
        resolved: false,
        resolution_note: null,
      });
    }
  }

  // 2. WEIGHT_LOSS: Weight drops > threshold
  if (lastEvent && lastEvent.weight_kg && newEvent.weight_kg) {
    const lossKg = lastEvent.weight_kg - newEvent.weight_kg;
    const lossPercent = (lossKg / lastEvent.weight_kg) * 100;
    const maxThreshold = newEvent.event_type === 'PROCESSING'
      ? config.THRESHOLDS.WEIGHT_LOSS_PROCESSING_PERCENT
      : config.THRESHOLDS.WEIGHT_LOSS_GENERAL_PERCENT;

    if (lossPercent > maxThreshold) {
      generatedAlerts.push({
        id: `alt_${Date.now()}_wt`,
        batch_id: batch.batch_id,
        type: 'WEIGHT_LOSS',
        typeLabel: 'Weight Loss (>20%)',
        description: `Weight dropped by ${lossPercent.toFixed(1)}% (${lossKg} kg) between ${lastEvent.title} and ${newEvent.title}`,
        time: 'Just now',
        detected_at: new Date().toISOString(),
        severity: 'HIGH',
        status: 'OPEN',
        resolved: false,
        resolution_note: null,
      });
    }
  }

  // 3. TIME_GAP: > 6 hours between consecutive steps after landing
  if (lastEvent) {
    const hoursGap = Math.abs(new Date(newEvent.occurred_at) - new Date(lastEvent.occurred_at)) / (1000 * 60 * 60);
    if (hoursGap > config.THRESHOLDS.TIME_GAP_MAX_HOURS) {
      generatedAlerts.push({
        id: `alt_${Date.now()}_gap`,
        batch_id: batch.batch_id,
        type: 'TIME_GAP',
        typeLabel: 'Long Time Gap',
        description: `Time gap of ${hoursGap.toFixed(1)} hours between consecutive steps (exceeds ${config.THRESHOLDS.TIME_GAP_MAX_HOURS}h threshold)`,
        time: 'Just now',
        detected_at: new Date().toISOString(),
        severity: hoursGap > 24 ? 'HIGH' : 'MED',
        status: 'OPEN',
        resolved: false,
        resolution_note: null,
      });
    }
  }

  // 4. MISSING_STEP: SALE logged without any TRANSPORT or PURCHASE event
  if (newEvent.event_type === 'SALE') {
    const hasPurchase = events.some((e) => e.event_type === 'PURCHASE');
    const hasTransport = events.some((e) => e.event_type.startsWith('TRANSPORT'));
    if (!hasPurchase || !hasTransport) {
      generatedAlerts.push({
        id: `alt_${Date.now()}_mis`,
        batch_id: batch.batch_id,
        type: 'MISSING_STEP',
        typeLabel: 'Missing Step',
        description: `Batch was sold without prior ${!hasPurchase ? 'PURCHASE' : ''} ${!hasTransport ? 'TRANSPORT' : ''} step`,
        time: 'Just now',
        detected_at: new Date().toISOString(),
        severity: 'MED',
        status: 'OPEN',
        resolved: false,
        resolution_note: null,
      });
    }
  }

  return generatedAlerts;
}
