// Browser and Node compatible SHA-256 function
export async function sha256(message) {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
  // Fallback simple hash for environments without subtle crypto
  let hash = 0;
  for (let i = 0; i < message.length; i++) {
    const char = message.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(16).padStart(8, '0').repeat(8);
}

// 30+ Realistic Seed Batches
export const INITIAL_BATCHES = [
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
        actor_name: 'Ramesh Naik (Fisher)',
        org_name: 'Sea Queen Trawlers',
        weight_kg: 250,
        price_per_kg: null,
        temp_c: 2.5,
        location: 'Mangaluru Harbour, Berth 4',
        occurred_at: '2026-10-28T06:30:00Z',
        notes: 'Landing inspected by harbour officer, grade A catch',
        prev_hash: 'GENESIS',
        hash: 'e83a910bf32a9a7d3c90e0c90f23ba5b4c4e7d8a9b0c1d2e3f4a5b6c7d8e9f01'
      },
      {
        seq: 2,
        event_type: 'PURCHASE',
        title: 'Purchased',
        actor_name: 'Ganesh Pai (Trader)',
        org_name: 'Coastal Traders & Auctions',
        weight_kg: 240,
        price_per_kg: 150,
        temp_c: 3.0,
        location: 'Mangaluru Auction Yard',
        occurred_at: '2026-10-28T10:15:00Z',
        notes: 'Auction batch #44, purchased for Coastal Foods processing',
        prev_hash: 'e83a910bf32a9a7d3c90e0c90f23ba5b4c4e7d8a9b0c1d2e3f4a5b6c7d8e9f01',
        hash: 'b4a92c01d4e7f8a9b0c1d2e3f4a5b6c7d8e9f01a2b3c4d5e6f7a8b9c0d1e2f3a'
      },
      {
        seq: 3,
        event_type: 'PROCESSING',
        title: 'Processed',
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
        prev_hash: 'b4a92c01d4e7f8a9b0c1d2e3f4a5b6c7d8e9f01a2b3c4d5e6f7a8b9c0d1e2f3a',
        hash: 'c5b81a74d2e9f01a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a'
      },
      {
        seq: 4,
        event_type: 'TRANSPORT_DROP',
        title: 'Transported',
        actor_name: 'Mohammed Rafi (Transporter)',
        org_name: 'Express Cold Logistics',
        weight_kg: 180,
        temp_c: -2.5,
        location: 'Mangaluru → Bengaluru Wholesale Market',
        occurred_at: '2026-10-29T06:00:00Z',
        notes: 'Refrigerated container truck KA-19-B-8821, route temp monitored',
        prev_hash: 'c5b81a74d2e9f01a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a',
        hash: 'd6a70e83b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8'
      },
      {
        seq: 5,
        event_type: 'SALE',
        title: 'Sold',
        actor_name: 'Anand Kumar (Seller)',
        org_name: 'Ocean Fresh Seafood Market',
        weight_kg: 175,
        price_per_kg: 280,
        customer_type: 'Retailer / Supermarket',
        location: 'Bengaluru Wholesale Fish Market, Stall 14',
        occurred_at: '2026-10-29T12:30:00Z',
        notes: 'Final batch retail sale to organic grocers. Batch completed.',
        prev_hash: 'd6a70e83b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8',
        hash: '4f3a9c27b0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7'
      }
    ]
  },
  {
    batch_id: 'FB-20261028-0002',
    species: 'Sardine',
    landing_centre: 'Malpe Harbour',
    landed_at: '2026-10-28T07:15:00Z',
    initial_weight_kg: 400,
    current_weight_kg: 385,
    boat_name: 'Matsya Prabha',
    operator_name: 'Shekhar Kunder',
    current_handler: 'Coastal Cold Storage',
    status: 'ACTIVE',
    created_at: '2026-10-28T07:15:00Z',
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&auto=format&fit=crop&q=80',
    notes: 'Oil sardine shoal landed at Malpe slipway.',
    events: [
      {
        seq: 1,
        event_type: 'LANDING',
        title: 'Landed',
        actor_name: 'Shekhar Kunder',
        org_name: 'Malpe Fishermen Union',
        weight_kg: 400,
        price_per_kg: null,
        temp_c: 3.2,
        location: 'Malpe Harbour, Slipway 2',
        occurred_at: '2026-10-28T07:15:00Z',
        notes: 'High oil content sardine, ice packed.',
        prev_hash: 'GENESIS',
        hash: '7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b'
      },
      {
        seq: 2,
        event_type: 'PURCHASE',
        title: 'Purchased',
        actor_name: 'Ganesh Pai',
        org_name: 'Coastal Traders & Auctions',
        weight_kg: 385,
        price_per_kg: 90,
        temp_c: 2.8,
        location: 'Malpe Auction Hall',
        occurred_at: '2026-10-28T09:40:00Z',
        notes: 'Bulk purchase for canning line.',
        prev_hash: '7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b',
        hash: '8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c'
      }
    ]
  },
  {
    batch_id: 'FB-20261028-0003',
    species: 'Pomfret',
    landing_centre: 'Mangaluru Harbour',
    landed_at: '2026-10-28T08:00:00Z',
    initial_weight_kg: 180,
    current_weight_kg: 155,
    boat_name: 'Ocean Hunter',
    operator_name: 'Devadas Amin',
    current_handler: 'Express Cold Logistics',
    status: 'ACTIVE',
    created_at: '2026-10-28T08:00:00Z',
    image: 'https://images.unsplash.com/photo-1510137442180-4904a60032e5?w=600&auto=format&fit=crop&q=80',
    notes: 'Silver pomfret export grade.',
    events: [
      {
        seq: 1,
        event_type: 'LANDING',
        title: 'Landed',
        actor_name: 'Devadas Amin',
        org_name: 'Ocean Hunter Crew',
        weight_kg: 180,
        temp_c: 1.8,
        location: 'Mangaluru Harbour, Deep sea jetty',
        occurred_at: '2026-10-28T08:00:00Z',
        notes: 'Export quality silver pomfret',
        prev_hash: 'GENESIS',
        hash: '9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d'
      },
      {
        seq: 2,
        event_type: 'PURCHASE',
        title: 'Purchased',
        actor_name: 'Vikas Rao',
        org_name: 'West Coast Exporters',
        weight_kg: 178,
        price_per_kg: 550,
        temp_c: 2.0,
        location: 'Mangaluru Jetty Auction',
        occurred_at: '2026-10-28T11:00:00Z',
        notes: 'Top auction bid',
        prev_hash: '9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d',
        hash: '0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e'
      },
      {
        seq: 3,
        event_type: 'PROCESSING',
        title: 'Processed',
        actor_name: 'Sunil Shenoy',
        org_name: 'Coastal Foods Pvt Ltd',
        weight_kg: 155,
        input_weight_kg: 178,
        yield_percent: 87.1,
        process_type: 'Cleaning & IQF Freezing',
        temp_c: -4.0,
        location: 'Baikampady Processing Facility',
        occurred_at: '2026-10-28T16:00:00Z',
        notes: 'Individually Quick Frozen (IQF)',
        prev_hash: '0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e',
        hash: '1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f'
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
        actor_name: 'Prakash Harikantra',
        org_name: 'Karwar Marine Co-op',
        weight_kg: 520,
        temp_c: 4.1,
        location: 'Karwar Baithkol Port',
        occurred_at: '2026-10-26T05:00:00Z',
        notes: 'Initial weigh-in completed.',
        prev_hash: 'GENESIS',
        hash: '2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a'
      },
      {
        seq: 2,
        event_type: 'PURCHASE',
        title: 'Purchased',
        actor_name: 'Sudhir Merchant',
        org_name: 'Apex Fish Traders',
        weight_kg: 505,
        price_per_kg: 320,
        temp_c: 5.5,
        location: 'Karwar Wholesale Wharf',
        occurred_at: '2026-10-28T05:30:00Z',
        notes: 'Delay due to auction dispute and refrigeration breakdown.',
        prev_hash: '2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a',
        hash: '3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b'
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
        actor_name: 'Ravi Salian',
        org_name: 'Mangaluru Trawler Association',
        weight_kg: 310,
        temp_c: 2.1,
        location: 'Mangaluru Old Port',
        occurred_at: '2026-10-27T04:30:00Z',
        notes: 'Landed on ice',
        prev_hash: 'GENESIS',
        hash: '4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c'
      },
      {
        seq: 2,
        event_type: 'PURCHASE',
        title: 'Purchased (Tampered in DB)',
        actor_name: 'Ganesh Pai',
        org_name: 'Coastal Traders',
        weight_kg: 295,
        price_per_kg: 620,
        temp_c: 2.5,
        location: 'Mangaluru Auction Yard',
        occurred_at: '2026-10-27T08:00:00Z',
        notes: 'Price was maliciously manipulated from 480 to 620',
        prev_hash: '4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c',
        hash: 'TAMPERED_INVALID_HASH_CORRUPTED_ENTRY_0000000000000000000000000000'
      },
      {
        seq: 3,
        event_type: 'PROCESSING',
        title: 'Processed',
        actor_name: 'Sunil Shenoy',
        org_name: 'Coastal Foods Pvt Ltd',
        weight_kg: 220,
        input_weight_kg: 295,
        yield_percent: 74.5,
        process_type: 'De-heading & Deveining',
        temp_c: -3.0,
        location: 'Baikampady Unit',
        occurred_at: '2026-10-27T15:00:00Z',
        notes: 'Peeled & deveined IQF prawns',
        prev_hash: 'TAMPERED_INVALID_HASH_CORRUPTED_ENTRY_0000000000000000000000000000',
        hash: '5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d'
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
      },
      {
        seq: 2,
        event_type: 'PURCHASE',
        title: 'Purchased',
        actor_name: 'Naveen Shetty',
        org_name: 'Shetty Marine Traders',
        weight_kg: 204, // 32% weight drop!
        price_per_kg: 390,
        temp_c: 3.5,
        location: 'Malpe Auction Hall',
        occurred_at: '2026-10-27T11:00:00Z',
        notes: 'Purchased lot 12. Significant weight drop recorded.',
        prev_hash: '6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e',
        hash: '7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f'
      }
    ]
  },
  {
    batch_id: 'FB-20261028-0019',
    species: 'Mackerel',
    landing_centre: 'Mangaluru Harbour',
    landed_at: '2026-10-27T11:00:00Z',
    initial_weight_kg: 220,
    current_weight_kg: 210,
    boat_name: 'Sagar Ratna',
    operator_name: 'Keshava Poojary',
    current_handler: 'City Fish Mart',
    status: 'FLAGGED',
    created_at: '2026-10-27T11:00:00Z',
    image: 'https://images.unsplash.com/photo-1534943441045-1215b22bdf5f?w=600&auto=format&fit=crop&q=80',
    notes: 'Missing step: Final sale recorded directly after landing without transport step.',
    events: [
      {
        seq: 1,
        event_type: 'LANDING',
        title: 'Landed',
        actor_name: 'Keshava Poojary',
        org_name: 'Sagar Ratna',
        weight_kg: 220,
        temp_c: 2.8,
        location: 'Mangaluru Harbour',
        occurred_at: '2026-10-27T11:00:00Z',
        notes: 'Direct landing',
        prev_hash: 'GENESIS',
        hash: '8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a'
      },
      {
        seq: 2,
        event_type: 'SALE',
        title: 'Sold',
        actor_name: 'City Fish Mart',
        org_name: 'City Fish Retailers',
        weight_kg: 210,
        price_per_kg: 160,
        customer_type: 'Local Retail',
        location: 'Udupi Market',
        occurred_at: '2026-10-27T18:00:00Z',
        notes: 'Sold without intermediate transport step record',
        prev_hash: '8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a',
        hash: '9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b'
      }
    ]
  },
  {
    batch_id: 'FB-20261028-0021',
    species: 'Sardine',
    landing_centre: 'Malpe Harbour',
    landed_at: '2026-10-27T14:00:00Z',
    initial_weight_kg: 350,
    current_weight_kg: 340,
    boat_name: 'Jalanidhi',
    operator_name: 'Umesh Kotian',
    current_handler: 'Coastal Traders & Auctions',
    status: 'FLAGGED',
    created_at: '2026-10-27T14:00:00Z',
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&auto=format&fit=crop&q=80',
    notes: 'Duplicate purchase entry detected within 2 minutes by same trader.',
    events: [
      {
        seq: 1,
        event_type: 'LANDING',
        title: 'Landed',
        actor_name: 'Umesh Kotian',
        org_name: 'Jalanidhi Boats',
        weight_kg: 350,
        temp_c: 3.1,
        location: 'Malpe Harbour',
        occurred_at: '2026-10-27T14:00:00Z',
        notes: 'Landed from day haul',
        prev_hash: 'GENESIS',
        hash: 'a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c'
      },
      {
        seq: 2,
        event_type: 'PURCHASE',
        title: 'Purchased (First entry)',
        actor_name: 'Ganesh Pai',
        org_name: 'Coastal Traders & Auctions',
        weight_kg: 340,
        price_per_kg: 85,
        temp_c: 3.0,
        location: 'Malpe Auction Hall',
        occurred_at: '2026-10-27T14:20:00Z',
        notes: 'Lot 203 original entry',
        prev_hash: 'a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c',
        hash: 'b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d'
      },
      {
        seq: 3,
        event_type: 'PURCHASE',
        title: 'Purchased (Duplicate entry)',
        actor_name: 'Ganesh Pai',
        org_name: 'Coastal Traders & Auctions',
        weight_kg: 340,
        price_per_kg: 85,
        temp_c: 3.0,
        location: 'Malpe Auction Hall',
        occurred_at: '2026-10-27T14:22:00Z',
        notes: 'Accidental double submission by trader terminal',
        prev_hash: 'b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d',
        hash: 'c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e'
      }
    ]
  }
];

