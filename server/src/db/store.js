import { computeEventHash } from '../services/hashChain.js';

// Helper to compute user trust score dynamically
export function computeUserTrustScore(user) {
  if (!user) return { trust_score: 100, confirmed_count: 0, disputed_count: 0 };
  const confirmed = user.confirmed_count || 0;
  const disputed = user.disputed_count || 0;
  const total = confirmed + disputed;
  const trust_score = total === 0 ? 100 : Math.round((confirmed / total) * 100);
  return {
    trust_score,
    confirmed_count: confirmed,
    disputed_count: disputed,
  };
}

// Pre-seeded Demo Accounts
export const USERS = {
  FISHER: {
    id: 'usr_fisher_01',
    pin: '1111',
    name: 'Ramesh Naik',
    email: 'ramesh.fisher@gmail.com',
    role: 'FISHER',
    roleLabel: 'Fisher',
    org: 'Sea Queen Trawlers',
    location: 'Mangaluru Harbour',
    confirmed_count: 14,
    disputed_count: 1,
  },
  TRADER: {
    id: 'usr_trader_01',
    pin: '2222',
    name: 'Ganesh Pai',
    email: 'ganesh.trader@gmail.com',
    role: 'TRADER',
    roleLabel: 'Trader',
    org: 'Coastal Traders & Auctions',
    location: 'Mangaluru Auction Yard',
    confirmed_count: 18,
    disputed_count: 0,
  },
  PROCESSOR: {
    id: 'usr_proc_01',
    pin: '3333',
    name: 'Sunil Shenoy',
    email: 'sunil.processor@gmail.com',
    role: 'PROCESSOR',
    roleLabel: 'Processor',
    org: 'Coastal Foods Pvt Ltd',
    location: 'Baikampady Industrial Estate',
    confirmed_count: 12,
    disputed_count: 0,
  },
  TRANSPORTER: {
    id: 'usr_trans_01',
    pin: '4444',
    name: 'Mohammed Rafi',
    email: 'rafi.logistics@gmail.com',
    role: 'TRANSPORTER',
    roleLabel: 'Transporter',
    org: 'Express Cold Logistics',
    location: 'NH 75 Mangaluru-Bengaluru',
    confirmed_count: 15,
    disputed_count: 2,
  },
  SELLER: {
    id: 'usr_seller_01',
    pin: '5555',
    name: 'Anand Kumar',
    email: 'anand.seafood@gmail.com',
    role: 'SELLER',
    roleLabel: 'Seller / Vendor',
    org: 'Ocean Fresh Seafood Market',
    location: 'Bengaluru Wholesale Market',
    confirmed_count: 20,
    disputed_count: 0,
  },
  ADMIN: {
    id: 'usr_admin_01',
    pin: '9999',
    name: 'Dr. K. V. Adiga',
    email: 'adiga.fisheries@gmail.com',
    role: 'ADMIN',
    roleLabel: 'System Administrator',
    org: 'Karnataka Fisheries Dept',
    location: 'Mangaluru Regional Office',
    confirmed_count: 0,
    disputed_count: 0,
  },
};

