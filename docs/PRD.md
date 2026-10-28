# CatchTrace — Product Requirements Document (PRD)

**Project Name:** CatchTrace (Cryptographic Fish Supply Chain Traceability Platform)  
**Team:** Sea Sentinels  
**Hackathon / Event:** LEAP Hackathon Mangaluru (28–29 October 2026)  
**Problem Statement:** Problem Statement 6 — Fragmented Digital Records Across the Fish Supply Chain  
**Document Version:** 2.0 (Updated to reflect full live implementation till date)  
**Status:** Implemented & Verified MVP  

---

## 1. Executive Summary & Problem Statement

### 1.1 The Challenge
In India's marine and coastal fisheries (particularly across Karnataka's coastline — Mangaluru, Malpe, and Karwar harbours), fishers, auctioneers, primary processors, cold-chain transporters, and retail vendors maintain isolated, fragmented records. Most transactions rely on paper notebooks, verbal auction agreements, or disparate proprietary ledgers.

**Key Industry Pain Points:**
1. **Zero End-to-End Traceability:** Consumers and regulators cannot trace a packaged or retail fish back to its vessel, harvest location, or landing harbour.
2. **Duplicate Records & Food Fraud:** Commercial mislabeling (e.g., selling low-grade fish as premium Pomfret or Kingfish) and duplicate harvest logging.
3. **Cold-Chain Vulnerability:** High ambient temperatures lead to rapid spoilage during highway reefer transit without transparent temperature telemetry.
4. **Data Fragmentation:** India’s National Traceability Framework highlights disconnected platforms and manual duplicate records as the single largest barrier to seafood export compliance and fair trade pricing for coastal fishers.

### 1.2 The Solution: CatchTrace
**CatchTrace** is a next-generation, mobile-first cryptographic fish supply-chain traceability platform. It unifies every participant onto a single immutable chain of custody:
- Every batch receives a unique sequential identifier (`FB-YYYYMMDD-XXXX`) and a cryptographic QR code upon landing.
- Handlers log downstream events (Purchase, Processing, Transport, Retail Sale) in under 30 seconds.
- Cryptographic hash chaining (SHA-256) seals every handover, making historical tampering mathematically impossible to conceal.
- Anyone (consumers, hotel chefs, food safety inspectors) can scan the physical QR code with their smartphone camera without logging in to see the complete journey from sea to plate.
- Fully localized in **English** and authentic **Coastal Kannada (ಕನ್ನಡ)** for local fisherfolk and harbour operators.

---

## 2. Product Vision & Core Tenets

1. **One Batch, One Chain:** Exactly one cryptographic record per catch batch from ocean landing to customer retail sale.
2. **Sub-30-Second Data Entry:** Large touch targets, minimal typing, sensible coastal defaults, and instant camera QR scanning designed for dockside conditions.
3. **Mathematical Trust (No Hype):** Tamper resistance powered by clean SHA-256 cryptographic linking (`prev_hash -> current_hash`), accompanied by an instant verification engine.
4. **Dock-to-Market Inclusivity:** Native coastal Karnataka fisheries terminology (ಬಂಗುಡೆ, ಬೂತಾಯಿ, ಮಾಂಜಿ, ಕುಬ್ಬೆ, ಸಿಗಡಿ) ensuring accessibility for traditional fishermen and harbour masters.
5. **Role-Scoped Privacy:** Individual fishers and handlers only see their authorized operations, while regulatory administrators maintain statewide oversight.

---

## 3. User Personas & Permissions Matrix

| Role | Target Persona | Primary Operations & Scope |
| :--- | :--- | :--- |
| **Fisher / Landing Operator** (`FISHER`) | Boat owners, trawler captains, harbour landing station clerks in Mangaluru, Malpe, Karwar. | • Create new batch at harbour landing.<br>• Record initial weight (kg), fish species, boat name, quality notes.<br>• Generate and print cryptographic QR batch tag.<br>• Dashboard scoped strictly to their own catches. |
| **Trader / Auctioneer** (`TRADER`) | Harbour commission agents, wholesale auctioneers. | • Scan batch QR code dockside.<br>• Record auction purchase price (₹/kg), buyer name, and dispatch destination. |
| **Processor** (`PROCESSOR`) | Filleting, grading, packaging, blast-freezing, and IQF facility operators. | • Record intake weight, processing method, and output weight.<br>• Track processing yield (%). Automatic flag if weight drop exceeds processing thresholds. |
| **Transporter** (`TRANSPORTER`) | Reefer truck operators, cold-chain logistics fleet drivers. | • Scan pickup and drop checkpoints.<br>• Record continuous reefer storage temperature (°C). System flags temperature excursions above 4°C. |
| **Seller / Vendor** (`SELLER`) | Fishmongers, supermarket seafood managers, wholesale market stalls. | • Log final retail or counter sale.<br>• Closes batch lifecycle (`SOLD`). Prevents further unauthorized modifications. |
| **Admin / Regulator** (`ADMIN`) | Karnataka Fisheries Department, Harbour Masters, Cooperative Auditors. | • Statewide oversight across all harbours, vessels, and handlers.<br>• Real-time alerts monitoring (weight loss, temperature spikes, time gaps, tampering).<br>• On-demand cryptographic hash chain integrity auditor.<br>• Export full regulatory audit reports in CSV and PDF formats. |
| **Consumer / Public Buyer** (`PUBLIC`) | Shoppers, restaurant chefs, household buyers. | • Zero-login public trace page (`/trace/:id`).<br>• Verify catch authenticity, vessel, landing harbour, fresh transit timeline, and food safety compliance. |

