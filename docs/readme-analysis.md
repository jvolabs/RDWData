# README Analysis -> Next.js Skeleton Direction

## Product intent extracted
- Platform: Dutch license plate lookup with free RDW data and paid enrichment in later phases.
- Core UX: plate input, normalization, validation, fast result output, cache-first flow.
- Core API: `GET /api/vehicle/[plate]` with parallel RDW calls and merged object output.
- Phased delivery: Phase 1 focuses on plate lookup + caching + foundational data model.

## Important adjustment requested
- Original README architecture uses PostgreSQL + Prisma.
- Current implementation request is MongoDB.
- This skeleton is therefore built with `mongoose` and MongoDB models while preserving the same product flow.

## Skeleton delivered in this repo
- Next.js App Router + TypeScript base.
- Home page with plate search component.
- Result page: `/search/[plate]`.
- API routes:
  - `GET /api/vehicle/[plate]`
  - `GET /api/health`
- RDW integration modules:
  - plate normalization and 7-pattern validation
  - endpoint URL builder
  - parallel dataset fetching
  - merged `VehicleProfile` mapper
- MongoDB integration:
  - connection helper
  - `VehicleCache` model (24h TTL behavior via `expiresAt` checks)
  - `SearchLog` model stub

## Phase-2/3 placeholders (not implemented)
- Auth, payments, admin workflow, AI summary generation, PDF generation, B2B API, Redis integration.

