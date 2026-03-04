# MVP Plan (Next.js + MongoDB)

## MVP Goal
Launch a working public web app where users can search a Dutch plate and get reliable free RDW results fast.

## MVP In-Scope
- Homepage with plate input
- Plate normalization + validation (7 Dutch formats)
- `GET /api/vehicle/[plate]` endpoint
- Parallel RDW fetch (main, fuel, APK, recalls, body)
- Merge response into one `VehicleProfile`
- MongoDB cache (`vehicle_cache`) with 24h expiry
- Basic search logging (`search_logs`) with `resultFrom: cache|api`
- Basic rate limiting (simple per-IP)
- Result page UI (core fields + raw fallback)
- Health endpoint (`/api/health`)

## MVP Out of Scope (Post-MVP)
- Auth / account system
- Premium payment flow (Mollie/Stripe)
- AI summary + admin approval
- PDF generation
- B2B API keys + billing
- Full analytics dashboards

## MVP Technical Deliverables
1. Stable API contract for plate lookup.
2. Cache-first behavior with clear `fromCache` indicator.
3. Functional frontend flow: search -> result.
4. Minimal operational checks via health endpoint.

## MVP Data Collections
- `vehicle_cache`
  - `_id` (normalized plate)
  - `data` (merged profile JSON)
  - `cachedAt`
  - `expiresAt`
- `search_logs`
  - `plate`
  - `ipHash`
  - `resultFrom`
  - `createdAt`

## MVP Acceptance Criteria
- Valid plate returns merged RDW data in expected shape.
- Invalid plate returns `400` with clear error.
- Repeated request for same plate within TTL returns `fromCache: true`.
- Core result page renders without runtime error.
- Health endpoint returns HTTP `200`.

## MVP Task List
1. Add tests for `normalizePlate` and `validateDutchPlate`.
2. Harden RDW fetch failures (timeouts + graceful errors).
3. Add search logging in `GET /api/vehicle/[plate]`.
4. Add simple in-memory/IP rate limiter middleware.
5. Improve result page rendering for key fields.
6. Add Mongo + RDW checks in `/api/health`.
7. Smoke-test with 5 real NL plates.

## MVP Timeline (Suggested)
- Day 1-2: API hardening + validation tests
- Day 3: caching + search logging + rate limiting
- Day 4: frontend result rendering polish
- Day 5: health checks + smoke tests + release

## Definition of Done
- MVP runs locally via `npm run dev`
- Plate lookup works end-to-end
- Basic tests pass
- Clear README section added for local setup and MVP scope
