# 🚗 KentekenCheck Platform

> **The Netherlands' most complete vehicle license plate lookup platform** — built on Next.js, powered by RDW government open data, enriched with premium third-party sources, and designed to outperform every existing competitor in UX, speed, and data depth.

---

## Table of Contents

1. [What This Platform Is](#1-what-this-platform-is)
2. [How It Works — The Core Concept](#2-how-it-works--the-core-concept)
3. [Competitor Landscape](#3-competitor-landscape)
4. [Data Sources & APIs](#4-data-sources--apis)
   - 4.1 [RDW Open Data (Free — No API Key)](#41-rdw-open-data-free--no-api-key)
   - 4.2 [Premium Paid Sources](#42-premium-paid-sources)
   - 4.3 [License Plate Format & Normalization](#43-license-plate-format--normalization)
5. [System Architecture](#5-system-architecture)
6. [Tech Stack](#6-tech-stack)
7. [Project Structure](#7-project-structure)
8. [Database Schema](#8-database-schema)
9. [Caching Strategy](#9-caching-strategy)
10. [API Endpoints (Internal)](#10-api-endpoints-internal)
11. [Business Model & Revenue Tiers](#11-business-model--revenue-tiers)
12. [Admin Panel](#12-admin-panel)
13. [AI Report Generation (OpenAI)](#13-ai-report-generation-openai)
14. [Implementation Phases](#14-implementation-phases)
15. [Environment Variables](#15-environment-variables)
16. [Getting Started (Local Dev)](#16-getting-started-local-dev)
17. [Deployment](#17-deployment)
18. [GDPR & Legal Compliance](#18-gdpr--legal-compliance)
19. [Security](#19-security)
20. [Roadmap](#20-roadmap)

---

## 1. What This Platform Is

**KentekenCheck** is a full-stack vehicle data platform built for the Dutch market. It allows anyone to enter a Dutch license plate number (kenteken) and instantly receive a comprehensive vehicle profile — for free, with no account required.

The platform is built on a **freemium model**:

- **Free tier** — full RDW government data: make, model, year, color, fuel type, APK (MOT) history, recall status, emissions, and more. No account needed.
- **Premium tier** — enriched report: full mileage history (NAP), damage and accident records (CARFAX Europe), market valuation (VWE), manufacturer options, and a downloadable PDF.
- **B2B API tier** — bulk lookups, JSON API access, and white-label widgets for car dealers, insurers, and leasing companies.

The Netherlands is one of the most favorable markets in the world to build this kind of platform because the national vehicle authority — **RDW (Rijksdienst voor het Wegverkeer)** — publishes its entire vehicle registration database as free, open, public JSON APIs with no API key required. This is the same data that powers every major kenteken lookup site in the country.

---

## 2. How It Works — The Core Concept

```
User enters plate  →  Backend normalizes plate  →  5 RDW APIs called in parallel
        ↓
   Redis cache checked first (24hr TTL)
        ↓
   Results merged into unified vehicle object
        ↓
   Free result displayed instantly
        ↓
   Optional: Premium enrichment (mileage, damage, valuation) — paid
        ↓
   Optional: AI summary generated via OpenAI API
        ↓
   Optional: Admin approval before delivery (configurable)
```

### Search Flow in Detail

1. **Input** — User types a plate like `16-RSL-9` (with or without hyphens).
2. **Normalize** — Frontend strips hyphens, uppercases → `16RSL9`. Validates against all 7 known Dutch plate formats.
3. **Cache check** — Backend checks Redis. If found and < 24 hours old, return cached result immediately (< 100ms).
4. **API fan-out** — On cache miss, 5 RDW API calls are made **in parallel** using `Promise.all()`:
   - Vehicle registration data
   - Fuel type & emissions
   - APK inspection history
   - Recall campaigns
   - Body/chassis classification
5. **Merge** — All responses combined into a single structured `VehicleProfile` object.
6. **Cache write** — Result stored in Redis with 24-hour TTL.
7. **Render** — Next.js server component renders the vehicle card.

Total response time: **< 100ms** for cached, **300–600ms** for uncached.

---

## 3. Competitor Landscape

Understanding the existing market is essential context for every product and architecture decision.

| Platform | Free Data | Paid Report Price | Key Differentiator | Weakness |
|---|---|---|---|---|
| **kentekencheck.nl** | Brand, model, APK date, color | ~€5–8 | Community spotting, large app install base | Dated UI, no English |
| **carVertical.com/nl** | Preview only (no free data) | ~€12–20 | Blockchain-verified, international damage DB | Expensive, not Dutch-first |
| **kentekenverslag.nl** | Basic RDW fields | ~€4.95–9.95 | Clean single-purpose UI | No mobile app, no B2B API |
| **carscanner.nl** | Basic RDW lookup | OBD diagnostics | OBD hardware integration | Not a data-first platform |
| **RDW opendata.rdw.nl** | All vehicle data (free) | N/A | Official government source | Raw data, no UX layer |
| **Our Platform** | Full RDW (all fields) | €6.95 | Modern UX, English support, AI summaries, B2B API | — |

### Our Competitive Advantages

- **Full free tier** — we give more for free than any competitor, building trust and search volume.
- **Modern, mobile-first UX** — most Dutch kenteken sites were built in 2012 and look like it.
- **English language** — a largely unserved market of 500,000+ expats in the Netherlands.
- **AI-powered summaries** — plain-language report narrative, not just raw data tables.
- **B2B API** — car dealers and insurers pay recurring subscription fees, not one-off reports.
- **Admin approval workflow** — configurable quality gate on AI-generated content before delivery.

---

## 4. Data Sources & APIs

### 4.1 RDW Open Data (Free — No API Key)

**RDW (Rijksdienst voor het Wegverkeer)** is the Dutch national vehicle registration authority. All non-sensitive data is published as open data via the [Socrata](https://opendata.rdw.nl) platform.

**License:** Creative Commons CC-0 (public domain). Commercial use unrestricted.  
**Authentication:** None required.  
**Format:** REST/JSON.  
**Base URL:** `https://opendata.rdw.nl/resource/{DATASET_ID}.json`

#### Core Datasets

| Dataset | Endpoint ID | Fields |
|---|---|---|
| **Gekentekende Voertuigen** (Main) | `m9d7-ebf2` | brand, trade name, model, year, color (primary + secondary), body type, seats, doors, axles, weight (empty / max / payload), APK expiry date, import date, number of previous owners, WOK/salvage flag |
| **Brandstof** (Fuel & Emissions) | `8ys7-d773` | fuel type (petrol / diesel / LPG / electric / hybrid / hydrogen), CO2 emissions (g/km), fuel consumption (city / highway / combined), energy label |
| **Keuringen** (APK Inspections) | `a34c-vvps` | inspection date, pass/fail result, mileage at inspection, inspection station |
| **Geconstateerde Gebreken** (Defects) | `hx2c-gt7k` | specific defect codes found at each inspection, severity classification |
| **Carrosserie** (Body/Chassis) | `vezc-m2t6` | detailed body classification, chassis type |
| **Typegoedkeuringen** (Type Approvals) | `55kv-xf7m` | EU type approval number, manufacturer technical specs, homologation data |
| **Terugroepacties** (Recalls) | `af5r-44mf` | all active and historical recall campaigns, recall description, affected VIN ranges |
| **Erkende Bedrijven** (Approved Garages) | `5k74-3jha` | RDW-certified workshops, their certifications, address, contact |

#### Example API Calls

```bash
# Main vehicle data
GET https://opendata.rdw.nl/resource/m9d7-ebf2.json?kenteken=16RSL9

# Fuel type & emissions
GET https://opendata.rdw.nl/resource/8ys7-d773.json?kenteken=16RSL9

# APK inspection history
GET https://opendata.rdw.nl/resource/a34c-vvps.json?kenteken=16RSL9

# Active recall campaigns
GET https://opendata.rdw.nl/resource/af5r-44mf.json?kenteken=16RSL9

# Body/chassis details
GET https://opendata.rdw.nl/resource/vezc-m2t6.json?kenteken=16RSL9

# With SoQL query syntax (Socrata Query Language)
GET https://opendata.rdw.nl/resource/m9d7-ebf2.json?$where=kenteken='16RSL9'&$limit=1
```

#### What RDW Free Data Includes

- ✅ Vehicle brand, trade name, model variant
- ✅ First registration date (Netherlands + worldwide)
- ✅ Current color (primary + secondary)
- ✅ Body type (sedan, SUV, estate, MPV, etc.)
- ✅ Number of doors, seats, axles
- ✅ Empty weight, max permissible weight, payload
- ✅ Fuel type(s) including hybrid/EV specifications
- ✅ Engine displacement, cylinders, power (kW)
- ✅ CO2 emissions (g/km), fuel consumption figures
- ✅ APK (MOT) expiry date
- ✅ APK inspection history (dates, pass/fail, mileage readings)
- ✅ Specific defects recorded at each inspection
- ✅ Number of previous owners (count only — not identities)
- ✅ Import/export status
- ✅ Transfer status (tenaamstelling mogelijk)
- ✅ WOK / salvage status flag
- ✅ Active recall campaigns with descriptions
- ✅ EU type approval technical specifications

#### What RDW Does NOT Include

- ❌ Owner name, address, or any personal data (GDPR / privacy law)
- ❌ Full mileage history — only mileage at inspection points
- ❌ Damage or accident records
- ❌ Insurance status or claims history
- ❌ Market value or pricing
- ❌ Advertisement history
- ❌ Stolen vehicle flag (available via paid RDW B2B service)

---

### 4.2 Premium Paid Sources

These are integrated in **Phase 3** to power the paid premium report tier.

| Data Type | Provider | Access | Approx. Cost |
|---|---|---|---|
| **Full mileage history (NAP)** | RDW Business / VWE Automotive | Paid partner account via `rdw.nl/zakelijk` | ~€0.20–0.50 / query |
| **Damage & accident history** | CARFAX Europe | B2B API — `carfax.eu/b2b` | ~€1–3 / report |
| **Market valuation** | VWE Automotive / EurotaxGlass's | Commercial API license | ~€0.10–0.50 / query |
| **Manufacturer options & specs** | VWE Automotive | Commercial partnership — `vwe.nl` | Custom pricing |
| **Stolen vehicle flag** | RDW Betaald Toegang | Paid B2B subscription | Per-query pricing |
| **Insurance status** | Verbond van Verzekeraars | Industry membership required | Custom |

> **Note on NAP (Nationale AutoPas):** Since 2014, RDW manages the NAP mileage database. It records odometer readings at every APK inspection, workshop service (invoices > €150), and ownership transfer. The inspection-point readings are partially available in the free Keuringen dataset; the full continuous mileage timeline requires paid B2B access.

---

### 4.3 License Plate Format & Normalization

Dutch license plates use hyphens visually (e.g., `16-RSL-9`) but the RDW API requires the plate **without hyphens** and in **uppercase** (e.g., `16RSL9`).

```typescript
// utils/normalizePlate.ts
export function normalizePlate(input: string): string {
  return input.replace(/-/g, '').toUpperCase().trim();
}
```

#### The 7 Dutch Plate Series (Formats)

The Netherlands has gone through multiple plate series since 1951. All are still in circulation:

| Series | Format | Example | Era |
|---|---|---|---|
| 1 | `LL-DD-DD` | AB-12-34 | 1951–1965 |
| 2 | `DD-LL-DD` | 12-AB-34 | 1965–1973 |
| 3 | `DD-DD-LL` | 12-34-AB | 1973–1978 |
| 4 | `LL-DD-LL` | AB-12-CD | 1978–1991 |
| 5 | `LL-LL-DD` | AB-CD-12 | 1991–1999 |
| 6 | `DD-LL-LL` | 12-AB-CD | 1999–2008 |
| 7 | `LL-DDD-L` | AB-123-C | 2008–present |

The plate validator should accept all 7 formats and reject anything that doesn't match, giving the user an early error before any API call is made.

---

## 5. System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND LAYER                        │
│  Next.js 14 (App Router)  ·  TypeScript  ·  TailwindCSS     │
│  Server Components + Client Components  ·  React Native App  │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP / Server Actions
┌──────────────────────────▼──────────────────────────────────┐
│                        BACKEND LAYER                         │
│  Next.js API Routes  ·  Node.js  ·  JWT Auth                 │
│  Rate Limiter (100 req/min per IP)  ·  Stripe / Mollie       │
│  PDF Generator (Puppeteer)  ·  OpenAI API Integration        │
└────────────┬───────────────────────────────┬────────────────┘
             │                               │
┌────────────▼──────────┐      ┌─────────────▼───────────────┐
│      CACHE LAYER       │      │       DATABASE LAYER         │
│  Redis                 │      │  PostgreSQL (Prisma ORM)     │
│  TTL: 24 hours         │      │  Users, Reports, Searches    │
│  ~100ms response       │      │  Audit logs, Subscriptions   │
└───────────────────────┘      └─────────────────────────────┘
             │
┌────────────▼──────────────────────────────────────────────┐
│                      DATA SOURCE LAYER                      │
│                                                             │
│  FREE (RDW Socrata API)           PAID (Phase 3)           │
│  ├─ m9d7-ebf2 (Vehicle)           ├─ RDW Business (NAP)   │
│  ├─ 8ys7-d773 (Fuel)              ├─ VWE Automotive        │
│  ├─ a34c-vvps (APK/Keuringen)     ├─ CARFAX Europe         │
│  ├─ hx2c-gt7k (Defects)           └─ EurotaxGlass's        │
│  ├─ af5r-44mf (Recalls)                                    │
│  └─ vezc-m2t6 (Body/Chassis)                               │
└───────────────────────────────────────────────────────────┘
```

### Infrastructure

- **Cloud Provider:** DigitalOcean (Amsterdam region) or AWS (Frankfurt) — EU data residency for GDPR
- **Containerization:** Docker + Docker Compose for local dev; Docker Swarm or managed Kubernetes for production
- **CDN:** Cloudflare (free tier) — DDoS protection, bot filtering, edge caching for static assets
- **CI/CD:** GitHub Actions — automated tests on push, zero-downtime deployment on merge to `main`
- **Monitoring:** Uptime Robot (5-minute checks) + Sentry (error tracking)
- **Backups:** Automated nightly PostgreSQL dumps to S3/Spaces, retained 30 days

---

## 6. Tech Stack

| Layer | Technology | Reason |
|---|---|---|
| **Framework** | Next.js 14 (App Router) | SSR for SEO, built-in API routes, server components |
| **Language** | TypeScript | Type safety across frontend and backend |
| **Styling** | TailwindCSS | Rapid UI development, consistent design tokens |
| **Database** | PostgreSQL | Native JSON support, concurrent read/write, ACID compliance |
| **ORM** | Prisma | Type-safe DB queries, auto-generated migrations |
| **Cache** | Redis | Sub-millisecond cache reads, TTL support, Pub/Sub for notifications |
| **Auth** | NextAuth.js | JWT sessions, OAuth (Google), email/password |
| **Payments** | Mollie (primary) / Stripe | iDEAL support (essential for NL), recurring subscriptions |
| **PDF Generation** | Puppeteer | Renders HTML templates to PDF for premium reports |
| **AI** | OpenAI GPT-4o | Natural language vehicle report summaries |
| **Email** | Resend / Mailgun | Transactional emails (report ready, account, receipts) |
| **Mobile** | React Native (Expo) | Shared business logic with web app |
| **Hosting** | DigitalOcean / AWS | EU data centers, Docker support, managed DB options |
| **CI/CD** | GitHub Actions | Automated testing + deployment pipeline |
| **Monitoring** | Sentry + Uptime Robot | Error tracking + uptime alerting |

---

## 7. Project Structure

```
kenteken-platform/
├── app/                          # Next.js App Router
│   ├── (marketing)/              # Public pages (landing, about, pricing)
│   │   ├── page.tsx              # Homepage with search bar
│   │   └── pricing/page.tsx
│   ├── (platform)/               # Authenticated platform pages
│   │   ├── search/
│   │   │   └── [plate]/page.tsx  # Vehicle result page
│   │   ├── reports/
│   │   │   └── [id]/page.tsx     # Premium report view
│   │   └── account/page.tsx
│   ├── admin/                    # Admin panel (protected)
│   │   ├── page.tsx              # Dashboard overview
│   │   ├── users/page.tsx
│   │   ├── reports/page.tsx      # Approval queue
│   │   ├── pricing/page.tsx
│   │   └── analytics/page.tsx
│   └── api/                      # API routes
│       ├── vehicle/
│       │   └── [plate]/route.ts  # Core plate lookup endpoint
│       ├── report/
│       │   ├── generate/route.ts # Trigger premium report generation
│       │   └── [id]/route.ts     # Fetch report status/content
│       ├── admin/
│       │   ├── approve/route.ts  # Admin approval endpoint
│       │   └── users/route.ts
│       ├── webhooks/
│       │   └── mollie/route.ts   # Payment webhook handler
│       └── auth/[...nextauth]/route.ts
│
├── components/
│   ├── search/
│   │   ├── SearchBar.tsx         # Plate input with validator
│   │   └── PlateFormatter.tsx    # Real-time plate formatting as user types
│   ├── vehicle/
│   │   ├── VehicleCard.tsx       # Main result card
│   │   ├── SpecsTable.tsx        # Technical specifications
│   │   ├── ApkTimeline.tsx       # Visual APK inspection history
│   │   ├── RecallAlert.tsx       # Recall warning banner
│   │   ├── FuelBadge.tsx         # Fuel type + energy label
│   │   └── OwnerCount.tsx        # Number of previous owners
│   ├── report/
│   │   ├── PremiumGate.tsx       # Upsell component for free users
│   │   ├── MileageChart.tsx      # Mileage over time graph
│   │   ├── DamageHistory.tsx     # Damage/accident section
│   │   └── AiSummary.tsx         # AI-generated narrative
│   ├── admin/
│   │   ├── ApprovalQueue.tsx     # Pending AI reports list
│   │   ├── RevenueChart.tsx
│   │   └── UserTable.tsx
│   └── ui/                       # Shared UI primitives
│
├── lib/
│   ├── rdw/
│   │   ├── client.ts             # RDW API fetch wrapper with error handling
│   │   ├── endpoints.ts          # All RDW dataset IDs and URL builders
│   │   ├── normalize.ts          # Plate normalization + format validator
│   │   └── types.ts              # TypeScript types for all RDW response shapes
│   ├── premium/
│   │   ├── vwe.ts                # VWE Automotive API adapter
│   │   ├── carfax.ts             # CARFAX Europe API adapter
│   │   └── rdwBusiness.ts        # RDW paid B2B API adapter
│   ├── openai/
│   │   ├── generateSummary.ts    # Prompt builder + OpenAI call
│   │   └── validateOutput.ts     # Content filter for AI responses
│   ├── cache/
│   │   └── redis.ts              # Redis client + get/set helpers
│   ├── pdf/
│   │   └── generateReport.ts     # Puppeteer PDF generation
│   ├── payments/
│   │   └── mollie.ts             # Mollie payment intent creation
│   └── db/
│       └── prisma.ts             # Prisma client singleton
│
├── prisma/
│   ├── schema.prisma             # Database schema
│   └── migrations/               # Auto-generated migration history
│
├── public/                       # Static assets
├── styles/
│   └── globals.css
├── .env.local                    # Local environment variables (never commit)
├── .env.example                  # Template for required env vars
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── docker-compose.yml            # Local dev: Postgres + Redis
```

---

## 8. Database Schema

```prisma
// prisma/schema.prisma

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  passwordHash  String?
  name          String?
  tier          UserTier  @default(FREE)
  credits       Int       @default(0)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  searches      Search[]
  reports       Report[]
  subscription  Subscription?
}

enum UserTier {
  FREE
  PAY_PER_REPORT
  SUBSCRIBER
  B2B
  ADMIN
}

model Search {
  id          String   @id @default(cuid())
  plate       String   // normalized, no hyphens, uppercase
  userId      String?
  ipHash      String   // hashed for privacy
  resultFrom  String   // "cache" | "api"
  createdAt   DateTime @default(now())

  user        User?    @relation(fields: [userId], references: [id])
}

model VehicleCache {
  plate       String   @id  // normalized plate as PK
  data        Json         // full merged RDW response
  cachedAt    DateTime @default(now())
  expiresAt   DateTime     // cachedAt + 24 hours
}

model Report {
  id              String        @id @default(cuid())
  plate           String
  userId          String
  status          ReportStatus  @default(PENDING_PAYMENT)
  vehicleData     Json          // RDW data snapshot at generation time
  premiumData     Json?         // VWE / CARFAX data
  aiSummary       String?       // OpenAI-generated narrative
  aiPrompt        String?       // stored for audit
  adminReviewed   Boolean       @default(false)
  adminApprovedAt DateTime?
  adminApprovedBy String?
  pdfUrl          String?       // S3 URL of generated PDF
  paymentId       String?       // Mollie payment ID
  amountPaid      Decimal?
  createdAt       DateTime      @default(now())
  deliveredAt     DateTime?

  user            User          @relation(fields: [userId], references: [id])
}

enum ReportStatus {
  PENDING_PAYMENT
  PAID
  GENERATING
  PENDING_APPROVAL   // waiting for admin review
  APPROVED
  DELIVERED
  FAILED
}

model Subscription {
  id              String   @id @default(cuid())
  userId          String   @unique
  mollieSubId     String   @unique
  plan            String   // "dealer_20" | "dealer_unlimited"
  pricePerMonth   Decimal
  reportsPerMonth Int      // -1 = unlimited
  status          String   // "active" | "cancelled" | "past_due"
  currentPeriodEnd DateTime
  createdAt       DateTime @default(now())

  user            User     @relation(fields: [userId], references: [id])
}

model AdminSetting {
  key       String @id
  value     String
  updatedAt DateTime @updatedAt
  // Keys: "premium_report_price", "require_admin_approval",
  //       "free_searches_per_day_anon", "openai_model"
}
```

---

## 9. Caching Strategy

Redis is used as a two-level cache to minimize RDW API calls and maximize response speed.

```
Request for plate "16RSL9"
         │
         ▼
  ┌──────────────┐
  │ Redis cache? │── HIT ──→ Return in < 100ms
  └──────┬───────┘
         │ MISS
         ▼
  ┌─────────────────────────────────────────┐
  │  Promise.all([                           │
  │    fetchVehicle(plate),     // ~200ms    │
  │    fetchFuel(plate),        // ~200ms    │
  │    fetchApk(plate),         // ~200ms    │
  │    fetchRecalls(plate),     // ~200ms    │
  │    fetchBody(plate),        // ~200ms    │
  │  ])                                      │
  │  Total wall time: ~200–400ms (parallel)  │
  └──────────────────┬──────────────────────┘
                     │
                     ▼
             Merge all results
                     │
                     ▼
         Write to Redis (TTL: 24h)
         Write to VehicleCache DB
                     │
                     ▼
             Return to user
             (~300–600ms total)
```

**Cache invalidation:** TTL-based only. 24 hours is appropriate because RDW data changes infrequently (APK once a year, ownership transfers occasionally). We do not implement manual invalidation — stale-by-at-most-24-hours is acceptable for vehicle data.

---

## 10. API Endpoints (Internal)

These are the Next.js API routes that the frontend calls.

### `GET /api/vehicle/[plate]`
Core plate lookup. Returns merged RDW data (free, no auth required).

```typescript
// Response shape
{
  plate: "16RSL9",
  displayPlate: "16-RSL-9",
  fromCache: true,
  cachedAt: "2026-02-01T10:00:00Z",
  vehicle: {
    brand: "Volkswagen",
    tradeName: "Golf",
    variant: "1.4 TSI Comfortline",
    year: 2018,
    color: { primary: "Grijs", secondary: null },
    bodyType: "Hatchback",
    doors: 5,
    seats: 5,
    fuel: { type: "Benzine", co2: 128, consumptionCombined: 5.4 },
    weight: { empty: 1260, max: 1740 },
    engine: { displacement: 1395, cylinders: 4, powerKw: 92 },
    apk: { expiryDate: "2027-03-15", status: "valid" },
    owners: { count: 2 },
    import: { firstRegistrationNL: "2018-04-12", firstRegistrationWorld: "2018-03-01" },
    transfer: { possible: true },
    wok: false,
    recalls: []
  },
  inspections: [
    { date: "2024-03-15", result: "pass", mileage: 54200, station: "AutoTechniek Amsterdam" },
    { date: "2022-03-10", result: "pass", mileage: 38800, station: "Kwikfit Utrecht" }
  ],
  defects: []
}
```

### `POST /api/report/generate`
Initiates premium report generation. Requires authentication + payment.

```typescript
// Request body
{ plate: "16RSL9", reportType: "full" }

// Response
{ reportId: "clx123...", status: "PENDING_PAYMENT", paymentUrl: "https://mollie.com/..." }
```

### `GET /api/report/[id]`
Fetches report status and content (once approved and delivered).

### `POST /api/admin/approve`
Admin-only. Approves a pending AI-generated report.

```typescript
// Request body
{ reportId: "clx123...", action: "approve" | "reject", note?: "Optional reviewer note" }
```

### `POST /api/webhooks/mollie`
Mollie payment webhook. Called by Mollie when payment status changes. Updates report status from `PENDING_PAYMENT` → `PAID` → triggers generation pipeline.

---

## 11. Business Model & Revenue Tiers

### Tier 1 — Free (RDW Data Only)
- No account required
- All RDW open data fields
- APK timeline, recall alerts
- Rate limited: 60 requests/hour per IP

### Tier 2 — Premium Report (€6.95 per report)
- Everything in free tier
- Full NAP mileage history (chart)
- Damage & accident history (CARFAX)
- Market valuation
- Manufacturer options & accessories
- AI-generated buyer summary
- Downloadable PDF
- Admin approval (if enabled)

### Tier 3 — Subscription (€29/month = 20 reports, €79/month = unlimited)
- Same as Premium per report
- Monthly credit allowance
- Priority processing
- Invoice for accounting

### Tier 4 — B2B API (Custom pricing)
- JSON API access with API key
- Bulk CSV plate uploads
- White-label JavaScript widget
- Dealer dashboard
- SLA + dedicated support

---

## 12. Admin Panel

The admin panel is a protected area of the Next.js app, accessible only to users with `tier: ADMIN`. It provides full operational control without requiring code changes.

### Features

| Section | What You Can Do |
|---|---|
| **Dashboard** | Total searches today/week, reports sold, revenue, conversion rate |
| **Report Queue** | View all reports in `PENDING_APPROVAL` status, read AI summary, approve or reject with note |
| **Users** | View all users, change tier, grant/revoke credits, suspend accounts |
| **Pricing** | Update report prices, create discount codes, configure subscription plans |
| **Settings** | Toggle admin approval requirement on/off, set free search rate limits, configure OpenAI model |
| **API Keys** | View and rotate external API keys (VWE, CARFAX, OpenAI) |
| **Analytics** | Revenue by day/week/month, top searched plates, B2B customer usage |

### Admin Approval Workflow

When `require_admin_approval = true` in AdminSettings:

```
User pays for report
        ↓
System generates report (fetches premium data + AI summary)
        ↓
Report status → PENDING_APPROVAL
        ↓
Admin sees it in the queue
        ↓
Admin reads AI summary, reviews data
        ↓
Admin clicks Approve (or Reject)
        ↓
Status → DELIVERED
        ↓
User receives email: "Your report is ready"
```

When `require_admin_approval = false`:
- Report goes directly from `GENERATING` → `DELIVERED`
- User gets the report in ~5–10 seconds

---

## 13. AI Report Generation (OpenAI)

### How It Works

After all premium data is fetched, the system constructs a detailed prompt containing the full structured vehicle data and calls the OpenAI API.

```typescript
// lib/openai/generateSummary.ts

const prompt = `
You are a vehicle data analyst. Based ONLY on the following data, write a concise 
3-paragraph report summary in Dutch for a used car buyer. 

Rules:
- Only use facts present in the data. Never speculate.
- Do not recommend whether to buy or not buy the car.
- Do not give financial or legal advice.
- If mileage is consistent with inspection records, say so.
- If there are recalls, flag them clearly.
- If damage history is present, describe it factually.

Vehicle Data:
${JSON.stringify(vehicleData, null, 2)}

Write the summary now:
`;

const response = await openai.chat.completions.create({
  model: process.env.OPENAI_MODEL || "gpt-4o",
  messages: [{ role: "user", content: prompt }],
  max_tokens: 600,
  temperature: 0.3,  // Low temperature = factual, consistent output
});
```

### Cost

Using GPT-4o: approximately €0.003–0.008 per report summary at current pricing.
At 1,000 premium reports/month: ~€5–8/month in OpenAI costs.

### Safety

- Prompt explicitly prohibits speculation and advice.
- Output stored alongside the prompt for audit trail.
- Content moderation filter run on output before entering approval queue.
- Admin review (if enabled) is the final human safety gate.

---

## 14. Implementation Phases

### Phase 1 — Foundation & Core API (Weeks 1–4)
**Goal:** Working backend that returns live RDW data for any Dutch plate.

- [ ] Cloud infrastructure setup (server, domain, SSL, CI/CD)
- [ ] PostgreSQL + Redis provisioned and connected
- [ ] RDW API client (`lib/rdw/`) — all 6 datasets
- [ ] Plate normalization + format validator (all 7 Dutch series)
- [ ] `GET /api/vehicle/[plate]` endpoint — parallel fetch + merge
- [ ] Redis caching layer (24hr TTL)
- [ ] Basic database schema + Prisma migrations
- [ ] Rate limiting middleware
- [ ] Search logging (anonymized)

**Deliverable:** `curl https://yourplatform.nl/api/vehicle/16RSL9` returns full JSON vehicle data.

---

### Phase 2 — Frontend & User Features (Weeks 5–9)
**Goal:** Live, publicly accessible web app that any Dutch user can search on.

- [ ] Next.js app setup with TailwindCSS
- [ ] Homepage with prominent search bar
- [ ] `SearchBar` component — real-time format validation, plate auto-formatter
- [ ] `VehicleCard` — full spec display
- [ ] `ApkTimeline` — visual inspection history
- [ ] `RecallAlert` — red warning banner for open recalls
- [ ] `FuelBadge` — fuel type + energy label
- [ ] Premium gate component (upsell for paid features)
- [ ] NextAuth.js authentication (email + Google OAuth)
- [ ] User account page
- [ ] English / Dutch language toggle
- [ ] Mobile-responsive design
- [ ] SEO: meta tags, sitemap, structured data for plate results
- [ ] Basic admin dashboard (view searches + revenue)

**Deliverable:** Live web app at your domain. Free searches fully functional.

---

### Phase 3 — Premium & Monetization (Weeks 10–14)
**Goal:** Revenue-generating platform with paid reports, subscriptions, and B2B API.

- [ ] Mollie payment integration (iDEAL + credit card)
- [ ] Premium report generation pipeline (VWE + CARFAX + OpenAI)
- [ ] Admin approval queue UI + workflow
- [ ] PDF report generation (Puppeteer)
- [ ] S3/Spaces storage for PDF files
- [ ] Email delivery (report ready, receipt, account emails)
- [ ] Subscription management (Mollie recurring billing)
- [ ] B2B API key management + rate limiting
- [ ] White-label JavaScript widget
- [ ] Admin panel — full feature set (pricing, users, settings, analytics)
- [ ] GDPR compliance audit + privacy policy
- [ ] Security audit
- [ ] Load testing

**Deliverable:** Full revenue-generating platform. Free tier + paid reports + B2B API all live.

---

## 15. Environment Variables

```bash
# .env.example

# App
NEXTAUTH_SECRET=
NEXTAUTH_URL=https://yourplatform.nl

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/kenteken

# Redis
REDIS_URL=redis://localhost:6379

# RDW (no key needed — public API, but good to document the base URL)
RDW_BASE_URL=https://opendata.rdw.nl/resource

# OpenAI
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o

# Mollie (Payments — iDEAL + cards)
MOLLIE_API_KEY=live_...
MOLLIE_WEBHOOK_URL=https://yourplatform.nl/api/webhooks/mollie

# VWE Automotive (Phase 3)
VWE_API_KEY=
VWE_API_URL=

# CARFAX Europe (Phase 3)
CARFAX_API_KEY=
CARFAX_API_URL=

# RDW Business (Phase 3 — paid mileage history)
RDW_BUSINESS_API_KEY=

# Storage (PDF reports)
S3_BUCKET=
S3_REGION=eu-west-1
S3_ACCESS_KEY=
S3_SECRET_KEY=

# Email
RESEND_API_KEY=

# Sentry (error tracking)
SENTRY_DSN=
```

> ⚠️ **Never commit `.env.local` to version control.** All secrets must live in environment variables only. API keys are rotatable from the admin panel without a deployment.

---

## 16. Getting Started (Local Dev)

### Prerequisites
- Node.js 20+
- Docker Desktop (for local PostgreSQL + Redis)
- Git

### Setup

```bash
# 1. Clone the repository
git clone https://github.com/yourorg/kenteken-platform.git
cd kenteken-platform

# 2. Install dependencies
npm install

# 3. Start local database and Redis
docker-compose up -d
# This starts: PostgreSQL on :5432, Redis on :6379

# 4. Copy environment template
cp .env.example .env.local
# Fill in your values (at minimum: DATABASE_URL, REDIS_URL, NEXTAUTH_SECRET)

# 5. Run database migrations
npx prisma migrate dev

# 6. Start the development server
npm run dev
# App runs at http://localhost:3000

# 7. Test a plate lookup (no API key needed)
curl http://localhost:3000/api/vehicle/16RSL9
```

### Docker Compose (Local Services)

```yaml
# docker-compose.yml
version: '3.8'
services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_DB: kenteken
      POSTGRES_USER: dev
      POSTGRES_PASSWORD: dev
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  postgres_data:
```

---

## 17. Deployment

### Production Infrastructure

```bash
# Build and push Docker image
docker build -t kenteken-platform:latest .
docker push registry.digitalocean.com/yourregistry/kenteken-platform:latest

# Deploy to DigitalOcean App Platform (or Droplet)
# Zero-downtime rolling deployment via GitHub Actions on push to main
```

### GitHub Actions CI/CD

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run tests
        run: npm test
      - name: Build Docker image
        run: docker build -t kenteken-platform .
      - name: Deploy (zero-downtime)
        run: |
          # Rolling deployment — new container starts, health check passes,
          # traffic switches, old container stops
```

### Uptime Monitoring

- **Uptime Robot** — free, 5-minute check intervals, email/Slack alerts
- **Sentry** — real-time error tracking and performance monitoring
- **Health check endpoint:** `GET /api/health` → `{ status: "ok", db: "ok", redis: "ok", rdw: "ok" }`

---

## 18. GDPR & Legal Compliance

Operating in the Netherlands requires strict compliance with Dutch and EU data protection law.

### What We Store

| Data | Storage | Retention | Legal Basis |
|---|---|---|---|
| License plate searched | Hashed or plain (not personal data) | 90 days | Legitimate interest |
| User email + password hash | PostgreSQL | Until account deletion | Contract |
| IP address (for rate limiting) | Redis (hashed) | 24 hours | Legitimate interest |
| Payment transaction ID | PostgreSQL | 7 years (tax law) | Legal obligation |
| AI prompt + response | PostgreSQL | 90 days | Legitimate interest (audit) |
| Premium report content | PostgreSQL + S3 | Until user deletes account | Contract |

### What We Never Store
- Vehicle owner names or addresses (not in RDW open data — by design)
- Credit card numbers (handled entirely by Mollie/Stripe — PCI DSS)
- Full IP addresses longer than 24 hours

### User Rights
- **Right to access** — users can download all their data from the account page
- **Right to erasure** — "Delete my account" button permanently removes all user data
- **Right to data portability** — export as JSON from account page

### Required Legal Documents
- Privacy Policy (Privacyverklaring) — GDPR-compliant, reviewed by Dutch lawyer
- Terms of Service — includes liability disclaimer on report accuracy
- Cookie Policy — proper consent (not just an "OK" button)
- Data Processing Agreement (Verwerkersovereenkomst) — with all sub-processors (OpenAI, Mollie, etc.)

### Business Requirements
- **KvK registration** — required for paid RDW data services
- **BTW number** — for VAT on digital services (21% NL rate)
- **Autoriteit Persoonsgegevens** registration — if processing personal data at scale

---

## 19. Security

### Application Security

- **HTTPS enforced** — all HTTP redirected to HTTPS; HSTS header set
- **Password hashing** — bcrypt with cost factor 12
- **JWT sessions** — short expiry (15 min access token, 7-day refresh token)
- **Rate limiting** — 60 requests/minute for anonymous users; 300/minute for authenticated
- **SQL injection prevention** — Prisma parameterized queries (no raw SQL)
- **XSS prevention** — Next.js escapes all output; CSP headers configured
- **CSRF protection** — NextAuth.js handles CSRF tokens on all state-changing requests
- **API key storage** — environment variables only; never in code or database
- **Dependency scanning** — `npm audit` + Snyk on every CI run

### Bot & Scraping Protection

- **Cloudflare** (free tier) — blocks known malicious IPs and bot signatures
- **Rate limiting by IP** — 60 searches/hour for anonymous
- **invisible reCAPTCHA v3** — triggered on suspicious behavior patterns
- **User-agent validation** — browser-like UAs required for the free public API

### Infrastructure Security

- **SSH key-only access** — no password SSH to production servers
- **Private network** — database and Redis are not publicly accessible; only app server can connect
- **Automated security patches** — `unattended-upgrades` enabled on Ubuntu servers
- **Secrets rotation** — all API keys rotatable from admin panel without redeployment

---

## 20. Roadmap

### v1.0 — Launch (Week 14)
Core platform live: free RDW lookups, premium reports with admin approval, iDEAL payments.

### v1.1 — Mobile App (Month 4)
React Native app (iOS + Android) with plate search, camera-based plate scanning, saved plates list.

### v1.2 — Community Features (Month 6)
User-uploaded vehicle photos, community comments and ratings on specific makes/models, "I own this" tagging.

### v1.3 — Recall Notifications (Month 6)
Email/push alerts when a recall is issued for a saved plate. Configurable per plate, per user.

### v1.4 — Dealer Dashboard (Month 8)
Full B2B portal for car dealers: bulk CSV upload, inventory management, API integration guide, white-label widget builder.

### v2.0 — Market Intelligence (Month 12)
Price trend charts built from scraped marketplace listings (Marktplaats, AutoScout24). "Is this a fair asking price?" comparison tool.

### v2.1 — Belgium Expansion (Month 14)
Adapt the platform for Belgian DIV (vehicle registration authority) data. Second market with minimal rearchitecting required.

---

## Contributing

This project uses a standard GitHub Flow:

1. Create a feature branch from `main`
2. Write code + tests
3. Open a PR — CI runs automatically
4. Code review required before merge
5. Merge to `main` triggers zero-downtime deployment

---

## License

Proprietary. All rights reserved.

RDW Open Data is used under Creative Commons CC-0. All other data sources are used under their respective commercial agreements.

---

*Built for the Netherlands vehicle market · Powered by RDW Open Data · Next.js + PostgreSQL + Redis*
