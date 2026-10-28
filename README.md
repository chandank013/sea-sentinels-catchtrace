# CatchTrace — From Ocean to Your Plate 🐟⚓
> **Problem Statement 6: Fragmented Digital Records Across the Fish Supply Chain**  
> **Team Sea Sentinels** · LEAP Hackathon Mangaluru · 28–29 Oct 2026

CatchTrace is a production-ready fish supply-chain traceability platform connecting fishers, traders, processors, cold transporters, retailers, and end consumers. Every handover is hashed with SHA-256 in sequence, creating an immutable cryptographic chain of custody. Anyone can scan a batch's QR code on their phone to verify its entire journey from harbour landing to plate without login.

---

## 🚀 Live Demo Accounts & PINs

| Role | Name | Organization | Demo PIN | Capabilities |
| :--- | :--- | :--- | :--- | :--- |
| **Fisher** | Ramesh Naik | Sea Queen Trawlers | `1111` | Record catch landing, initial weight & generate QR |
| **Trader** | Ganesh Pai | Coastal Traders & Auctions | `2222` | Record harbour auction purchase, price/kg, and buyer |
| **Processor** | Sunil Shenoy | Coastal Foods Pvt Ltd | `3333` | Record input/output weight, auto-calculate yield % |
| **Transporter**| Mohammed Rafi| Express Cold Logistics | `4444` | Record transit route, duration, and cold-chain temp (°C)|
| **Seller** | Anand Kumar | Ocean Fresh Seafood Market | `5555` | Record final retail sale, finalize batch status to `SOLD`|
| **Admin** | Dr. K. V. Adiga | Karnataka Fisheries Dept | `9999` | System-wide audit, resolve anomaly flags, SHA-256 verify|
| **Consumer** | Anyone | Public | *No Login* | Scan QR code or enter Batch ID for public trace |

---

## 🌟 Key Features & Hackathon Demos

1. **Strictly No Sidebar After Login**:
   - Clean, modern SaaS top horizontal navigation bar (~72px tall).
   - Role-aware navigation links tailored specifically to Fisher, Trader, Processor, Transporter, Seller, and Admin.

2. **Tamper-Evident SHA-256 Hash Chain**:
   - Every event computes:  
     `hash = SHA-256(batch_id + seq + event_type + actor + weight_kg + time + notes + prev_hash)`
   - Built-in **"Verify Integrity"** engine:
     - **Green Valid Record**: All records intact and untampered (e.g. `FB-20261028-0001`).
     - **Red Integrity Failure**: Pinpoints the exact corrupted block if database records are manipulated (e.g. `FB-20261028-0011`).

3. **Automated Anomaly & Alerts Engine**:
   - **Weight Loss Alerts**: Flags weight drops exceeding 20% (e.g. `FB-20261028-0015`).
   - **Duplicate Entry Alerts**: Prevents duplicate submissions within 5 minutes (e.g. `FB-20261028-0021`).
   - **Long Transit Delays**: Flags gaps exceeding 6 hours after landing (e.g. `FB-20261028-0008`).
   - **Missing Chain Steps**: Flags final sales logged without mandatory prior steps (e.g. `FB-20261028-0019`).

4. **Dual Language Toggle (English & ಕನ್ನಡ)**:
   - Instant English and Kannada UI translation without page reloads.

5. **Built-in QR Generator & Camera Scanner**:
   - Generates real QR codes encoding the public trace URL.
   - Live camera scanning using `html5-qrcode` with manual ID fallback.

---

## 🛠️ Project Architecture