// Batches In-Memory DB
export let BATCHES = [
  {
    batch_id: 'FB-20261028-0001',
    species: 'Mackerel',
    landing_centre: 'Mangaluru Harbour',
    landed_at: '2026-10-28T06:30:00Z',
    initial_weight_kg: 250,
    current_weight_kg: 175,
    boat_name: 'Sea Queen',
    operator_name: 'Ramesh Naik',
    current_handler: 'Ocean Fresh Seafood Market',
    status: 'SOLD',
    created_at: '2026-10-28T06:30:00Z',
    image: 'https://images.unsplash.com/photo-1534943441045-1215b22bdf5f?w=600&auto=format&fit=crop&q=80',
    notes: 'Premium Indian mackerel, fresh ice stored directly on trawler.',
    events: [
      {
        seq: 1,
        event_type: 'LANDING',
        title: 'Landed',
        actor_id: 'usr_fisher_01',
        actor_name: 'Ramesh Naik (Fisher)',
        org_name: 'Sea Queen Trawlers',
        weight_kg: 250,
        temp_c: 2.5,
        location: 'Mangaluru Harbour, Berth 4',
        occurred_at: '2026-10-28T06:30:00Z',
        notes: 'Landing inspected by harbour officer, grade A catch',
        grade_claimed: 'A',
        grade_confirmed: 'A',
        confirmation_status: 'CONFIRMED',
        confirmed_by: 'usr_trader_01',
        confirmed_at: '2026-10-28T10:15:00Z',
        prev_hash: 'GENESIS',
        hash: 'e83a910bf32a9a7d3c90e0c90f23ba5b4c4e7d8a9b0c1d2e3f4a5b6c7d8e9f01'
      },
      {
        seq: 2,
        event_type: 'PURCHASE',
        title: 'Purchased',
        actor_id: 'usr_trader_01',
        actor_name: 'Ganesh Pai (Trader)',
        org_name: 'Coastal Traders & Auctions',
        weight_kg: 240,
        price_per_kg: 150,
        temp_c: 3.0,
        location: 'Mangaluru Auction Yard',
        occurred_at: '2026-10-28T10:15:00Z',
        notes: 'Auction batch #44, purchased for Coastal Foods processing',
        grade_claimed: 'A',
        grade_confirmed: 'A',
        confirmation_status: 'CONFIRMED',
        confirmed_by: 'usr_proc_01',
        confirmed_at: '2026-10-28T18:30:00Z',
        prev_hash: 'e83a910bf32a9a7d3c90e0c90f23ba5b4c4e7d8a9b0c1d2e3f4a5b6c7d8e9f01',
        hash: 'b4a92c01d4e7f8a9b0c1d2e3f4a5b6c7d8e9f01a2b3c4d5e6f7a8b9c0d1e2f3a'
      },
      {
        seq: 3,
        event_type: 'PROCESSING',
        title: 'Processed',
        actor_id: 'usr_proc_01',
        actor_name: 'Sunil Shenoy (Processor)',
        org_name: 'Coastal Foods Pvt Ltd',
        weight_kg: 180,
        input_weight_kg: 220,
        yield_percent: 81.8,
        process_type: 'Cleaning & Packing',
        temp_c: -1.0,
        location: 'Baikampady Industrial Estate, Unit 2',
        occurred_at: '2026-10-28T18:30:00Z',
        notes: 'Gutted, headless, blast-frozen in insulated boxes',
        grade_claimed: 'A',
        grade_confirmed: 'A',
        confirmation_status: 'CONFIRMED',
        confirmed_by: 'usr_trans_01',
        confirmed_at: '2026-10-29T06:00:00Z',
        prev_hash: 'b4a92c01d4e7f8a9b0c1d2e3f4a5b6c7d8e9f01a2b3c4d5e6f7a8b9c0d1e2f3a',
        hash: 'c5b81a74d2e9f01a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a'
      },
      {
        seq: 4,
        event_type: 'TRANSPORT_DROP',
        title: 'Transported',
        actor_id: 'usr_trans_01',
        actor_name: 'Mohammed Rafi (Transporter)',
        org_name: 'Express Cold Logistics',
        weight_kg: 180,
        temp_c: -2.5,
        location: 'Mangaluru → Bengaluru Wholesale Market',
        occurred_at: '2026-10-29T06:00:00Z',
        notes: 'Refrigerated container truck KA-19-B-8821, route temp monitored',
        grade_claimed: 'A',
        grade_confirmed: 'A',
        confirmation_status: 'CONFIRMED',
        confirmed_by: 'usr_seller_01',
        confirmed_at: '2026-10-29T12:30:00Z',
        prev_hash: 'c5b81a74d2e9f01a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a',
        hash: 'd6a70e83b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8'
      },
      {
        seq: 5,
        event_type: 'SALE',
        title: 'Sold',
        actor_id: 'usr_seller_01',
        actor_name: 'Anand Kumar (Seller)',
        org_name: 'Ocean Fresh Seafood Market',
        weight_kg: 175,
        price_per_kg: 280,
        customer_type: 'Retailer / Supermarket',
        location: 'Bengaluru Wholesale Fish Market, Stall 14',
        occurred_at: '2026-10-29T12:30:00Z',
        notes: 'Final batch retail sale to organic grocers. Batch completed.',
        grade_claimed: 'A',
        grade_confirmed: 'A',
        confirmation_status: 'CONFIRMED',
        confirmed_by: 'usr_admin_01',
        confirmed_at: '2026-10-29T13:00:00Z',
        prev_hash: 'd6a70e83b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8',
        hash: '4f3a9c27b0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7'
      }
    ]
  },
  {
    batch_id: 'FB-20261028-0008',
    species: 'Tuna',
    landing_centre: 'Karwar Harbour',
    landed_at: '2026-10-26T05:00:00Z',
    initial_weight_kg: 520,
    current_weight_kg: 505,
    boat_name: 'Blue Fin I',
    operator_name: 'Prakash Harikantra',
    current_handler: 'Karwar Cold Store',
    status: 'FLAGGED',
    created_at: '2026-10-26T05:00:00Z',
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&auto=format&fit=crop&q=80',
    notes: 'Yellowfin tuna caught off Karwar shelf. Flagged: 48h delay between landing and purchase.',
    events: [
      {
        seq: 1,
        event_type: 'LANDING',
        title: 'Landed',
        actor_id: 'usr_fisher_01',
        actor_name: 'Prakash Harikantra',
        org_name: 'Karwar Marine Co-op',
        weight_kg: 520,
        temp_c: 4.1,
        location: 'Karwar Baithkol Port',
        occurred_at: '2026-10-26T05:00:00Z',
        notes: 'Initial weigh-in completed.',
        grade_claimed: 'A',
        confirmation_status: 'PENDING',
        prev_hash: 'GENESIS',
        hash: '2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a'
      }
    ]
  },
  {
    batch_id: 'FB-20261028-0011',
    species: 'Prawns',
    landing_centre: 'Mangaluru Harbour',
    landed_at: '2026-10-27T04:30:00Z',
    initial_weight_kg: 310,
    current_weight_kg: 220,
    boat_name: 'Nethravathi Star',
    operator_name: 'Ravi Salian',
    current_handler: 'Coastal Foods Pvt Ltd',
    status: 'FLAGGED',
    created_at: '2026-10-27T04:30:00Z',
    image: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=600&auto=format&fit=crop&q=80',
    notes: 'Tiger prawns. INTEGRITY TAMPERED: Database hash mismatch at step #2.',
    events: [
      {
        seq: 1,
        event_type: 'LANDING',
        title: 'Landed',
        actor_id: 'usr_fisher_01',
        actor_name: 'Ravi Salian',
        org_name: 'Mangaluru Trawler Association',
        weight_kg: 310,
        temp_c: 2.1,
        location: 'Mangaluru Old Port',
        occurred_at: '2026-10-27T04:30:00Z',
        notes: 'Landed on ice',
        grade_claimed: 'A',
        grade_confirmed: 'A',
        confirmation_status: 'CONFIRMED',
        confirmed_by: 'usr_trader_01',
        confirmed_at: '2026-10-27T07:30:00Z',
        prev_hash: 'GENESIS',
        hash: '4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c'
      },
      {
        seq: 2,
        event_type: 'PURCHASE',
        title: 'Purchased (Tampered in DB)',
        actor_id: 'usr_trader_01',
        actor_name: 'Ganesh Pai',
        org_name: 'Coastal Traders',
        weight_kg: 295,
        price_per_kg: 620,
        temp_c: 2.5,
        location: 'Mangaluru Auction Yard',
        occurred_at: '2026-10-27T08:00:00Z',
        notes: 'Price was maliciously manipulated from 480 to 620',
        grade_claimed: 'A',
        grade_confirmed: 'C',
        confirmation_status: 'DISPUTED',
        confirmed_by: 'usr_proc_01',
        confirmed_at: '2026-10-27T08:30:00Z',
        dispute_note: 'Audit discrepancy: price and weight manipulated in auction ledger',
        prev_hash: '4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c',
        hash: 'TAMPERED_INVALID_HASH_CORRUPTED_ENTRY_0000000000000000000000000000'
      }
    ]
  },
  {
    batch_id: 'FB-20261028-0015',
    species: 'Pomfret',
    landing_centre: 'Malpe Harbour',
    landed_at: '2026-10-27T09:00:00Z',
    initial_weight_kg: 300,
    current_weight_kg: 200,
    boat_name: 'Kadal Kanya',
    operator_name: 'Suresh Bangera',
    current_handler: 'Express Cold Logistics',
    status: 'FLAGGED',
    created_at: '2026-10-27T09:00:00Z',
    image: 'https://images.unsplash.com/photo-1510137442180-4904a60032e5?w=600&auto=format&fit=crop&q=80',
    notes: 'Black pomfret. Weight loss alert: 32% loss between landing and purchase!',
    events: [
      {
        seq: 1,
        event_type: 'LANDING',
        title: 'Landed',
        actor_name: 'Suresh Bangera',
        org_name: 'Malpe Fishermen Association',
        weight_kg: 300,
        temp_c: 3.0,
        location: 'Malpe Harbour',
        occurred_at: '2026-10-27T09:00:00Z',
        notes: 'Landed weight 300 kg measured on weighbridge',
        prev_hash: 'GENESIS',
        hash: '6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e'
      }
    ]
  }
];