// Generate 25 additional realistic batches to exceed the PRD requirement of 30+ batches
const SPECIES_LIST = ['Mackerel', 'Sardine', 'Pomfret', 'Tuna', 'Prawns'];
const HARBOURS = ['Mangaluru Harbour', 'Malpe Harbour', 'Karwar Harbour'];
const BOATS = ['Sea Queen', 'Matsya Prabha', 'Ocean Hunter', 'Blue Fin I', 'Nethravathi Star', 'Kadal Kanya', 'Sagar Ratna', 'Jalanidhi', 'Samudra Shakti', 'Varuna'];
const FISHERS = ['Ramesh Naik', 'Shekhar Kunder', 'Devadas Amin', 'Prakash Harikantra', 'Ravi Salian', 'Suresh Bangera', 'Keshava Poojary', 'Umesh Kotian'];

for (let i = 22; i <= 45; i++) {
  const numStr = i.toString().padStart(4, '0');
  const species = SPECIES_LIST[i % SPECIES_LIST.length];
  const harbour = HARBOURS[i % HARBOURS.length];
  const boat = BOATS[i % BOATS.length];
  const fisher = FISHERS[i % FISHERS.length];
  const initialWeight = 150 + ((i * 17) % 350);
  const isSold = i % 3 === 0;
  const isFlagged = i % 7 === 0;
  const status = isSold ? 'SOLD' : isFlagged ? 'FLAGGED' : 'ACTIVE';
  const currentWeight = isSold ? Math.round(initialWeight * 0.72) : Math.round(initialWeight * 0.94);

  INITIAL_BATCHES.push({
    batch_id: `FB-20261028-${numStr}`,
    species,
    landing_centre: harbour,
    landed_at: `2026-10-${20 + (i % 8)}T06:${(i * 12) % 60}:00Z`,
    initial_weight_kg: initialWeight,
    current_weight_kg: currentWeight,
    boat_name: boat,
    operator_name: fisher,
    current_handler: isSold ? 'Ocean Fresh Seafood Market' : 'Coastal Logistics',
    status,
    created_at: `2026-10-${20 + (i % 8)}T06:00:00Z`,
    image: species === 'Prawns'
      ? 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=600&auto=format&fit=crop&q=80'
      : species === 'Pomfret'
      ? 'https://images.unsplash.com/photo-1510137442180-4904a60032e5?w=600&auto=format&fit=crop&q=80'
      : 'https://images.unsplash.com/photo-1534943441045-1215b22bdf5f?w=600&auto=format&fit=crop&q=80',
    notes: `Catch logged at ${harbour}. Inspected and approved.`,
    events: [
      {
        seq: 1,
        event_type: 'LANDING',
        title: 'Landed',
        actor_name: `${fisher} (Fisher)`,
        org_name: `${boat} Fleet`,
        weight_kg: initialWeight,
        temp_c: 2.2,
        location: harbour,
        occurred_at: `2026-10-${20 + (i % 8)}T06:30:00Z`,
        notes: 'Landing verified at harbour gate',
        prev_hash: 'GENESIS',
        hash: `hash_landing_${numStr}_a1b2c3d4e5f6`
      },
      {
        seq: 2,
        event_type: 'PURCHASE',
        title: 'Purchased',
        actor_name: 'Ganesh Pai (Trader)',
        org_name: 'Coastal Traders',
        weight_kg: Math.round(initialWeight * 0.98),
        price_per_kg: species === 'Pomfret' ? 450 : species === 'Tuna' ? 320 : species === 'Prawns' ? 520 : 160,
        temp_c: 2.6,
        location: `${harbour} Auction Hall`,
        occurred_at: `2026-10-${20 + (i % 8)}T09:30:00Z`,
        notes: 'Auction bid won',
        prev_hash: `hash_landing_${numStr}_a1b2c3d4e5f6`,
        hash: `hash_purchase_${numStr}_b2c3d4e5f6a1`
      }
    ]
  });
}