---

## 4. Functional Requirements (Implemented Till Date)

### FR-1: Authentication & Role Management
- **Email + Security PIN Authentication:** Simplified authentication accepting standard email format (`name1234@gmail.com`) and a 4-digit security PIN (`pin_hash` with bcrypt encryption).
- **Fast Role Selector:** Ability to register or log in across all 6 supply chain roles with pre-configured organizational defaults (e.g., Sea Queen Trawlers, Coastal Seafoods Facility, Karnataka Fisheries Dept).
- **Session Persistence:** Secure JWT-based local storage session with automatic logout on token expiration.
- **Fast Profile Role Switcher:** Quick-switch menu in `/profile` permitting live simulation and demonstration across different roles without manual re-registration.

### FR-2: Batch Creation & Unique Identifier Generation
- **Sequential Cryptographic Batch ID:** Generates standard identifiers formatted as `FB-YYYYMMDD-XXXX` (e.g., `FB-20261028-0001`).
- **Comprehensive Landing Metadata:** Captures fish species, landing harbour, initial weigh-in (kg), vessel/boat name, operator name, and catch quality notes.
- **Genesis QR Code Card:** Real-time generation of downloadable and printable SVG/PNG QR codes encoding the public URL (`https://catchtrace.in/trace/:id`).
- **Automated Genesis Block Creation:** Automatically generates Event Step #1 (`LANDING`) with `prev_hash: "GENESIS"` upon batch registration.

### FR-3: Dynamic Role-Scoped Dashboards
- **Operator-Specific Scoping:**
  - When logged in as a **Fisher**, the dashboard and batch tables display *only* batches initiated by that fisher's account.
  - Quick action buttons adapt to the active role (e.g., Fisher sees `+ Record Landing`, Trader sees `+ Record Harbour Purchase`, Transporter sees `+ Record Route & Reefer Temp`).
- **Administrator Statewide Oversight:**
  - Administrators receive state-wide analytics aggregating all coastal landing centres (Mangaluru, Malpe, Karwar), total weight volume, active alerts, and overall delivery success rates.
- **Interactive Analytics:**
  - Dynamic Recharts bar graph displaying catch volume distribution by species (Mackerel, Tuna, Pomfret, Sardine, Prawns).
  - Four responsive KPI cards with month-over-month trends.

### FR-4: Chain-of-Custody Event Logging
- **Standardized Handover Events:** Support for `LANDING`, `PURCHASE`, `PROCESSING`, `TRANSPORT_PICKUP`, `TRANSPORT_DROP`, and `SALE`.
- **Role-Aware Forms:** Tailored data capture per stage:
  - *Purchase:* Weight, auction price per kg, purchaser identity.
  - *Processing:* Input vs output weight, automatic calculation of yield percentage.
  - *Transport:* Reefer truck temperature (°C), location checkpoints.
  - *Sale:* Final retail counter sale price and consumer packaging confirmation.
- **Terminal Lifecycle Enforcement:** Once a batch is marked `SOLD`, further handovers are strictly blocked.

### FR-5: Cryptographic Hash Chain & Tamper Detection
- **SHA-256 Event Hashing:** Each event record computes:
  $$\text{hash} = \text{SHA-256}(\text{batch\_id} + \text{seq} + \text{event\_type} + \text{actor\_id} + \text{weight\_kg} + \text{occurred\_at} + \text{notes} + \text{prev\_hash})$$
- **Immutable Ledger Verification:** The `/batches/:id/verify` endpoint walks the entire chain from genesis root to the latest block.
- **Visual Tamper Alerts:** If any database record or weight is altered out-of-band:
  - The verification card turns red with a detailed anomaly report identifying the exact broken step.
  - The timeline highlights the tampered node with an pulsing alert badge.

