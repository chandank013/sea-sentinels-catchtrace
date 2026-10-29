import express from 'express';
import { BATCHES, ALERTS } from '../db/store.js';
import { filterBatchesByRole } from '../services/roleScoping.js';

const router = express.Router();

// TODO: BUYER_PAID account_type gate for certificate bulk export and dashboard analytics
router.get('/summary', (req, res) => {
  const { role, userId, userName, userOrg, userEmail } = req.query;
  const user = {
    role: (role || 'ADMIN').toUpperCase(),
    id: userId,
    name: userName,
    org: userOrg,
    email: userEmail,
  };

  const isAdmin = user.role === 'ADMIN';
  const roleBatches = isAdmin ? BATCHES : filterBatchesByRole(BATCHES, user);

  const totalBatches = roleBatches.length;
  const activeBatches = roleBatches.filter((b) => b.status === 'ACTIVE').length;
  const completedSold = roleBatches.filter((b) => b.status === 'SOLD').length;
  const openAlerts = isAdmin ? ALERTS.filter((a) => !a.resolved).length : 0;

  const speciesVolume = {
    Mackerel: 0,
    Tuna: 0,
    Pomfret: 0,
    Sardine: 0,
    Prawns: 0,
  };

  let totalWeight = 0;
  roleBatches.forEach((b) => {
    const wt = b.current_weight_kg || b.initial_weight_kg || 0;
    totalWeight += wt;
    if (speciesVolume[b.species] !== undefined) {
      speciesVolume[b.species] += wt;
    }
  });

  const speciesChartData = Object.keys(speciesVolume).map((name) => ({
    name,
    weight: speciesVolume[name],
  }));

  // 1. FISHER
  if (user.role === 'FISHER') {
    return res.json({
      role: 'FISHER',
      totalBatches,
      activeBatches,
      completedSold,
      openAlerts: 0,
      speciesChartData,
      roleTitle: 'Fisher Catch & Landings Dashboard',
      roleSubtitle: `Catches registered by ${user.name || 'Fisher'} (${user.org || 'Vessel Fleet'})`,
      statCard1: { title: 'My Landed Batches', value: totalBatches, trend: '+3', label: 'this month' },
      statCard2: { title: 'Active in Supply Chain', value: activeBatches, trend: 'In-Transit', label: 'with buyers/traders' },
      statCard3: { title: 'Completed / Sold', value: completedSold, trend: 'Delivered', label: 'reached retail' },
      statCard4: { title: 'My Landed Biomass', value: `${totalWeight.toLocaleString()} kg`, trend: 'Verified', label: 'harbour weigh-ins' },
      supplyChainStats: {
        avgLandingToSaleDays: '1.8 days',
        stat1Label: 'Harbour Turnaround',
        totalWeightTrackedKg: `${totalWeight.toLocaleString()} kg`,
        stat2Label: 'My Total Landed Biomass',
        successfulDeliveryRate: '100%',
        stat3Label: 'Auction Clearance',
        integrityVerifiedRate: '100%',
        stat4Label: 'My Record Integrity',
      },
    });
  }

  // 2. TRADER
  if (user.role === 'TRADER') {
    return res.json({
      role: 'TRADER',
      totalBatches,
      activeBatches,
      completedSold,
      openAlerts: 0,
      speciesChartData,
      roleTitle: 'Trader Procurement Dashboard',
      roleSubtitle: `Auction procurement & transfers by ${user.name || 'Trader'}`,
      statCard1: { title: 'My Procured Batches', value: totalBatches, trend: '+8%', label: 'lots acquired' },
      statCard2: { title: 'Active in Logistics', value: activeBatches, trend: 'In-Transit', label: 'en route to units' },
      statCard3: { title: 'Completed Lots', value: completedSold, trend: 'Finalized', label: 'retail handover' },
      statCard4: { title: 'Procured Volume', value: `${totalWeight.toLocaleString()} kg`, trend: 'Auctioned', label: 'wharf procurement' },
      supplyChainStats: {
        avgLandingToSaleDays: '₹155 / kg',
        stat1Label: 'Average Purchase Price',
        totalWeightTrackedKg: `${totalWeight.toLocaleString()} kg`,
        stat2Label: 'My Total Procurement',
        successfulDeliveryRate: '99.2%',
        stat3Label: 'Processor Transfer Rate',
        integrityVerifiedRate: '100%',
        stat4Label: 'Auction Cryptographic Proof',
      },
    });
  }

  // 3. PROCESSOR
  if (user.role === 'PROCESSOR') {
    return res.json({
      role: 'PROCESSOR',
      totalBatches,
      activeBatches,
      completedSold,
      openAlerts: 0,
      speciesChartData,
      roleTitle: 'Processing Plant Dashboard',
      roleSubtitle: `Intake, filleting & blast-freeze operations for ${user.org || 'Processing Unit'}`,
      statCard1: { title: 'My Processed Batches', value: totalBatches, trend: '+5', label: 'intake lots' },
      statCard2: { title: 'Cold Storage Batches', value: activeBatches, trend: 'Stored -18°C', label: 'in cold warehouse' },
      statCard3: { title: 'Dispatched to Retail', value: completedSold, trend: 'Shipped', label: 'market delivery' },
      statCard4: { title: 'Processed Output', value: `${totalWeight.toLocaleString()} kg`, trend: 'Yield 68%', label: 'packaged fillet/whole' },
      supplyChainStats: {
        avgLandingToSaleDays: '68.4%',
        stat1Label: 'Average Filleting Yield',
        totalWeightTrackedKg: `${totalWeight.toLocaleString()} kg`,
        stat2Label: 'Processed Weight Output',
        successfulDeliveryRate: '-18.5 °C',
        stat3Label: 'Mean Deep-Freeze Temp',
        integrityVerifiedRate: '100%',
        stat4Label: 'Yield Ledger Integrity',
      },
    });
  }

  // 4. TRANSPORTER
  if (user.role === 'TRANSPORTER') {
    return res.json({
      role: 'TRANSPORTER',
      totalBatches,
      activeBatches,
      completedSold,
      openAlerts: 0,
      speciesChartData,
      roleTitle: 'Reefer Transit Dashboard',
      roleSubtitle: `Cold chain logistics for ${user.org || 'Reefer Logistics'}`,
      statCard1: { title: 'My Freight Batches', value: totalBatches, trend: '+4', label: 'cargo shipments' },
      statCard2: { title: 'On Highway Transit', value: activeBatches, trend: 'NH 75 En Route', label: 'live temperature monitored' },
      statCard3: { title: 'Delivered Cargo', value: completedSold, trend: 'Arrived', label: 'counter received' },
      statCard4: { title: 'Cargo Weight Hauled', value: `${totalWeight.toLocaleString()} kg`, trend: 'Temp 2-4°C', label: 'reefer monitored volume' },
      supplyChainStats: {
        avgLandingToSaleDays: '3.2 °C',
        stat1Label: 'Average Reefer Temp',
        totalWeightTrackedKg: `${totalWeight.toLocaleString()} kg`,
        stat2Label: 'Cold Freight Hauled',
        successfulDeliveryRate: '99.8%',
        stat3Label: 'On-Time Terminal Arrival',
        integrityVerifiedRate: '100%',
        stat4Label: 'IoT Sensor Proof',
      },
    });
  }

  // 5. SELLER
  if (user.role === 'SELLER') {
    return res.json({
      role: 'SELLER',
      totalBatches,
      activeBatches,
      completedSold,
      openAlerts: 0,
      speciesChartData,
      roleTitle: 'Seafood Retail Counter Dashboard',
      roleSubtitle: `Counter stock & consumer checkout for ${user.org || 'Retail Mart'}`,
      statCard1: { title: 'My Counter Batches', value: totalBatches, trend: '+6', label: 'received for display' },
      statCard2: { title: 'Fresh Counter Stock', value: activeBatches, trend: 'On Ice', label: 'available for sale' },
      statCard3: { title: 'Sold to Consumers', value: completedSold, trend: 'Checkout', label: 'scanned & sold' },
      statCard4: { title: 'Retail Volume Sold', value: `${totalWeight.toLocaleString()} kg`, trend: 'Grade A', label: 'certified fresh fish' },
      supplyChainStats: {
        avgLandingToSaleDays: '14 mins',
        stat1Label: 'Consumer Scan Frequency',
        totalWeightTrackedKg: `${totalWeight.toLocaleString()} kg`,
        stat2Label: 'Retail Counter Biomass',
        successfulDeliveryRate: '100%',
        stat3Label: 'Freshness Verified Rate',
        integrityVerifiedRate: '100%',
        stat4Label: 'QR Provenance Score',
      },
    });
  }

  // DEFAULT: ADMIN
  return res.json({
    role: 'ADMIN',
    totalBatches,
    activeBatches,
    completedSold,
    openAlerts,
    speciesChartData,
    roleTitle: 'Fisheries Department Regulatory Dashboard',
    roleSubtitle: 'Statewide supply chain audit & compliance across all coastal Karnataka centres',
    statCard1: { title: 'Total Tracked Batches', value: totalBatches, trend: '+12%', label: 'statewide volume' },
    statCard2: { title: 'Active in Supply Chain', value: activeBatches, trend: '+5%', label: 'in-transit & processing' },
    statCard3: { title: 'Completed Sales', value: completedSold, trend: '+18%', label: 'delivered & sold' },
    statCard4: { title: 'Open Anomaly Alerts', value: openAlerts, trend: openAlerts > 0 ? 'Action Req' : 'Nominal', label: 'audit warnings' },
    supplyChainStats: {
      avgLandingToSaleDays: '2.4 days',
      stat1Label: 'Mean Landing-to-Sale Turnaround',
      totalWeightTrackedKg: `${totalWeight.toLocaleString()} kg`,
      stat2Label: 'Total Landed Biomass Audited',
      successfulDeliveryRate: '98.5%',
      stat3Label: 'Supply Chain Completion Rate',
      integrityVerifiedRate: '97.2%',
      stat4Label: 'SHA-256 Ledger Verification Rate',
    },
  });
});

export default router;
