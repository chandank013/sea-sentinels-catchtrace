import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { BATCHES, resetSeedData } from './src/db/store.js';
import { computeEventHash, computePhotoHash, verifyEventChain } from './src/services/hashChain.js';

console.log('================================================================');
console.log('🧪 TEST: Live Camera Photo Evidence & Tamper-Proof Hash Chain');
console.log('================================================================\n');

async function runTest() {
  // 1. Pick a test batch (e.g., active batch FB-20261028-0025)
  const batch = BATCHES.find((b) => b.batch_id === 'FB-20261028-0025');
  if (!batch) {
    console.error('❌ Test batch FB-20261028-0025 not found');
    process.exit(1);
  }

  console.log(`[Step 1] Target Batch: ${batch.batch_id} (${batch.species})`);
  console.log(`Current Events in Chain: ${batch.events.length}`);

  // Initial verification before adding event
  const initialVerify = verifyEventChain(batch.batch_id, batch.events);
  console.log(`Initial Chain Integrity: ${initialVerify.isValid ? '✅ VALID (Intact)' : '❌ INVALID'}\n`);

  // 2. Simulate logging a new event with a LIVE camera photo
  console.log('[Step 2] Logging new TRANSPORT event with live camera photo...');
  const simulatedPhotoUrl = 'data:image/jpeg;base64,' + Buffer.from('MOCK_LIVE_CAMERA_CARGO_PHOTO_BYTES_TIMESTAMP_' + Date.now()).toString('base64');
  
  // Compute photo hash
  const photoHash = await computePhotoHash(simulatedPhotoUrl);
  console.log(`📷 Live Photo SHA-256 Hash Computed: ${photoHash}`);

  const seq = batch.events.length + 1;
  const prevHash = batch.events[batch.events.length - 1].hash;
  const occurredAt = new Date().toISOString();

  // Compute event hash including photo_hash
  const eventHash = computeEventHash({
    batch_id: batch.batch_id,
    seq,
    event_type: 'TRANSPORT_DROP',
    actor_name: 'Mohammed Rafi (Transporter)',
    weight_kg: 210,
    occurred_at: occurredAt,
    notes: 'Reefer transit completed with live thermometer and cargo photo evidence.',
    photo_hash: photoHash,
    prev_hash: prevHash,
  });

  const newEvent = {
    seq,
    event_type: 'TRANSPORT_DROP',
    title: 'Transported',
    actor_name: 'Mohammed Rafi (Transporter)',
    org_name: 'Express Cold Logistics',
    weight_kg: 210,
    temp_c: -2.1,
    location: 'Mangaluru → Bengaluru Wholesale Market',
    occurred_at: occurredAt,
    notes: 'Reefer transit completed with live thermometer and cargo photo evidence.',
    photo_url: simulatedPhotoUrl,
    photo_hash: photoHash,
    confirmation_status: 'CONFIRMED',
    prev_hash: prevHash,
    hash: eventHash,
  };

  batch.events.push(newEvent);
  console.log(`✅ Event #${seq} successfully added to hash chain:`);
  console.log(`   Event Hash: ${eventHash}`);
  console.log(`   Photo Hash: ${newEvent.photo_hash}\n`);

  // 3. Verify intact chain with new photo-locked event
  console.log('[Step 3] Running Verify Check on intact batch...');
  const verifyAfterAdd = verifyEventChain(batch.batch_id, batch.events);
  if (verifyAfterAdd.isValid) {
    console.log(`✅ VERIFICATION PASSED: Batch ${batch.batch_id} is 100% cryptographically intact!`);
    console.log(`   Total Verified Steps: ${verifyAfterAdd.totalSteps}`);
    console.log(`   Last Hash: ${verifyAfterAdd.lastHash}\n`);
  } else {
    console.error('❌ Verification failed unexpectedly:', verifyAfterAdd);
    process.exit(1);
  }

  // 4. SIMULATE TAMPERING: Manually swap stored photo_url in database directly!
  console.log('----------------------------------------------------------------');
  console.log('🚨 [Step 4] SIMULATING DATABASE TAMPERING: Swapping photo_url...');
  console.log('   An attacker changes the event stored photo_url to a forged image:');
  const forgedPhotoUrl = 'data:image/jpeg;base64,' + Buffer.from('FORGED_STOLEN_PHOTO_OF_DIFFERENT_FISH').toString('base64');
  
  // Directly manipulate the database event
  newEvent.photo_url = forgedPhotoUrl;
  console.log(`   Replaced event #${seq} photo_url with forged image.`);
  console.log('----------------------------------------------------------------\n');

  // 5. Run Verify Check — must catch the exact broken step!
  console.log('[Step 5] Running Verify Check on tampered batch (swapped photo_url)...');
  const verifyAfterTamper = verifyEventChain(batch.batch_id, batch.events);
  
  if (!verifyAfterTamper.isValid && verifyAfterTamper.brokenStep?.seq === seq) {
    console.log('🛡️ TAMPER DETECTED BY CRYPTOGRAPHIC AUDIT!');
    console.log(`   Batch Valid: ${verifyAfterTamper.isValid}`);
    console.log(`   Broken Step Sequence: #${verifyAfterTamper.brokenStep?.seq}`);
    console.log(`   Reason: ${verifyAfterTamper.brokenStep?.reason}`);
    console.log(`   Expected Photo Hash: ${verifyAfterTamper.brokenStep?.expected_photo_hash}`);
    console.log(`   Actual Photo Hash:   ${verifyAfterTamper.brokenStep?.actual_photo_hash}\n`);
  } else {
    console.error('❌ FAIL: Tamper check did not detect the swapped photo!');
    process.exit(1);
  }

  // 6. SIMULATE TAMPERING 2: What if attacker also modifies photo_hash to match the new image?
  console.log('----------------------------------------------------------------');
  console.log('🚨 [Step 6] ADVANCED ATTACK SIMULATION: Attacker also modifies photo_hash...');
  newEvent.photo_hash = verifyAfterTamper.brokenStep?.actual_photo_hash;
  console.log(`   Event #${seq} photo_hash changed in DB to match forged image.`);
  const verifyAfterHashTamper = verifyEventChain(batch.batch_id, batch.events);
  if (!verifyAfterHashTamper.isValid && verifyAfterHashTamper.brokenStep?.seq === seq) {
    console.log('🛡️ ADVANCED TAMPER DETECTED BY CRYPTOGRAPHIC AUDIT!');
    console.log(`   Reason: ${verifyAfterHashTamper.brokenStep?.reason}`);
    console.log(`   Stored Event Hash:     ${verifyAfterHashTamper.brokenStep?.stored_hash}`);
    console.log(`   Recomputed Event Hash: ${verifyAfterHashTamper.brokenStep?.recomputed_hash}`);
    console.log('----------------------------------------------------------------\n');
  } else {
    console.error('❌ FAIL: Event hash recomputation did not detect altered photo_hash!');
    process.exit(1);
  }

  console.log('================================================================');
  console.log('🎉 ALL TESTS PASSED: Live camera photo evidence is 100% cryptographically');
  console.log('   locked into the tamper-proof hash chain!');
  console.log('================================================================');

  // Reset seed data back to pristine state
  resetSeedData();
}

runTest().catch((err) => {
  console.error('Test execution error:', err);
  process.exit(1);
});