// Seed remaining batches up to 35
const SPECIES_LIST = ['Mackerel', 'Sardine', 'Pomfret', 'Tuna', 'Prawns'];
const HARBOURS = ['Mangaluru Harbour', 'Malpe Harbour', 'Karwar Harbour'];
const BOATS = ['Sea Queen', 'Matsya Prabha', 'Ocean Hunter', 'Blue Fin I', 'Nethravathi Star', 'Kadal Kanya', 'Sagar Ratna'];
const FISHERS = ['Ramesh Naik', 'Shekhar Kunder', 'Devadas Amin', 'Prakash Harikantra', 'Ravi Salian', 'Suresh Bangera'];

for (let i = 16; i <= 40; i++) {
  const numStr = i.toString().padStart(4, '0');
  const species = SPECIES_LIST[i % SPECIES_LIST.length];
  const harbour = HARBOURS[i % HARBOURS.length];
  const boat = BOATS[i % BOATS.length];
  const fisher = FISHERS[i % FISHERS.length];
  const initialWeight = 160 + ((i * 19) % 320);
  const isSold = i % 3 === 0;

  BATCHES.push({
    batch_id: `FB-20261028-${numStr}`,
    species,
    landing_centre: harbour,
    landed_at: `2026-10-28T06:00:00Z`,
    initial_weight_kg: initialWeight,
    current_weight_kg: isSold ? Math.round(initialWeight * 0.75) : initialWeight,
    boat_name: boat,
    operator_name: fisher,
    current_handler: isSold ? 'Ocean Fresh Seafood Market' : 'Coastal Logistics',
    status: isSold ? 'SOLD' : 'ACTIVE',
    created_at: `2026-10-28T06:00:00Z`,
    image: 'https://images.unsplash.com/photo-1534943441045-1215b22bdf5f?w=600&auto=format&fit=crop&q=80',
    notes: `Catch registered at ${harbour}`,
    events: [
      {
        seq: 1,
        event_type: 'LANDING',
        title: 'Landed',
        actor_id: 'usr_fisher_01',
        actor_name: `${fisher} (Fisher)`,
        org_name: `${boat} Fleet`,
        weight_kg: initialWeight,
        temp_c: 2.2,
        location: harbour,
        occurred_at: '2026-10-28T06:30:00Z',
        notes: 'Landing inspected',
        grade_claimed: 'A',
        confirmation_status: isSold ? 'CONFIRMED' : 'PENDING',
        confirmed_by: isSold ? 'usr_trader_01' : null,
        confirmed_at: isSold ? '2026-10-28T09:00:00Z' : null,
        prev_hash: 'GENESIS',
        hash: `hash_gen_${numStr}`,
      }
    ]
  });
}

