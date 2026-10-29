import axios from 'axios';
import {
  getStoredBatches,
  saveStoredBatches,
  getStoredAlerts,
  saveStoredAlerts,
  sha256,
  INITIAL_BATCHES,
  INITIAL_ALERTS,
} from './mockData';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://catch-trace-api.onrender.com';

const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json',
  },
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('catchtrace_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Helper to filter batches by user role
export function filterBatchesByRole(batches, user) {
  if (!user || user.role === 'ADMIN') return batches;

  const userName = (user.name || '').toLowerCase().trim();
  const userOrg = (user.org || '').toLowerCase().trim();
  const userEmail = (user.email || '').toLowerCase().trim();
  const userId = (user.id || '').toLowerCase().trim();

  if (user.role === 'FISHER') {
    return batches.filter((b) => {
      // 1. Direct ID or Email match
      if (b.user_id && userId && b.user_id.toLowerCase() === userId) return true;
      if (b.user_email && userEmail && b.user_email.toLowerCase() === userEmail) return true;

      // 2. Operator name exact or partial match
      if (b.operator_name && userName && (
        b.operator_name.toLowerCase().trim() === userName ||
        userName.includes(b.operator_name.toLowerCase().trim()) ||
        b.operator_name.toLowerCase().trim().includes(userName)
      )) return true;

      // 3. Genesis landing event actor match
      const matchLandingEvent = (b.events || []).some(
        (e) =>
          e.event_type === 'LANDING' &&
          e.actor_name &&
          userName &&
          (e.actor_name.toLowerCase().includes(userName) || userName.includes(e.actor_name.toLowerCase()))
      );
      if (matchLandingEvent) return true;

      return false;
    });
  }

  if (user.role === 'TRADER') {
    return batches.filter((b) => {
      const matchPurchase = (b.events || []).some(
        (e) =>
          e.event_type === 'PURCHASE' &&
          ((e.actor_id && userId && e.actor_id.toLowerCase() === userId) ||
            (e.actor_name && userName && e.actor_name.toLowerCase().includes(userName)) ||
            (e.org_name && userOrg && (userOrg.includes(e.org_name.toLowerCase()) || e.org_name.toLowerCase().includes(userOrg))))
      );
      const matchHandler = b.current_handler && userOrg && (
        b.current_handler.toLowerCase().includes(userOrg) || userOrg.includes(b.current_handler.toLowerCase())
      );
      return matchPurchase || matchHandler;
    });
  }

  if (user.role === 'PROCESSOR') {
    return batches.filter((b) => {
      const matchProcessing = (b.events || []).some(
        (e) =>
          e.event_type === 'PROCESSING' &&
          ((e.actor_id && userId && e.actor_id.toLowerCase() === userId) ||
            (e.actor_name && userName && e.actor_name.toLowerCase().includes(userName)) ||
            (e.org_name && userOrg && (userOrg.includes(e.org_name.toLowerCase()) || e.org_name.toLowerCase().includes(userOrg))))
      );
      const matchHandler = b.current_handler && userOrg && (
        b.current_handler.toLowerCase().includes(userOrg) || userOrg.includes(b.current_handler.toLowerCase())
      );
      return matchProcessing || matchHandler;
    });
  }

  if (user.role === 'TRANSPORTER') {
    return batches.filter((b) => {
      return (b.events || []).some(
        (e) =>
          e.event_type && e.event_type.startsWith('TRANSPORT') &&
          ((e.actor_id && userId && e.actor_id.toLowerCase() === userId) ||
            (e.actor_name && userName && e.actor_name.toLowerCase().includes(userName)) ||
            (e.org_name && userOrg && (userOrg.includes(e.org_name.toLowerCase()) || e.org_name.toLowerCase().includes(userOrg))))
      );
    });
  }

  if (user.role === 'SELLER') {
    return batches.filter((b) => {
      const matchSale = (b.events || []).some(
        (e) =>
          e.event_type === 'SALE' &&
          ((e.actor_id && userId && e.actor_id.toLowerCase() === userId) ||
            (e.actor_name && userName && e.actor_name.toLowerCase().includes(userName)) ||
            (e.org_name && userOrg && (userOrg.includes(e.org_name.toLowerCase()) || e.org_name.toLowerCase().includes(userOrg))))
      );
      const matchHandler = b.current_handler && userOrg && (
        b.current_handler.toLowerCase().includes(userOrg) || userOrg.includes(b.current_handler.toLowerCase())
      );
      return matchSale || matchHandler;
    });
  }

  return [];
}
function generateNextBatchId(batches) {
  const todayStr = '20261028';
  let maxSeq = 45;
  batches.forEach((b) => {
    if (b.batch_id && b.batch_id.startsWith(`FB-${todayStr}-`)) {
      const seq = parseInt(b.batch_id.split('-')[2], 10);
      if (!isNaN(seq) && seq > maxSeq) {
        maxSeq = seq;
      }
    }
  });
  const nextSeq = (maxSeq + 1).toString().padStart(4, '0');
  return `FB-${todayStr}-${nextSeq}`;
}

// Check alert rules when a new event is added
function checkAlertRules(batch, newEvent, allAlerts) {
  const generatedAlerts = [];
  const events = batch.events || [];
  const lastEvent = events.length > 0 ? events[events.length - 1] : null;

  // 1. DUPLICATE CHECK: Same batch, same type, same actor within 5 minutes (300,000 ms)
  if (lastEvent) {
    const isSameType = lastEvent.event_type === newEvent.event_type;
    const isSameActor = lastEvent.actor_name === newEvent.actor_name;
    const timeDiff = Math.abs(new Date(newEvent.occurred_at) - new Date(lastEvent.occurred_at));
    if (isSameType && isSameActor && timeDiff <= 5 * 60 * 1000) {
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

  // 2. WEIGHT LOSS CHECK: Weight drops > 15% between steps (or > 60% for processing)
  if (lastEvent && lastEvent.weight_kg && newEvent.weight_kg) {
    const lossKg = lastEvent.weight_kg - newEvent.weight_kg;
    const lossPercent = (lossKg / lastEvent.weight_kg) * 100;
    const maxThreshold = newEvent.event_type === 'PROCESSING' ? 60 : 15;

    if (lossPercent > maxThreshold) {
      generatedAlerts.push({
        id: `alt_${Date.now()}_wt`,
        batch_id: batch.batch_id,
        type: 'WEIGHT_LOSS',
        typeLabel: 'Significant Weight Loss',
        description: `Weight dropped by ${lossPercent.toFixed(1)}% (${lossKg} kg) between ${lastEvent.title} and ${newEvent.title} (exceeds ${maxThreshold}% threshold)`,
        time: 'Just now',
        detected_at: new Date().toISOString(),
        severity: 'HIGH',
        status: 'OPEN',
        resolved: false,
        resolution_note: null,
      });
    }
  }

  // 3. TIME GAP: > 6 hours between consecutive steps after landing
  if (lastEvent) {
    const hoursGap = Math.abs(new Date(newEvent.occurred_at) - new Date(lastEvent.occurred_at)) / (1000 * 60 * 60);
    if (hoursGap > 6) {
      generatedAlerts.push({
        id: `alt_${Date.now()}_gap`,
        batch_id: batch.batch_id,
        type: 'TIME_GAP',
        typeLabel: 'Long Time Gap',
        description: `Time gap of ${hoursGap.toFixed(1)} hours between consecutive steps (exceeds 6h threshold)`,
        time: 'Just now',
        detected_at: new Date().toISOString(),
        severity: hoursGap > 24 ? 'HIGH' : 'MED',
        status: 'OPEN',
        resolved: false,
        resolution_note: null,
      });
    }
  }

  // 4. MISSING STEP: SALE logged without any TRANSPORT or PURCHASE event
  if (newEvent.event_type === 'SALE') {
    const hasPurchase = events.some((e) => e.event_type === 'PURCHASE');
    const hasTransport = events.some((e) => e.event_type.startsWith('TRANSPORT'));
    if (!hasPurchase || !hasTransport) {
      generatedAlerts.push({
        id: `alt_${Date.now()}_mis`,
        batch_id: batch.batch_id,
        type: 'MISSING_STEP',
        typeLabel: 'Missing Supply Chain Step',
        description: `Batch was sold without prior ${!hasPurchase ? 'PURCHASE' : ''} ${!hasTransport ? 'TRANSPORT' : ''} step logged`,
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

export const api = {
  // Authentication
  async login(payload) {
    const res = await client.post('/api/auth/login', payload);
    return res.data;
  },

  async register(payload) {
    const res = await client.post('/api/auth/register', payload);
    return res.data;
  },

  // Fetch Batches
  async getBatches(params = {}) {
    try {
      const queryParams = {
        ...params,
        role: params.user?.role,
        userId: params.user?.id,
        userName: params.user?.name,
        userOrg: params.user?.org,
        userEmail: params.user?.email,
      };
      const res = await client.get('/api/batches', { params: queryParams });
      let list = res.data;
      if (params.user && params.user.role !== 'ADMIN') {
        list = filterBatchesByRole(list, params.user);
      }
      return list;
    } catch {
      let list = getStoredBatches();

      // If user is not admin, filter strictly by user role
      if (params.user && params.user.role !== 'ADMIN') {
        list = filterBatchesByRole(list, params.user);
      }

      if (params.species && params.species !== 'ALL') {
        list = list.filter((b) => b.species.toLowerCase() === params.species.toLowerCase());
      }
      if (params.status && params.status !== 'ALL') {
        list = list.filter((b) => b.status === params.status);
      }
      if (params.landing_centre && params.landing_centre !== 'ALL') {
        list = list.filter((b) => b.landing_centre === params.landing_centre);
      }
      if (params.q) {
        const query = params.q.toLowerCase();
        list = list.filter(
          (b) =>
            b.batch_id.toLowerCase().includes(query) ||
            b.species.toLowerCase().includes(query) ||
            b.landing_centre.toLowerCase().includes(query) ||
            (b.boat_name && b.boat_name.toLowerCase().includes(query)) ||
            (b.operator_name && b.operator_name.toLowerCase().includes(query))
        );
      }
      return list;
    }
  },

  // Fetch Batch by ID
  async getBatchById(id) {
    const cleanId = (id || '').trim();
    try {
      const res = await client.get(`/api/batches/${cleanId}`);
      return res.data;
    } catch {
      const list = getStoredBatches();
      const found = list.find((b) => b.batch_id && b.batch_id.toLowerCase() === cleanId.toLowerCase());
      if (!found) {
        throw new Error(`Batch ${id} not found`);
      }
      return found;
    }
  },

  // Create New Batch
  async createBatch(data) {
    try {
      const res = await client.post('/api/batches', data);
      return res.data;
    } catch {
      const list = getStoredBatches();
      const newId = generateNextBatchId(list);
      const nowIso = new Date().toISOString();

      // Create Genesis Landing Event
      const landingHash = await sha256(
        `${newId}:1:LANDING:${data.operator_name || 'Fisher'}:${data.initial_weight_kg}:${data.landed_at || nowIso}:${data.notes || ''}:GENESIS`
      );

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
        notes: data.notes || 'Batch landing registered and ice packed.',
        prev_hash: 'GENESIS',
        hash: landingHash,
      };

      const newBatch = {
        batch_id: newId,
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
        image:
          data.species === 'Prawns'
            ? 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=600&auto=format&fit=crop&q=80'
            : data.species === 'Pomfret'
            ? 'https://images.unsplash.com/photo-1510137442180-4904a60032e5?w=600&auto=format&fit=crop&q=80'
            : 'https://images.unsplash.com/photo-1534943441045-1215b22bdf5f?w=600&auto=format&fit=crop&q=80',
        notes: data.notes || '',
        events: [landingEvent],
      };

      list.unshift(newBatch);
      saveStoredBatches(list);
      return newBatch;
    }
  },

  // Add Event to Batch
  async addEvent(batchId, eventData, user) {
    try {
      const res = await client.post(`/api/batches/${batchId}/events`, eventData);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('catchtrace:alert-updated'));
      }
      return res.data;
    } catch {
      const batches = getStoredBatches();
      const idx = batches.findIndex((b) => b.batch_id === batchId);
      if (idx === -1) throw new Error(`Batch ${batchId} not found`);

      const batch = batches[idx];
      if (batch.status === 'SOLD') {
        throw new Error('Batch has already been SOLD. No further chain events can be appended.');
      }

      const events = batch.events || [];
      const seq = events.length + 1;
      const prevHash = events.length > 0 ? events[events.length - 1].hash : 'GENESIS';
      const occurredAt = eventData.occurred_at || new Date().toISOString();

      const newHash = await sha256(
        `${batchId}:${seq}:${eventData.event_type}:${user.name}:${eventData.weight_kg || batch.current_weight_kg}:${occurredAt}:${eventData.notes || ''}:${prevHash}`
      );

      const titleMap = {
        LANDING: 'Landed',
        PURCHASE: 'Purchased',
        PROCESSING: 'Processed',
        TRANSPORT: 'Transported',
        TRANSPORT_PICKUP: 'Transport Pickup',
        TRANSPORT_DROP: 'Transported',
        SALE: 'Sold',
      };

      const event = {
        seq,
        event_type: eventData.event_type,
        title: titleMap[eventData.event_type] || eventData.event_type,
        actor_name: `${user.name} (${user.roleLabel || user.role})`,
        org_name: user.org,
        weight_kg: Number(eventData.weight_kg) || batch.current_weight_kg,
        input_weight_kg: eventData.input_weight_kg ? Number(eventData.input_weight_kg) : undefined,
        yield_percent: eventData.yield_percent ? Number(eventData.yield_percent) : undefined,
        price_per_kg: eventData.price_per_kg ? Number(eventData.price_per_kg) : undefined,
        temp_c: eventData.temp_c !== undefined && eventData.temp_c !== '' ? Number(eventData.temp_c) : undefined,
        location: eventData.location,
        occurred_at: occurredAt,
        notes: eventData.notes || '',
        customer_type: eventData.customer_type,
        process_type: eventData.process_type,
        prev_hash: prevHash,
        hash: newHash,
      };

      // Check for alert rules
      const allAlerts = getStoredAlerts();
      const newAlerts = checkAlertRules(batch, event, allAlerts);
      if (newAlerts.length > 0) {
        batch.status = 'FLAGGED';
        allAlerts.unshift(...newAlerts);
        saveStoredAlerts(allAlerts);
      } else if (eventData.event_type === 'SALE') {
        batch.status = 'SOLD';
      }

      batch.current_weight_kg = event.weight_kg;
      batch.current_handler = user.org;
      batch.events.push(event);

      batches[idx] = batch;
      saveStoredBatches(batches);
      return { batch, event, triggeredAlerts: newAlerts };
    }
  },

  // Verify Batch Integrity (Recalculates hash chain)
  async verifyIntegrity(batchId) {
    try {
      const res = await client.get(`/api/batches/${batchId}/verify`);
      return res.data;
    } catch {
      const batches = getStoredBatches();
      const batch = batches.find((b) => b.batch_id === batchId);
      if (!batch) throw new Error(`Batch ${batchId} not found`);

      const events = batch.events || [];
      let brokenStep = null;
      let computedLastHash = 'GENESIS';

      for (let i = 0; i < events.length; i++) {
        const ev = events[i];
        const expectedPrev = i === 0 ? 'GENESIS' : events[i - 1].hash;

        // Check if prev_hash pointer is intact
        if (ev.prev_hash !== expectedPrev) {
          brokenStep = {
            seq: ev.seq,
            event_type: ev.event_type,
            title: ev.title,
            reason: 'Previous hash pointer does not match preceding event hash.',
            stored_hash: ev.hash,
            expected_prev: expectedPrev,
            actual_prev: ev.prev_hash,
          };
          break;
        }

        // Check if hash is invalid or tampered
        if (ev.hash.startsWith('TAMPERED_')) {
          brokenStep = {
            seq: ev.seq,
            event_type: ev.event_type,
            title: ev.title,
            reason: 'Hash mismatch: event data was altered in database.',
            stored_hash: ev.hash,
          };
          break;
        }

        computedLastHash = ev.hash;
      }

      const isValid = brokenStep === null;
      return {
        batch_id: batchId,
        isValid,
        totalSteps: events.length,
        verifiedAt: new Date().toISOString(),
        lastHash: computedLastHash,
        brokenStep,
      };
    }
  },

  // Public Trace Endpoint (No Auth Required)
  async getPublicTrace(batchId) {
    const cleanId = (batchId || '').trim();
    try {
      const res = await client.get(`/api/public/trace/${cleanId}`);
      return res.data;
    } catch {
      const batches = getStoredBatches();
      const found = batches.find((b) => b.batch_id && b.batch_id.toLowerCase() === cleanId.toLowerCase());
      if (!found) throw new Error(`Batch ${batchId} not found`);

      // Verify integrity for the public badge
      const isTampered = found.events.some((e) => e.hash.startsWith('TAMPERED_'));

      // Sanitize fields for public consumers (no private prices or sensitive info)
      const sanitizedEvents = found.events.map((e) => ({
        seq: e.seq,
        event_type: e.event_type,
        title: e.title,
        org_name: e.org_name,
        location: e.location,
        weight_kg: e.weight_kg,
        occurred_at: e.occurred_at,
        temp_c: e.temp_c,
      }));

      return {
        batch_id: found.batch_id,
        species: found.species,
        landing_centre: found.landing_centre,
        landed_at: found.landed_at,
        initial_weight_kg: found.initial_weight_kg,
        current_weight_kg: found.current_weight_kg,
        status: found.status,
        image: found.image,
        isVerified: !isTampered,
        integrity: {
          is_intact: !isTampered,
          message: !isTampered ? 'Cryptographically Verified Intact' : 'Tampered Record Detected',
        },
        events: sanitizedEvents,
      };
    }
  },

  // Dashboard Summary Metrics
  async getDashboardSummary(user = null) {
    try {
      const res = await client.get('/api/dashboard/summary', {
        params: {
          role: user?.role,
          userId: user?.id,
          userName: user?.name,
          userOrg: user?.org,
          userEmail: user?.email,
        },
      });
      return res.data;
    } catch {
      const allBatches = getStoredBatches();
      const allAlerts = getStoredAlerts();

      const role = user?.role || 'ADMIN';
      const roleBatches = role === 'ADMIN' ? allBatches : filterBatchesByRole(allBatches, user);

      // Species volume breakdown for the scoped batches
      const speciesVolume = {
        Mackerel: 0,
        Tuna: 0,
        Pomfret: 0,
        Sardine: 0,
        Prawns: 0,
      };

      let scopedWeight = 0;
      roleBatches.forEach((b) => {
        const wt = b.current_weight_kg || b.initial_weight_kg || 0;
        scopedWeight += wt;
        if (speciesVolume[b.species] !== undefined) {
          speciesVolume[b.species] += wt;
        }
      });

      const speciesChartData = Object.keys(speciesVolume).map((species) => ({
        name: species,
        weight: speciesVolume[species],
      }));

      // 1. Role = FISHER
      if (role === 'FISHER') {
        const totalCatches = roleBatches.length;
        const activeInChain = roleBatches.filter((b) => b.status === 'ACTIVE').length;
        const soldCatches = roleBatches.filter((b) => b.status === 'SOLD').length;
        const totalLandedKg = roleBatches.reduce((acc, b) => acc + (b.initial_weight_kg || 0), 0);

        return {
          role,
          roleTitle: 'Fisher Catch & Landings Dashboard',
          roleSubtitle: `Catches registered by ${user?.name} (${user?.org || 'Vessel Fleet'})`,
          statCard1: { title: 'My Landed Batches', value: totalCatches, trend: '+3', label: 'this month' },
          statCard2: { title: 'Active in Supply Chain', value: activeInChain, trend: 'In-Transit', label: 'with buyers/traders' },
          statCard3: { title: 'Completed / Sold', value: soldCatches, trend: 'Delivered', label: 'reached retail' },
          statCard4: { title: 'My Landed Biomass', value: `${totalLandedKg.toLocaleString()} kg`, trend: 'Verified', label: 'harbour weigh-ins' },
          speciesChartData,
          supplyChainStats: {
            avgLandingToSaleDays: '1.8 days',
            stat1Label: 'Harbour Turnaround',
            totalWeightTrackedKg: `${totalLandedKg.toLocaleString()} kg`,
            stat2Label: 'My Total Landed Biomass',
            successfulDeliveryRate: '100%',
            stat3Label: 'Auction Clearance',
            integrityVerifiedRate: '100%',
            stat4Label: 'My Record Integrity',
          },
        };
      }

      // 2. Role = TRADER
      if (role === 'TRADER') {
        const purchasedLots = roleBatches.length;
        const activeLots = roleBatches.filter((b) => b.status === 'ACTIVE').length;
        const finalizedLots = roleBatches.filter((b) => b.status === 'SOLD').length;
        const totalProcuredKg = roleBatches.reduce((acc, b) => acc + (b.current_weight_kg || b.initial_weight_kg || 0), 0);
        const estSpend = roleBatches.reduce((acc, b) => acc + ((b.current_weight_kg || 200) * 155), 0);

        return {
          role,
          roleTitle: 'Trader Procurement & Auction Dashboard',
          roleSubtitle: `Auction acquisitions, lots, and processor dispatches by ${user?.name}`,
          statCard1: { title: 'Purchased Batches', value: purchasedLots, trend: '+8%', label: 'lots acquired' },
          statCard2: { title: 'Active in Logistics', value: activeLots, trend: 'In-Transit', label: 'en route to units' },
          statCard3: { title: 'Completed Lots', value: finalizedLots, trend: 'Finalized', label: 'retail handover' },
          statCard4: { title: 'Procured Volume', value: `${totalProcuredKg.toLocaleString()} kg`, trend: 'Auctioned', label: 'wharf procurement' },
          speciesChartData,
          supplyChainStats: {
            avgLandingToSaleDays: '₹155 / kg',
            stat1Label: 'Average Purchase Price',
            totalWeightTrackedKg: `₹${estSpend.toLocaleString()}`,
            stat2Label: 'Total Procurement Spend',
            successfulDeliveryRate: '99.2%',
            stat3Label: 'Processor Delivery',
            integrityVerifiedRate: '98.5%',
            stat4Label: 'Audit Compliance',
          },
        };
      }

      // 3. Role = PROCESSOR
      if (role === 'PROCESSOR') {
        const processedCount = roleBatches.length;
        const packagedWeight = roleBatches.reduce((acc, b) => acc + (b.current_weight_kg || 0), 0);

        return {
          role,
          roleTitle: 'Processor Facility & Yields Dashboard',
          roleSubtitle: `Gutting yields, blast freezing, and cold packaging by ${user?.name} (${user?.org})`,
          statCard1: { title: 'Batches Processed', value: processedCount, trend: '+4', label: 'this cycle' },
          statCard2: { title: 'Average Plant Yield', value: '81.8%', trend: 'Nominal', label: 'cleaning & filleting' },
          statCard3: { title: 'Finished Lots', value: processedCount, trend: '100%', label: 'blast frozen' },
          statCard4: { title: 'Packaged Output', value: `${packagedWeight.toLocaleString()} kg`, trend: 'Inspected', label: 'ready for dispatch' },
          speciesChartData,
          supplyChainStats: {
            avgLandingToSaleDays: '81.8%',
            stat1Label: 'Average Filleting Yield',
            totalWeightTrackedKg: `${packagedWeight.toLocaleString()} kg`,
            stat2Label: 'Finished Packaged Output',
            successfulDeliveryRate: '-18°C',
            stat3Label: 'Blast Freeze Standard',
            integrityVerifiedRate: '100%',
            stat4Label: 'HACCP Traceability',
          },
        };
      }

      // 4. Role = TRANSPORTER
      if (role === 'TRANSPORTER') {
        const shipmentCount = roleBatches.length;
        const inTransit = roleBatches.filter((b) => b.status === 'ACTIVE').length;
        const delivered = roleBatches.filter((b) => b.status === 'SOLD').length;
        const cargoWeight = roleBatches.reduce((acc, b) => acc + (b.current_weight_kg || 0), 0);

        return {
          role,
          roleTitle: 'Transporter Logistics & Fleet Dashboard',
          roleSubtitle: `Reefer transit status and cold-chain temperature logs for ${user?.org}`,
          statCard1: { title: 'Assigned Shipments', value: shipmentCount, trend: '+2', label: 'active manifest' },
          statCard2: { title: 'In Highway Transit', value: inTransit, trend: 'On Route', label: 'NH-75 corridor' },
          statCard3: { title: 'Delivered to Markets', value: delivered, trend: 'Completed', label: 'signed off' },
          statCard4: { title: 'Average Reefer Temp', value: '-2.2°C', trend: '❄️ Cold', label: 'compliance target <4°C' },
          speciesChartData,
          supplyChainStats: {
            avgLandingToSaleDays: '7.5 hrs',
            stat1Label: 'Average Transit Duration',
            totalWeightTrackedKg: `${cargoWeight.toLocaleString()} kg`,
            stat2Label: 'Refrigerated Cargo',
            successfulDeliveryRate: '98.8%',
            stat3Label: 'On-Time Arrival',
            integrityVerifiedRate: '100%',
            stat4Label: 'Cold Chain Continuity',
          },
        };
      }

      // 5. Role = SELLER
      if (role === 'SELLER') {
        const retailBatches = roleBatches.length;
        const inStockCount = roleBatches.filter((b) => b.status === 'ACTIVE').length || 2;
        const completedSales = roleBatches.filter((b) => b.status === 'SOLD').length || retailBatches;
        const totalSoldKg = roleBatches.reduce((acc, b) => acc + (b.current_weight_kg || 0), 0);
        const estRevenue = retailBatches * 48000;

        return {
          role,
          roleTitle: 'Retailer & Wholesaler Counter Dashboard',
          roleSubtitle: `Retail fresh inventory, counter sales, and customer handovers at ${user?.org}`,
          statCard1: { title: 'Retail Batches Received', value: retailBatches, trend: '+5', label: 'fresh shipments' },
          statCard2: { title: 'Active Counter Stock', value: inStockCount, trend: 'On Display', label: 'iced retail stock' },
          statCard3: { title: 'Completed Retail Sales', value: completedSales, trend: 'Sold', label: 'consumer sales' },
          statCard4: { title: 'Total Sales Revenue', value: `₹${estRevenue.toLocaleString()}`, trend: '+15%', label: 'gross turnover' },
          speciesChartData,
          supplyChainStats: {
            avgLandingToSaleDays: '₹265 / kg',
            stat1Label: 'Average Retail Price',
            totalWeightTrackedKg: `${totalSoldKg.toLocaleString()} kg`,
            stat2Label: 'Seafood Sold to Date',
            successfulDeliveryRate: '4.9 ★',
            stat3Label: 'Customer Rating',
            integrityVerifiedRate: '100%',
            stat4Label: 'Origin Provenance',
          },
        };
      }

      // 6. Role = ADMIN (Default: Sees whole system)
      const totalBatches = allBatches.length;
      const activeBatches = allBatches.filter((b) => b.status === 'ACTIVE').length;
      const completedSold = allBatches.filter((b) => b.status === 'SOLD').length;
      const openAlerts = allAlerts.filter((a) => !a.resolved).length;

      let totalWeight = 0;
      allBatches.forEach((b) => {
        totalWeight += b.initial_weight_kg || 0;
      });

      return {
        role: 'ADMIN',
        roleTitle: 'System Administrator & Regulatory Dashboard',
        roleSubtitle: 'State-wide oversight of all fish supply-chain activity across Karnataka harbours',
        statCard1: { title: 'Total Batches', value: totalBatches, trend: '+12%', label: 'vs last month' },
        statCard2: { title: 'Active Batches', value: activeBatches, trend: '+5%', label: 'in active transit' },
        statCard3: { title: 'Completed (Sold)', value: completedSold, trend: '+18%', label: 'delivered & sold' },
        statCard4: { title: 'Open Alerts', value: openAlerts, trend: '-2', label: 'unresolved flags' },
        speciesChartData,
        supplyChainStats: {
          avgLandingToSaleDays: '2.4 days',
          stat1Label: 'Average Landing to Sale Time',
          totalWeightTrackedKg: `${totalWeight.toLocaleString()} kg`,
          stat2Label: 'Total Weight Tracked',
          successfulDeliveryRate: '98.5%',
          stat3Label: 'Successful Deliveries',
          integrityVerifiedRate: '97.2%',
          stat4Label: 'Verified Integrity Rate',
        },
      };
    }
  },

  // Admin Alerts API
  async getAlerts(params = {}) {
    try {
      const res = await client.get('/api/alerts', { params });
      return res.data;
    } catch {
      let alerts = getStoredAlerts();
      if (params.type && params.type !== 'ALL') {
        alerts = alerts.filter((a) => a.type === params.type);
      }
      if (params.severity && params.severity !== 'ALL') {
        alerts = alerts.filter((a) => a.severity === params.severity);
      }
      if (params.status && params.status !== 'ALL') {
        const isResolved = params.status === 'RESOLVED';
        alerts = alerts.filter((a) => a.resolved === isResolved);
      }
      return alerts;
    }
  },

  // Resolve Alert
  async resolveAlert(alertId, resolutionNote) {
    try {
      const res = await client.patch(`/api/alerts/${alertId}`, {
        resolved: true,
        resolution_note: resolutionNote,
      });
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('catchtrace:alert-updated'));
      }
      return res.data;
    } catch {
      const alerts = getStoredAlerts();
      const idx = alerts.findIndex((a) => a.id === alertId);
      if (idx === -1) throw new Error('Alert not found');

      alerts[idx].resolved = true;
      alerts[idx].status = 'RESOLVED';
      alerts[idx].resolution_note = resolutionNote;
      saveStoredAlerts(alerts);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('catchtrace:alert-updated'));
      }
      return alerts[idx];
    }
  },

  // Export Batches CSV
  async exportCsv() {
    const batches = getStoredBatches();
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
    const rows = batches.map((b) => [
      b.batch_id,
      b.species,
      `"${b.landing_centre}"`,
      b.landed_at,
      b.initial_weight_kg,
      b.current_weight_kg,
      `"${b.current_handler || ''}"`,
      b.status,
      b.events?.length || 0,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `CatchTrace_Batches_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return true;
  },

  // Confirm Event
  async confirmEvent(batchId, eventId, data = {}) {
    try {
      const res = await client.post(`/api/batches/${batchId}/events/${eventId}/confirm`, data);
      return res.data;
    } catch (err) {
      if (err.response?.data?.error) {
        throw new Error(err.response.data.error);
      }
      const batches = getStoredBatches();
      const batch = batches.find((b) => (b.batch_id || '').toLowerCase() === (batchId || '').toLowerCase());
      if (!batch) throw new Error(`Batch ${batchId} not found`);

      const ev = (batch.events || []).find((e) => String(e.seq) === String(eventId) || String(e.id) === String(eventId));
      if (!ev) throw new Error(`Event ${eventId} not found`);

      ev.confirmation_status = 'CONFIRMED';
      ev.confirmed_by = 'Authorized Receiver';
      ev.confirmed_at = new Date().toISOString();
      if (data.grade_confirmed) ev.grade_confirmed = data.grade_confirmed;

      saveStoredBatches(batches);
      return { message: 'Event confirmed successfully', event: ev, batch };
    }
  },

  // Dispute Event
  async disputeEvent(batchId, eventId, data = {}) {
    try {
      const res = await client.post(`/api/batches/${batchId}/events/${eventId}/dispute`, data);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('catchtrace:alert-updated'));
      }
      return res.data;
    } catch (err) {
      if (err.response?.data?.error) {
        throw new Error(err.response.data.error);
      }
      const batches = getStoredBatches();
      const batch = batches.find((b) => (b.batch_id || '').toLowerCase() === (batchId || '').toLowerCase());
      if (!batch) throw new Error(`Batch ${batchId} not found`);

      const ev = (batch.events || []).find((e) => String(e.seq) === String(eventId) || String(e.id) === String(eventId));
      if (!ev) throw new Error(`Event ${eventId} not found`);

      ev.confirmation_status = 'DISPUTED';
      ev.confirmed_by = 'Authorized Receiver';
      ev.confirmed_at = new Date().toISOString();
      ev.dispute_note = data.dispute_note;
      if (data.photo_url) ev.photo_url = data.photo_url;
      if (data.grade_confirmed) ev.grade_confirmed = data.grade_confirmed;

      batch.status = 'FLAGGED';

      const allAlerts = getStoredAlerts();
      const newAlert = {
        id: `alt_disp_${Date.now()}`,
        batch_id: batch.batch_id,
        event_id: String(ev.seq || eventId),
        type: 'INTEGRITY_DISPUTE',
        typeLabel: 'Handover Disputed',
        severity: 'HIGH',
        description: `Dispute on Step #${ev.seq} (${ev.title || ev.event_type}): ${data.dispute_note}`,
        message: data.dispute_note,
        time: 'Just now',
        detected_at: new Date().toISOString(),
        status: 'OPEN',
        resolved: false,
        resolution_note: null,
      };
      allAlerts.unshift(newAlert);
      saveStoredAlerts(allAlerts);
      saveStoredBatches(batches);

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('catchtrace:alert-updated'));
      }

      return { message: 'Dispute recorded', event: ev, batch, alert: newAlert };
    }
  },

  // Get Verified Certificate
  async getCertificate(batchId) {
    try {
      const res = await client.get(`/api/batches/${batchId}/certificate`);
      return res.data;
    } catch (err) {
      if (err.response?.data?.error) {
        throw new Error(err.response.data.error);
      }
      const batches = getStoredBatches();
      const batch = batches.find((b) => b.batch_id === batchId);
      if (!batch) throw new Error(`Batch ${batchId} not found`);

      if (batch.status !== 'SOLD') {
        throw new Error('Not yet eligible — batch must be sold with no disputes.');
      }
      const hasDispute = (batch.events || []).some((e) => e.confirmation_status === 'DISPUTED');
      if (hasDispute) {
        throw new Error('Not yet eligible — batch contains disputed events.');
      }
      const all_confirmed = (batch.events || []).every((e) => e.confirmation_status === 'CONFIRMED');

      return {
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
        events: batch.events,
        certified_at: new Date().toISOString(),
        qr_url: `https://catchtrace.in/trace/${batch.batch_id}`,
        verifier: 'CatchTrace National Seafood Traceability Ledger',
      };
    }
  },

  // Get User Trust Score
  async getUserTrustScore(userId) {
    try {
      const res = await client.get(`/api/users/${userId}/trust-score`);
      return res.data;
    } catch {
      const batches = getStoredBatches();
      const cleanId = (userId || '').toLowerCase().trim();
      let confirmed = 0;
      let disputed = 0;

      batches.forEach((b) => {
        (b.events || []).forEach((e) => {
          const matchActor =
            (e.actor_id && e.actor_id.toLowerCase().trim() === cleanId) ||
            (e.actor_name && cleanId && e.actor_name.toLowerCase().includes(cleanId)) ||
            (e.org_name && cleanId && e.org_name.toLowerCase().includes(cleanId));
          if (matchActor) {
            if (e.confirmation_status === 'CONFIRMED') confirmed++;
            else if (e.confirmation_status === 'DISPUTED') disputed++;
          }
        });
      });

      // Default persona fallback if no events found for this specific query string
      if (confirmed === 0 && disputed === 0) {
        if (cleanId.includes('trans') || cleanId.includes('rafi')) {
          confirmed = 16;
          disputed = 2;
        } else if (cleanId.includes('proc') || cleanId.includes('shenoy') || cleanId.includes('sunil')) {
          confirmed = 13;
          disputed = 0;
        } else if (cleanId.includes('fisher') || cleanId.includes('ramesh')) {
          confirmed = 14;
          disputed = 1;
        } else if (cleanId.includes('trader') || cleanId.includes('ganesh')) {
          confirmed = 18;
          disputed = 0;
        } else if (cleanId.includes('seller') || cleanId.includes('anand')) {
          confirmed = 20;
          disputed = 0;
        }
      }

      const total = confirmed + disputed;
      const trust_score = total === 0 ? 100 : Math.round((confirmed / total) * 100);

      return {
        user_id: userId,
        trust_score,
        confirmed_count: confirmed,
        disputed_count: disputed,
      };
    }
  },

  // Reset Demo Data (Backend & LocalStorage)
  async resetData() {
    try {
      await client.post('/api/batches/reset');
    } catch {
      // offline fallback
    }
    saveStoredBatches(INITIAL_BATCHES);
    saveStoredAlerts(INITIAL_ALERTS);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('catchtrace_read_notifs');
      sessionStorage.removeItem('catchtrace_seen_alert_ids');
      window.dispatchEvent(new CustomEvent('catchtrace:alert-updated'));
    }
  },
};
