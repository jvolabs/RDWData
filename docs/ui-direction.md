# UI Direction (MVP)

## Reference Sources Reviewed
- Dribbble: Automotive Search App concepts
  - https://dribbble.com/tags/car-search
  - https://dribbble.com/search/automotive%20dashboard
- Behance: Automotive and vehicle data dashboard concepts
  - https://www.behance.net/search/projects?search=automotive%20dashboard
  - https://www.behance.net/search/projects?search=car%20app%20ui
- Figma Community: Dashboard and data-heavy UI kits
  - https://www.figma.com/community/search?query=dashboard%20ui%20kit
  - https://www.figma.com/community/search?query=automotive%20app

## Applied Style Principles
- Clean hero with single primary CTA (plate search).
- High-contrast input + action button for quick scanning.
- Minimal but strong visual hierarchy (title, subtitle, search, key stats).
- Card-based modular sections for readability and future growth.
- Mobile-first responsive grids with reduced clutter.
- Reusable section components and shared content constants.

## MVP UI Components Added
- `components/landing/HeroSection.tsx`
- `components/landing/StatStrip.tsx`
- `components/landing/FeatureGrid.tsx`
- `components/landing/HowItWorks.tsx`
- `components/search/SearchBar.tsx` (refined)
- `components/vehicle/VehicleCard.tsx`
- `components/vehicle/InspectionTable.tsx`
- `components/vehicle/RecallList.tsx`
