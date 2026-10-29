# CatchTrace — From Ocean to Your Plate 🐟⚓
> **Problem Statement 6: Fragmented Digital Records Across the Fish Supply Chain**  
> **Team Sea Sentinels** · LEAP Hackathon Mangaluru · 28–29 Oct 2026

CatchTrace is a production-ready, mobile-first cryptographic fish supply-chain traceability platform connecting fishers, auctioneers, processors, cold transporters, retail vendors, and end consumers. Every handover is hashed with SHA-256 in sequence, creating an immutable cryptographic chain of custody. Anyone can scan a batch's QR code on their smartphone to verify its entire journey from harbour landing to plate without login.

---

## 🚀 Live Demo Accounts & Pitch Credentials

During your presentation or pitching session, you can demonstrate the complete 6-stage lifecycle by logging in sequentially as each stakeholder via the **[Role Login Portal](http://localhost:5173/login)** (`/login`).

### 📋 Master Stakeholder Credentials Table

| Role | Stakeholder Name | Demo Email | Demo PIN | Organization / Vessel | Base / Harbour Location | Account ID | What to Show in Demo |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 🎣 **Fisher** | **Ramesh Naik** | `ramesh.fisher@gmail.com` | `1111` | Sea Queen Trawlers | Mangaluru Harbour | `usr_fisher_01` | Create new batch, log landing weight, generate genesis QR code |
| ⚖️ **Trader** | **Ganesh Pai** | `ganesh.trader@gmail.com` | `2222` | Coastal Traders & Auctions | Mangaluru Auction Yard | `usr_trader_01` | Check counterparty trust, log auction purchase (₹/kg), accept handover |
| 🏭 **Processor** | **Sunil Shenoy** | `sunil.processor@gmail.com` | `3333` | Coastal Foods Pvt Ltd | Baikampady Industrial Estate | `usr_proc_01` | Log intake & fillet output weight, auto-calculate Yield % |
| 🚚 **Transporter**| **Mohammed Rafi** | `rafi.logistics@gmail.com` | `4444` | Express Cold Logistics | NH 75 Mangaluru-Bengaluru | `usr_trans_01` | Log reefer route, checkpoints, and cold-chain temperature (°C) |
| 🏪 **Seller** | **Anand Kumar** | `anand.seafood@gmail.com` | `5555` | Ocean Fresh Seafood Market | Bengaluru Wholesale Market | `usr_seller_01` | Log final retail sale, lock batch to `SOLD`, view Certificate of Origin |
| 🛡️ **Admin** | **Dr. K. V. Adiga** | `adiga.fisheries@gmail.com` | `9999` | Karnataka Fisheries Dept | Mangaluru Regional Office | `usr_admin_01` | Statewide dashboard, audit temperature/weight alerts, verify SHA-256 |
| 🌐 **Public** | **Any Consumer** | *No Email Required* | *No PIN* | General Public / Food Inspector | Karnataka & Worldwide | *N/A* | Scan QR or lookup Batch ID without logging in |

---

### ⚡ Quick Copy-Paste Cards (For Presenter / Pitcher)

Use these quick copy blocks during your live pitch:

```
Role: 1. Fisher
Email: ramesh.fisher@gmail.com
PIN:   1111
Action: Create batch -> Enter 250 kg Mackerel -> Mint QR tag
```

```
Role: 2. Trader
Email: ganesh.trader@gmail.com
PIN:   2222
Action: Record Purchase -> ₹180/kg -> Accept handover from Fisher
```

```
Role: 3. Processor
Email: sunil.processor@gmail.com
PIN:   3333
Action: Record Processing -> 220 kg input / 180 kg output -> 81.8% Yield
```

```
Role: 4. Transporter
Email: rafi.logistics@gmail.com
PIN:   4444
Action: Record Transit -> Mangaluru to Bengaluru -> Temp: +1.8°C
```

```
Role: 5. Seller / Vendor
Email: anand.seafood@gmail.com
PIN:   5555
Action: Record Final Sale -> Status transitions to SOLD -> Origin Certificate
```

```
Role: 6. System Administrator
Email: adiga.fisheries@gmail.com
PIN:   9999
Action: Open /alerts -> Audit anomalies -> Run SHA-256 mathematical proof
```

---

### 🔍 Demo Batch IDs for Instant Public & Audit Verification

When presenting the public lookup or integrity verification, use these pre-seeded batch IDs:

| Batch ID | Demonstration Highlight | What Judges / Audience Will See |
| :--- | :--- | :--- |
| **`FB-20261028-0001`** | **100% Intact & Verified Journey** | Complete 5-step unbroken chain from Mangaluru landing to Bengaluru retail sale. Clicking **Verify Integrity** shows a **Green Certified Hash Badge**. |
| **`FB-20261028-0011`** | **Cryptographic Tamper Detection** | Simulates database tampering at Step #2. Clicking **Verify Integrity** shows a **Red Cryptographic Alert** identifying the exact altered block! |
| **`FB-20261028-0003`** | **Cold Chain Temperature Breach** | Reefer transit temperature logged at `+6.8°C` (violating `+4.0°C` threshold), automatically raising a high-severity alert. |
| **`FB-20261028-0015`** | **Weight Loss Anomaly (>20%)** | Biomass dropped from 300 kg to 210 kg during transit, triggering an automated theft/shrinkage flag. |
| **`FB-20261028-0008`** | **Transit Delay Anomaly (>6 hrs)** | Excessive gap between dockside landing and procurement, flagging potential spoilage. |

---

### 💡 How to Log In During the Pitch

Type the stakeholder email (e.g. `ramesh.fisher@gmail.com`) and 4-digit PIN (`1111`) directly into the login inputs to demonstrate genuine role-agnostic authentication backed by bcrypt hashing and signed JWT tokens. No manual role selection required—identity and permissions are resolved automatically from your credentials!

---

## 🌟 Key Features & Innovations

1. **Top Horizontal Navigation & Clean Pitch Workflow**:
   - Modern enterprise SaaS top horizontal navigation bar (~72px tall) with zero disruptive sidebars.
   - Dynamic role-aware navigation links tailored specifically to the active stakeholder—with **Alerts** and the **Notification Bell** strictly reserved for the Administrator role for state-wide regulatory oversight.
   - Pitch-ready profile page with initials-based avatars, verified credentials, and a single-click **"Sign Out & Switch Account"** action to transition smoothly between stakeholder roles during demonstrations.

2. **Tamper-Evident SHA-256 Hash Chain**:
   - Every custody event computes an immutable cryptographic hash:  
     $$\text{hash} = \text{SHA-256}(\text{batch\_id} + \text{seq} + \text{event\_type} + \text{actor\_id} + \text{weight\_kg} + \text{occurred\_at} + \text{notes} + \text{prev\_hash})$$
   - Real-time **"Verify Integrity"** engine:
     - **Green Valid Record**: Confirms all 5 steps are 100% intact and mathematically verified (e.g. `FB-20261028-0001`).
     - **Red Integrity Failure**: Pinpoints the exact corrupted block if database records are manipulated out-of-band (e.g. `FB-20261028-0011`).

3. **Two-Party Handover Confirmation & Dispute Mechanism**:
   - When an upstream actor logs a handover, the receiving counterparty verifies weight, cold-chain conditions, and fish grade directly in the timeline.
   - Receiving actors can **Accept** the handover or file a formal **Dispute** with reason notes and grade remarks, automatically alerting authorities.

4. **Dynamic Stakeholder Trust Scoring**:
   - Live reputation engine evaluating confirmed vs disputed transactions:
     $$\text{Trust Score} = \frac{\text{Confirmed Count}}{\text{Confirmed Count} + \text{Disputed Count}} \times 100$$
   - Displays real-time counterparty trust badges before logging handovers.

5. **Official A4 PDF Audit Report & Print Engine**:
   - Dedicated print-optimized A4 report generator (`hidden print:block`, `print:hidden` for web chrome).
   - Formatted with official logo, certified SHA-256 hash proof, full custody audit table with all chronological events, high-resolution QR code, and regulatory signature block.
   - One-click PDF export icon on desktop and mobile batch tables with clean file naming (`CatchTrace-Report-FB-XXXX.pdf`).

6. **Automated Anomaly & Alerts Engine**:
   - **Weight Loss Alerts**: Flags weight drops exceeding 15–20% between non-processing steps.
   - **Cold Chain Excursions**: Flags reefer transit temperatures above +4.0°C.
   - **Transit Delays**: Flags gaps exceeding 6 hours between dockside handovers.
   - **Missing Steps**: Flags terminal retail sales logged without required prior stages.
   - **Duplicate Detection**: Prevents duplicate submissions within 5 minutes.
   - **Integrity Disputes**: Instantly flags counterparty handover disputes with `HIGH` severity.

7. **Dual Language Toggle (English & ಕನ್ನಡ)**:
   - Instant English and authentic Coastal Kannada UI translation across 100% of visible screens without page reloads.
   - Includes coastal marine species vocabulary (ಬಂಗುಡೆ, ಬೂತಾಯಿ, ಮಾಂಜಿ, ಕುಬ್ಬೆ, ಸಿಗಡಿ) and regional landing centres.

8. **Hardware QR Scanner & Instant Generator**:
   - Generates high-resolution vector QR tags encoding the public trace route.
   - Built-in camera scanner powered by `html5-qrcode` for dockside smartphone camera and webcam scanning.

9. **Fully Responsive Across All Viewports**:
   - Optimized for mobile smartphones, tablets, laptops, and ultra-wide displays with responsive cards, touch-friendly tap targets, and scrollable audit tables.

---

## 🛠️ Project Architecture

```
catch-trace/
├── client/                     # React 18 + Vite + Tailwind CSS Frontend
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── navigation/     # Top Horizontal Navbar, PublicNavbar, Footer
│   │   │   ├── common/         # StatCards, StatusBadges, PageHeaders, UserAvatar, Logos
│   │   │   ├── qr/             # QRCodeCard, QRScannerModal
│   │   │   ├── timeline/       # Vertical Timeline, IntegrityCard, DisputeModal
│   │   │   ├── batches/        # BatchTable & responsive mobile cards (with PDF export)
│   │   │   └── alerts/         # AlertTable, ResolveAlertModal
│   │   ├── pages/              # 13 Full Screen Views
│   │   │   ├── Home.jsx        # Public Landing Page (Responsive Hero & Process)
│   │   │   ├── Login.jsx       # 6-Role Credential & PIN Login
│   │   │   ├── Register.jsx    # New Operator Onboarding
│   │   │   ├── Dashboard.jsx   # Top-nav SaaS Dashboard with Recharts
│   │   │   ├── Batches.jsx     # Batch search & multi-filter catalog
│   │   │   ├── NewBatch.jsx    # Fisher landing entry & live QR card
│   │   │   ├── AddEvent.jsx    # Role-aware forms (Purchase/Process/Transit/Sale)
│   │   │   ├── BatchDetails.jsx# Internal timeline, Verify Integrity & A4 PDF Report
│   │   │   ├── Certificate.jsx # Verified Certificate of Origin export
│   │   │   ├── PublicTrace.jsx # Consumer public trace view (no login)
│   │   │   ├── ScanQR.jsx      # Dedicated camera viewfinder scanner
│   │   │   ├── Alerts.jsx      # Admin anomaly audit & resolution
│   │   │   ├── Reports.jsx     # Analytics & Master CSV Export
│   │   │   ├── Profile.jsx     # Pitch-ready profile & Switch Account workflow
│   │   │   └── Settings.jsx    # Language & demo reset sandbox
│   │   ├── context/            # AuthContext, LanguageContext
│   │   ├── locales/            # en.json, kn.json (Exhaustive bilingual dictionaries)
│   │   └── services/           # api.js & realistic mock dataset (29+ batches)
│   └── package.json
├── server/                     # Node.js + Express REST API
│   ├── src/
│   │   ├── routes/             # auth, batches, public, dashboard, alerts, export
│   │   ├── services/           # hashChain.js, alertsEngine.js, batchId.js
│   │   ├── data/               # In-memory mock DB & seed dataset
│   │   └── index.js
│   └── package.json
├── docs/                       # Project Documentation
│   ├── PRD.md                  # Product Requirements Document (v2.1)
│   └── TRD.md                  # Technical Requirements Document (v2.1)
└── README.md                   # This project guide & demo documentation
```

---

## 💻 Getting Started

### 1. Run Backend API Server
```bash
cd server
npm install
npm start
```
The Express REST API will start on `http://localhost:5000`.

### 2. Run Frontend Client
```bash
cd client
npm install
npm run dev -- --host 0.0.0.0 --port 5173
```
The web application will be live at `http://localhost:5173`.

*(Note: The frontend includes a comprehensive local service fallback layer pre-seeded with 29+ batches, so the full demonstration functions smoothly even if run standalone!)*

---

## 🏆 Pitch Presentation & Demo Script (Step-by-Step)

During your presentation to hackathon judges or investors, follow this sequential walkthrough to highlight each role:

1. **Ocean Landing to Retail Overview (45s)**:
   - Open `/` to show the public landing page with trust indicators, live stats, and the 5-stage chain of custody.
   - Enter `FB-20261028-0001` in the header or click **Trace Batch** to demonstrate the public consumer trace page (`/trace/FB-20261028-0001`) with zero login required.

2. **Role 1: Fisher (Ramesh Naik) — Catch Registration (45s)**:
   - Navigate to `/login`, select **Fisher** or enter `ramesh.fisher@gmail.com` with PIN `1111`, and sign in.
   - Notice the top navigation bar tailored to the Fisher role (`+ Create Batch`, `My Batches`).
   - Go to **Create Batch**, select *Indian Mackerel*, enter weight `250 kg`, boat *Sea Queen Trawler III*, harbour *Mangaluru*, and click **Create Batch**.
   - Show the newly minted Batch ID (`FB-20261029-XXXX`), genesis SHA-256 block, and downloadable QR code tag.
   - Navigate to **Profile**, show the verified credential tile and click **Sign Out & Switch Account**.

3. **Role 2: Trader (Ganesh Pai) — Auction Purchase & Handover (45s)**:
   - Sign in as **Trader** (`ganesh.trader@gmail.com`) with PIN `2222`.
   - Go to `/add-event` -> the form automatically adapts to **Purchase / Auction**.
   - Input the Batch ID, observe the counterparty trust score badge, enter purchase weight and ₹/kg.
   - Open the batch timeline to **Accept** the landing handover, updating the confirmation status.
   - Sign out from Profile to switch to Processor.

4. **Role 3: Processor (Sunil Shenoy) — Yield & Blast Freezing (30s)**:
   - Sign in as **Processor** (`sunil.processor@gmail.com`) with PIN `3333`.
   - Go to `/add-event` -> enter input weight `220 kg` and output packaged fillets `180 kg`.
   - Point out the automatic **Yield %** calculation (e.g. 81.8%).

5. **Role 4: Transporter (Mohammed Rafi) — Cold Chain Telemetry (30s)**:
   - Sign in as **Transporter** (`rafi.logistics@gmail.com`) with PIN `4444`.
   - Record cold-chain route (Mangaluru to Bengaluru) and enter refrigerated storage temperature (`+1.8°C`).

6. **Role 5: Seller (Anand Kumar) — Retail Sale & Final Sealing (30s)**:
   - Sign in as **Seller** (`anand.seafood@gmail.com`) with PIN `5555`.
   - Record the final sale to retail consumers and click **Complete Sale**.
   - The batch lifecycle status transitions to **`SOLD`**, locking the chain against downstream modification.
   - View the generated **Verified Certificate of Origin** (`/batches/:id/certificate`).

7. **Role 6: Admin (Dr. K. V. Adiga) — Anomaly Audit & Cryptographic Proof (45s)**:
   - Sign in as **Admin** (`adiga.fisheries@gmail.com`) with PIN `9999`.
   - Open `/alerts` to showcase automated flags:
     - Temperature breach (> 4.0°C)
     - Weight loss variance (> 20%)
     - Handover dispute flag
   - Open batch `FB-20261028-0001` -> Click **"Verify Integrity"** -> Green mathematical proof.
   - Open tampered batch `FB-20261028-0011` -> Click **"Verify Integrity"** -> Red cryptographic alert pinpointing the exact corrupted block.
   - Open `/batches` and click the **PDF icon** to generate the official A4 audit report.
   - Toggle **`🌐 ಕನ್ನಡ`** to prove 100% native language inclusivity.

---

## 📚 Complete Project Documentation

- **[Product Requirements Document (PRD v2.1)](file:///d:/freeLancing/catch-trace/docs/PRD.md)**: Product vision, user personas, functional specifications, dispute workflow, PDF reports, and success metrics.
- **[Technical Requirements Document (TRD v2.1)](file:///d:/freeLancing/catch-trace/docs/TRD.md)**: System architecture, cryptographic SHA-256 hash chaining, dispute endpoints, automated alerts engine, REST API interface, and print stylesheet mechanics.