```
catch-trace/
├── client/                     # React 18 + Vite + Tailwind CSS Frontend
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── navigation/     # Top Horizontal Navbar, PublicNavbar, Footer
│   │   │   ├── common/         # StatCards, StatusBadges, PageHeaders, Logos
│   │   │   ├── qr/             # QRCodeCard, QRScannerModal
│   │   │   ├── timeline/       # Vertical Timeline, IntegrityCard
│   │   │   ├── batches/        # BatchTable & responsive cards
│   │   │   └── alerts/         # AlertTable & ResolveAlertModal
│   │   ├── pages/              # 12 Full Screen Views
│   │   │   ├── Home.jsx        # Public Landing Page
│   │   │   ├── Login.jsx       # 6-Role PIN Login
│   │   │   ├── Dashboard.jsx   # Top-nav SaaS Dashboard with Recharts
│   │   │   ├── Batches.jsx     # Batch search & multi-filter catalog
│   │   │   ├── NewBatch.jsx    # Fisher landing entry & live QR card
│   │   │   ├── AddEvent.jsx    # Role-aware forms (Purchase/Process/Transit/Sale)
│   │   │   ├── BatchDetails.jsx# Internal timeline & Verify Integrity check
│   │   │   ├── PublicTrace.jsx # Consumer public trace view (no login)
│   │   │   ├── ScanQR.jsx      # Dedicated camera viewfinder scanner
│   │   │   ├── Alerts.jsx      # Admin anomaly audit & resolution
│   │   │   ├── Reports.jsx     # Analytics & Master CSV Export
│   │   │   ├── Profile.jsx     # Profile & Fast demo account switcher
│   │   │   └── Settings.jsx    # Language & demo reset sandbox
│   │   ├── context/            # AuthContext, LanguageContext
│   │   ├── locales/            # en.json, kn.json
│   │   └── services/           # api.js & realistic mock dataset (30+ batches)
│   └── package.json
└── server/                     # Node.js + Express REST API
    ├── src/
    │   ├── routes/             # auth, batches, public, dashboard, alerts, export
    │   ├── services/           # hashChain.js, alertsEngine.js, batchId.js
    │   └── index.js
    └── package.json
```

---

## 💻 Getting Started

### 1. Run Frontend (Client)
```bash
cd client
npm install
npm run dev
```
The application will be live at `http://localhost:5173`.

### 2. Run Backend (Optional / Ready for Full-Stack)
```bash
cd server
npm install
npm start
```
The backend API will run on `http://localhost:5000`.
*(Note: If the backend is offline, the frontend seamlessly uses its rich local storage mock engine with all 30+ batches and anomaly checks intact!)*

---

## 🏆 Demo Script (for Hackathon Judges)

1. **Landing & Public Lookup (30s)**:
   - Open `/` to view the public landing page with trust indicators and supply chain process.
   - Enter `FB-20261028-0001` or click **Trace Batch** to show the public consumer trace page with zero login required.

2. **Role-Based Fast Login (20s)**:
   - Go to `/login`, select **Fisher**, click the demo chip for PIN `1111`, and log in.
   - Notice the **horizontal top navigation bar** (absolutely no permanent sidebar).

3. **Create Batch & Generate QR (30s)**:
   - Navigate to **Create Batch**, fill in landing parameters (e.g. Mackerel, 250kg, Mangaluru Harbour), click **Create Batch**.
   - See the generated batch ID, the live QR code, and download/print buttons.

4. **Add Role-Aware Events (45s)**:
   - Switch role to **Trader** (PIN `2222`) -> Form automatically becomes **Record Purchase** with price/kg calculation.
   - Switch to **Processor** (PIN `3333`) -> Form automatically calculates **Yield %** (e.g., 81.8%).
   - Switch to **Transporter** (PIN `4444`) -> Form records cold-chain temperature and transit route.
   - Switch to **Seller** (PIN `5555`) -> Form records final sale and seals batch status to **SOLD**.

5. **Audit Alerts & Cryptographic Integrity (45s)**:
   - Switch to **Admin** (PIN `9999`) -> Open `/alerts` to inspect automated flags (e.g. weight drop > 20%, 48h delay).
   - Open batch `FB-20261028-0001` -> Click **"Verify Integrity"** -> Green verified checkmark.
   - Open tampered batch `FB-20261028-0011` -> Click **"Verify Integrity"** -> Red cryptographic failure alert identifying Step #2 tampering!

---

## 📚 Project Documentation

Complete, up-to-date specifications reflecting all implemented features:
- **[Product Requirements Document (PRD)](file:///d:/freeLancing/catch-trace/docs/PRD.md)**: Product vision, user personas, functional specifications, permission matrix, and success metrics.
- **[Technical Requirements Document (TRD)](file:///d:/freeLancing/catch-trace/docs/TRD.md)**: System architecture, cryptographic SHA-256 hash chaining, automated alerts engine, REST API endpoints, i18n architecture, and security design.
