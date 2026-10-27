# Green Mileage Lens

India-context automotive Life Cycle Assessment prototype for the Techfest IIT Bombay EV Infra & Green Mobility AI Challenge.

**Competition prototype — not a verified or third-party-reviewed LCA tool. Numeric seed factors remain synthetic unless explicitly marked otherwise. The CEA Version 22.0 source is registered for review, but its factor is intentionally not used numerically until its metric, denominator and boundary are harmonised with this app.**

## Working scope

- Overview, searchable environmental factors, evidence registry and methodology.
- Single-activity quantity × factor calculator with exact-unit and GWP100/kg CO2e checks.
- BEV/petrol stage comparison with explicit partial coverage and nonnumeric missing stages.
- Local delivered-electricity sensitivity scenario; it does not edit the dataset.
- Browser-local saved assessments, confirmed deletion, traceable CSV exports and storage-error handling.

## Evidence status and source handling

- The CEA's official [CDM CO₂ Baseline Database, Version 22.0](https://cea.nic.in/cdm-co2-baseline-database/?lang=en) is registered as a `needs_review` source. The database is a CO₂ baseline resource; do not silently treat a CEA CO₂ factor as GWP100 in kg CO₂e/kWh.
- The electricity factor `0.7 kg CO₂e/kWh`, material factors, battery factor and vehicle manufacturing factors are illustrative/demo values, not verified Indian measurements. Keep them labelled illustrative in UI and exports.
- The app must not imply that registering a source validates a factor. Promote a factor to `verified` only after recording the exact table/metric, publication version/year, unit conversion, geography, system boundary and independent review.

## Scientific boundaries

Vehicle assumptions are illustrative: 150,000 km; BEV battery/wheel consumption 0.15 kWh/km, charging efficiency 0.9 and battery capacity 40 kWh; petrol consumption 0.06 L/km. Charging efficiency converts battery-side energy to electricity delivered at the charger exactly once. The grid factor denominator is delivered electricity and excludes vehicle charging losses. Petrol use covers tank-to-wheel tailpipe emissions only, excluding upstream fuel production.

Maintenance and end-of-life factors are unavailable. Subtotals are partial, not cradle-to-grave results. Invalid numbers, duplicate stage definitions, battery double counting and incompatible indicators/units block numeric totals and stage outputs. Missing factors remain missing, not zero.

## Storage and exports

No Cloud database, authentication or multi-user persistence is enabled. Records exist only in this browser/origin and may be lost when browser data is cleared. Blocked, full or corrupt storage shows an error; failed writes do not update the saved-record cache. Corrupt data is not overwritten without confirmed clearing. Other same-origin tabs synchronize via storage events.

Exports include GreenAuto Lens branding, timestamp, input, factor snapshot/value/unit/indicator, evidence status, synthetic-data label, source reference/boundary, assumptions and partial-coverage warnings. Older records remain readable; uncaptured metadata is marked explicitly rather than invented. CSV quotes/newlines are escaped and spreadsheet-formula text is neutralized.

## Development

TanStack Start, React, TypeScript, Tailwind CSS and Vitest.

```sh
bun install
bun run dev
bun run test
bun run build
```

The Lovable sandbox runs production compilation automatically; do not manually run builds/typechecks there. Project-list name is a Lovable setting, separate from application metadata and domain.
