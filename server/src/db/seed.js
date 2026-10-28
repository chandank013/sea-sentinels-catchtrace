import { resetSeedData, BATCHES, USERS, ALERTS } from './store.js';

console.log('--- CatchTrace DB Seed Script ---');
console.log(`Loaded ${Object.keys(USERS).length} demo role accounts`);
console.log(`Loaded ${BATCHES.length} realistic fish batches across Mangaluru, Malpe & Karwar Harbours`);
console.log(`Loaded ${ALERTS.length} anomaly flags (duplicate, weight loss, delay, integrity)`);
console.log('Seed completed successfully!');
