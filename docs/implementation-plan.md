# Next.js + MongoDB Implementation Plan

## 1. Objective
Build a production-ready Dutch license plate lookup platform on Next.js with MongoDB, starting from the current skeleton and rolling out features in phases.

## 2. Scope
- Free lookup tier using RDW open data APIs
- Premium report flow (payments, enrichment, AI summary, PDF)
- Admin operations (approvals, pricing, users, analytics)
- B2B API access for bulk and programmatic usage

## 3. Current Status (Already Done)
- Next.js App Router + TypeScript scaffold
- Basic pages: home, pricing, account, admin, search result
- API routes: `GET /api/vehicle/[plate]`, `GET /api/health`
- RDW integration skeleton:
  - plate normalization
  - 7-format validation
  - parallel fetch design
  - merged profile mapping
- MongoDB connection helper + cache/search model stubs

## 4. Architecture Decisions
- Framework: Next.js 14+ (App Router)
- Database: MongoDB (Mongoose)
- Caching:
  - Phase 1: MongoDB cache collection with `expiresAt`
  - Phase 2: Redis for fast hot-cache and rate limiting
- Auth: NextAuth (email + OAuth)
- Payments: Mollie (primary), Stripe optional fallback
- AI: OpenAI summaries with moderation + audit trail
- Storage: S3-compatible bucket for PDFs

## 5. Delivery Phases

## Phase 1: Core Lookup MVP
Goal: robust free lookup flow.
- Implement strict Dutch plate validator + formatter tests
- Complete RDW adapters (main/fuel/apk/recalls/body)
- Harden `GET /api/vehicle/[plate]` error handling and typed output
- Add lookup logging (hashed IP + source cache/api)
- Add minimal rate limiting (in-memory first, Redis later)
- Add `/api/health` checks for Mongo + RDW connectivity
- Add basic UI for vehicle profile rendering

Deliverable:
- A user can search a plate and reliably get merged RDW data.

## Phase 2: Product UX + Platform Foundations
Goal: usable public web app with account system.
- Route groups `(marketing)` and `(platform)`
- Improve search UX and result cards
- Add i18n (Dutch/English)
- Add NextAuth user onboarding/login
- Add account page: saved searches + report history
- Add Redis cache layer (24h TTL) before RDW calls
- Add proper request rate limiting per IP/user
- Add SEO metadata and sitemap

Deliverable:
- Public launchable free-tier product with auth and stable performance.

## Phase 3: Premium Monetization
Goal: paid report generation.
- Integrate Mollie payment intent + webhook lifecycle
- Add report pipeline states:
  - `PENDING_PAYMENT -> PAID -> GENERATING -> PENDING_APPROVAL/DELIVERED`
- Integrate premium sources via adapters (placeholders first)
- Generate AI summary with safety constraints and prompt audit storage
- Add PDF generation + object storage upload
- Add email notifications (report ready/receipt)

Deliverable:
- End-to-end paid report flow operational.

## Phase 4: Admin Panel and Governance
Goal: operational control for business users.
- Protect admin routes by role
- Approval queue for AI-generated reports
- Pricing/settings CRUD
- User management actions
- Basic analytics dashboards
- API key rotation UI (stored securely)

Deliverable:
- Admin team can run the platform without code changes.

## Phase 5: B2B API
Goal: recurring B2B revenue.
- API key issuance and rotation
- API usage metering and quotas
- Bulk lookup endpoint (CSV/JSON)
- Webhook/event model for enterprise workflows
- Usage/billing dashboard for B2B customers

Deliverable:
- B2B clients can integrate via stable, documented APIs.

## 6. Data Model Plan (MongoDB)
- `users`
- `search_logs`
- `vehicle_cache`
- `reports`
- `subscriptions`
- `admin_settings`
- `api_keys`

Key indexes:
- `vehicle_cache._id` (normalized plate)
- `vehicle_cache.expiresAt` (TTL index optional)
- `search_logs.createdAt`, `search_logs.plate`
- `reports.userId`, `reports.status`, `reports.createdAt`
- `subscriptions.userId`, `subscriptions.status`

## 7. API Plan
- `GET /api/vehicle/[plate]` (free lookup)
- `POST /api/report/generate`
- `GET /api/report/[id]`
- `POST /api/admin/approve`
- `POST /api/webhooks/mollie`
- `GET /api/health`

## 8. Quality Plan
- Unit tests:
  - plate normalize/validate/format
  - RDW mapper
  - report state transitions
- Integration tests:
  - vehicle API success/failure paths
  - cache hit/miss behavior
  - webhook status updates
- Monitoring:
  - error tracking
  - latency metrics
  - uptime checks

## 9. Security and Compliance Plan
- Hash IP for rate-limiting logs
- Store secrets only in environment variables
- Enforce role checks on admin and report endpoints
- Add abuse controls (rate limit + bot checks)
- GDPR controls:
  - data export
  - deletion flow
  - retention windows by collection

## 10. Milestone Timeline (Suggested)
- Week 1-2: Phase 1 completion + tests
- Week 3-5: Phase 2 completion
- Week 6-8: Phase 3 completion
- Week 9-10: Phase 4 completion
- Week 11-12: Phase 5 completion

## 11. Immediate Next Actions
1. Finalize platform name and brand constants.
2. Implement route-group structure `(marketing)` and `(platform)`.
3. Add Redis and move cache checks to Redis-first.
4. Add test setup (Vitest/Jest + API integration harness).
5. Implement report and subscription Mongo models.