### FR-6: Rule-Based Automated Alerts Engine
Automated detection running after every recorded event:
1. **DUPLICATE Entry Alert:** Flags identical event types logged for the same batch within 5 minutes.
2. **WEIGHT_LOSS Threshold Alert:** Flags unexplained weight loss (>15% during transit or >60% during processing).
3. **COLD_CHAIN Temperature Spike Alert:** Flags reefer transit temperatures exceeding +4.0°C.
4. **TIME_GAP Delayed Transfer Alert:** Flags delays greater than 6 hours between dockside handovers.
5. **MISSING_STEP Audit Alert:** Flags terminal sales recorded without prerequisite transport or procurement events.
6. **Alerts Resolution Workflow:** Allows authorized operators or admins to review flagged records, input audited resolution notes, and resolve open issues.

### FR-7: Public Traceability & QR Code Experience
- **Zero-Login Consumer Portal (`/trace/:id`):** Publicly accessible on any mobile or desktop browser without requiring user credentials.
- **Authenticity Seal:** Verified CatchTrace certificate confirming cryptographic integrity.
- **Consumer Privacy Preserved:** Public displays omit confidential business transaction prices and internal handler phone numbers, while transparently showcasing landing harbour, harvest date, cold-chain temperature status, and handling organizations.

### FR-8: Live Camera QR Scanner & Manual Batch Search
- **Hardware-Accelerated Camera Scanner:** Built with `html5-qrcode` to scan batch labels directly in the field using mobile rear cameras or desktop webcams.
- **Instant Redirection:** Automatically parses scanned QR codes and navigates directly to the batch journey.
- **Manual Search Fallback:** Quick-search bar accepting batch IDs, fish species, or vessel names.

### FR-9: End-to-End Bilingual Localization (English & Kannada)
- **Instant Global Toggle:** One-click `🌐 ಕನ್ನಡ / English` switch located in all navbars and headers.
- **Coastal Fisheries Vocabulary:** 100% authentic Kannada translations covering marine species, port landing centres, handovers, alerts, and legal disclaimers.
- **Zero-Latency State:** React Context updates UI text across all pages in real-time with automatic `localStorage` persistence.

### FR-10: Batch Management, Filtering & Export
- Multi-parameter filtering by species, landing centre, lifecycle status, and search query.
- One-click CSV and printable PDF audit summary export for maritime regulatory authorities.

---

## 5. Non-Functional Requirements (NFRs)

| Category | Requirement | Implementation Specification |
| :--- | :--- | :--- |
| **Performance** | Sub-second page loads and QR lookups | Vite client bundle optimized with code splitting; lightweight REST JSON payloads under 50KB. |
| **Mobile Usability** | Operable in dockside environments with one hand | Responsive layout, 44px+ touch targets, high-contrast badges, horizontal top bar navigation. |
| **Cryptographic Security** | Tamper evidence | Industry-standard SHA-256 hashing; bcrypt PIN security; JWT bearer authentication. |
| **Offline Resilience** | Reliable seed state & instant fallback | Seed script restoring 29+ realistic batches and alerts; in-memory data store with MongoDB/Mongoose compatibility. |
| **Internationalization** | Complete dual-language support | Unified 22-section localization dictionary in JSON (`en.json`, `kn.json`) with zero untranslated UI strings. |

---

## 6. Success Metrics & Verification Results

| Target Metric | Benchmark Goal | Achieved Result |
| :--- | :--- | :--- |
| **Batch Registration Time** | < 30 seconds | **~15 seconds** via streamlined dockside form. |
| **Handover Event Logging** | < 45 seconds | **~20 seconds** with pre-filled role attributes. |
| **QR Code Scan-to-Trace Time** | < 3 seconds | **< 1 second** instant routing to public trace. |
| **Integrity Audit Speed** | < 1 second | Instantaneous SHA-256 verification of full 5-step hash chain. |
| **Tamper Detection Accuracy** | 100% deterministic | 100% detection rate on modified hashes or payloads. |
| **Kannada Localization Coverage** | 100% of visible screens | **100%** across Home, Dashboard, Batches, QR, Alerts, Reports, Settings, Login, and Register. |

---

## 7. Current Project Directory Structure

```
catch-trace/
├── client/                     # React 18 + Vite Frontend Application
│   ├── src/
│   │   ├── components/         # Modular UI Components (Navbar, Tables, QR, Timeline)
│   │   ├── context/            # AuthContext, LanguageContext
│   │   ├── locales/            # en.json, kn.json (Exhaustive bilingual dictionaries)
│   │   ├── pages/              # 12 Routed Pages (Home, Dashboard, Batches, Trace, etc.)
│   │   └── services/           # REST API client
├── server/                     # Node.js + Express Backend API
│   ├── src/
│   │   ├── data/               # In-memory mock DB & 29+ Seed Batches
│   │   ├── routes/             # Auth, Batches, Events, Alerts, Dashboard, Public
│   │   └── services/           # SHA-256 Hash Chain & Alerts Engine
├── docs/                       # Project Documentation (PRD, TRD)
└── README.md                   # Setup guide and team credentials
```
