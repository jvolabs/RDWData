# Frontend Architecture (RTK Query + Reusable UI)

## State and API
- `lib/store/index.ts`: Redux store factory and middleware setup.
- `lib/store/provider.tsx`: app-level provider wrapper.
- `lib/store/hooks.ts`: typed Redux hooks.
- `lib/store/services/vehicleApi.ts`: RTK Query API slice (`fetchBaseQuery`) for `/api/vehicle/:plate`.

## Hooks
- `hooks/usePlateSearch.ts`: form behavior (normalize, validate, submit).
- `hooks/useVehicleLookup.ts`: query lifecycle wrapper using RTK Query.

## Reusable UI
- `components/ui/Panel.tsx`: consistent elevated surface container.
- `components/ui/Badge.tsx`: status and metadata tags.

## Feature Components
- `components/search/SearchBar.tsx`: search input module.
- `components/vehicle/VehicleResultScreen.tsx`: search-result view composition.
- `components/vehicle/*`: small presentational blocks (card/table/list).
- `components/landing/*`: homepage sections.
- `components/layout/SiteHeader.tsx`: top navigation.

## Rule
- Client data fetching goes through RTK Query hooks only.
- No direct Axios calls in UI components.