// Initial Alerts
export let ALERTS = [
  {
    id: 'alt_001',
    batch_id: 'FB-20261028-0015',
    type: 'WEIGHT_LOSS',
    typeLabel: 'Weight Loss (>20%)',
    description: 'Weight loss 32% (>20% threshold) between Landing and Purchase',
    time: '2h ago',
    detected_at: '2026-10-28T09:30:00Z',
    severity: 'HIGH',
    status: 'OPEN',
    resolved: false,
    resolution_note: null
  },
  {
    id: 'alt_002',
    batch_id: 'FB-20261028-0008',
    type: 'TIME_GAP',
    typeLabel: 'Long Delay (48h)',
    description: '3 days between steps (Landing to Purchase exceeds 6h threshold)',
    time: '5h ago',
    detected_at: '2026-10-28T06:00:00Z',
    severity: 'HIGH',
    status: 'OPEN',
    resolved: false,
    resolution_note: null
  },
  {
    id: 'alt_005',
    batch_id: 'FB-20261028-0011',
    type: 'INTEGRITY',
    typeLabel: 'Integrity Failure',
    description: 'Record tampering detected: Event #2 hash mismatch in database',
    time: '2d ago',
    detected_at: '2026-10-26T16:00:00Z',
    severity: 'HIGH',
    status: 'OPEN',
    resolved: false,
    resolution_note: null
  }
];

// Snapshot pristine initial seed data for demo reset capability
const ORIGINAL_BATCHES = JSON.parse(JSON.stringify(BATCHES));
const ORIGINAL_ALERTS = JSON.parse(JSON.stringify(ALERTS));

export function resetSeedData() {
  BATCHES.length = 0;
  BATCHES.push(...JSON.parse(JSON.stringify(ORIGINAL_BATCHES)));
  ALERTS.length = 0;
  ALERTS.push(...JSON.parse(JSON.stringify(ORIGINAL_ALERTS)));
  return true;
}