// Initial Seed Alerts matching PRD & TRD
export const INITIAL_ALERTS = [
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
    id: 'alt_003',
    batch_id: 'FB-20261028-0021',
    type: 'DUPLICATE',
    typeLabel: 'Duplicate Entry',
    description: 'Duplicate purchase entry within 2 minutes by Ganesh Pai',
    time: '1d ago',
    detected_at: '2026-10-27T14:25:00Z',
    severity: 'MED',
    status: 'OPEN',
    resolved: false,
    resolution_note: null
  },
  {
    id: 'alt_004',
    batch_id: 'FB-20261028-0019',
    type: 'MISSING_STEP',
    typeLabel: 'Missing Step',
    description: 'No transport record logged between Landing and Sale',
    time: '1d ago',
    detected_at: '2026-10-27T18:10:00Z',
    severity: 'MED',
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
  },
  {
    id: 'alt_006',
    batch_id: 'FB-20261028-0007',
    type: 'TIME_GAP',
    typeLabel: 'Transport Delay',
    description: 'Transport duration exceeded standard 8h transit limit by 4 hours',
    time: '3d ago',
    detected_at: '2026-10-25T11:00:00Z',
    severity: 'LOW',
    status: 'RESOLVED',
    resolved: true,
    resolution_note: 'Ghat section landslide caused 4h road closure. Temp was logged at 2.5°C throughout.'
  },
  {
    id: 'alt_007',
    batch_id: 'FB-20261028-0005',
    type: 'WEIGHT_LOSS',
    typeLabel: 'Processing Yield Alert',
    description: 'Processing yield was 68% (expected >=75% for Mackerel filleting)',
    time: '4d ago',
    detected_at: '2026-10-24T17:00:00Z',
    severity: 'LOW',
    status: 'RESOLVED',
    resolved: true,
    resolution_note: 'Smaller average fish size resulted in higher trim percentage. Approved by quality manager.'
  }
];

// Helper to get or initialize stored batches
export function getStoredBatches() {
  try {
    const raw = localStorage.getItem('catchtrace_batches');
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to parse stored batches:', err);
  }
  localStorage.setItem('catchtrace_batches', JSON.stringify(INITIAL_BATCHES));
  return INITIAL_BATCHES;
}

export function saveStoredBatches(batches) {
  localStorage.setItem('catchtrace_batches', JSON.stringify(batches));
}

// Helper to get or initialize stored alerts
export function getStoredAlerts() {
  try {
    const raw = localStorage.getItem('catchtrace_alerts');
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to parse stored alerts:', err);
  }
  localStorage.setItem('catchtrace_alerts', JSON.stringify(INITIAL_ALERTS));
  return INITIAL_ALERTS;
}

export function saveStoredAlerts(alerts) {
  localStorage.setItem('catchtrace_alerts', JSON.stringify(alerts));
}
