import type { Factor, Source } from "./types";

/**
 * DEMO SEED DATA — ILLUSTRATIVE ONLY.
 * Every value below is synthetic, chosen for UI demonstration.
 * None is a real-world Indian environmental factor or official statistic.
 */
export const ILLUSTRATIVE_NOTE = "Illustrative — not real-world data";

export const SOURCES: Source[] = [
  {
    id: "SRC-DEMO-01",
    organisation: "GreenAuto Lens demo dataset",
    title: "Illustrative material production factors",
    publicationYear: null,
    geography: "India (illustrative)",
    reference: "No external reference — synthetic placeholder",
    systemBoundary: "Cradle-to-gate",
    units: "kg CO2e per kg material",
    limitations: "Synthetic values for interface demonstration. Not derived from measured or published Indian data.",
    status: "illustrative",
  },
  {
    id: "SRC-DEMO-02",
    organisation: "GreenAuto Lens demo dataset",
    title: "Illustrative grid electricity factor",
    publicationYear: null,
    geography: "India (illustrative)",
    reference: "No external reference — synthetic placeholder",
    systemBoundary: "Generation + T&D losses (assumed, not modelled)",
    units: "kg CO2e per kWh delivered",
    limitations: "Single national average placeholder. Ignores regional grids, time-of-day and marginal effects.",
    status: "illustrative",
  },
  {
    id: "SRC-DEMO-03",
    organisation: "GreenAuto Lens demo dataset",
    title: "Illustrative vehicle manufacturing and use factors",
    publicationYear: null,
    geography: "India (illustrative)",
    reference: "No external reference — synthetic placeholder",
    systemBoundary: "Assembly and fuel combustion (tank-to-wheel only)",
    units: "kg CO2e per vehicle; kg CO2e per litre",
    limitations: "Glider factor excludes traction battery. Fuel factor excludes upstream (well-to-tank) emissions.",
    status: "illustrative",
  },
  {
    id: "SRC-PENDING-04",
    organisation: "To be identified",
    title: "Candidate source: Li-ion battery cell & pack manufacturing (India context)",
    publicationYear: null,
    geography: "India / Global (to confirm)",
    reference: "Not yet sourced",
    systemBoundary: "Cradle-to-gate (expected)",
    units: "kg CO2e per kWh pack capacity",
    limitations: "Placeholder awaiting literature review. Value currently illustrative.",
    status: "needs_review",
  },
];

export const FACTORS: Factor[] = [
  { id: "F-MAT-STEEL", name: "Steel, primary (demo)", category: "materials", geography: "India (illustrative)", referenceYear: 2024, indicator: "GWP100", value: 2.5, impactUnit: "kg CO2e", perUnit: "kg", sourceId: "SRC-DEMO-01", status: "illustrative" },
  { id: "F-MAT-ALU", name: "Aluminium, primary (demo)", category: "materials", geography: "India (illustrative)", referenceYear: 2024, indicator: "GWP100", value: 15, impactUnit: "kg CO2e", perUnit: "kg", sourceId: "SRC-DEMO-01", status: "illustrative" },
  { id: "F-MAT-CU", name: "Copper, refined (demo)", category: "materials", geography: "India (illustrative)", referenceYear: 2024, indicator: "GWP100", value: 4, impactUnit: "kg CO2e", perUnit: "kg", sourceId: "SRC-DEMO-01", status: "illustrative" },
  { id: "F-CMP-BATT", name: "Li-ion traction battery pack (demo)", category: "components", geography: "India / Global (to confirm)", referenceYear: 2024, indicator: "GWP100", value: 90, impactUnit: "kg CO2e", perUnit: "kWh", sourceId: "SRC-PENDING-04", status: "needs_review", notes: "Per kWh of pack capacity." },
  { id: "F-MFG-BEV-GLIDER", name: "BEV passenger car assembly, excl. battery (demo)", category: "manufacturing", geography: "India (illustrative)", referenceYear: 2024, indicator: "GWP100", value: 6000, impactUnit: "kg CO2e", perUnit: "vehicle", sourceId: "SRC-DEMO-03", status: "illustrative", notes: "Excludes traction battery to avoid double counting." },
  { id: "F-MFG-ICE", name: "Petrol passenger car manufacturing (demo)", category: "manufacturing", geography: "India (illustrative)", referenceYear: 2024, indicator: "GWP100", value: 6500, impactUnit: "kg CO2e", perUnit: "vehicle", sourceId: "SRC-DEMO-03", status: "illustrative" },
  { id: "F-NRG-GRID", name: "Grid electricity, national average (demo)", category: "energy", geography: "India (illustrative)", referenceYear: 2024, indicator: "GWP100", value: 0.7, impactUnit: "kg CO2e", perUnit: "kWh", sourceId: "SRC-DEMO-02", status: "illustrative" },
  { id: "F-TRN-TRUCK", name: "Road freight, heavy truck (demo)", category: "transport", geography: "India (illustrative)", referenceYear: 2024, indicator: "GWP100", value: 0.1, impactUnit: "kg CO2e", perUnit: "tkm", sourceId: "SRC-DEMO-03", status: "illustrative" },
  { id: "F-USE-PETROL", name: "Petrol combustion, tank-to-wheel (demo)", category: "vehicle_use", geography: "India (illustrative)", referenceYear: 2024, indicator: "GWP100", value: 2.3, impactUnit: "kg CO2e", perUnit: "L", sourceId: "SRC-DEMO-03", status: "illustrative" },
  { id: "F-USE-MAINT", name: "Passenger car maintenance (not available)", category: "vehicle_use", geography: "India", referenceYear: 2024, indicator: "GWP100", value: null, impactUnit: "kg CO2e", perUnit: "vehicle", sourceId: "SRC-PENDING-04", status: "needs_review", notes: "No factor available — stage not modelled." },
  { id: "F-EOL-RECYC", name: "Vehicle end-of-life treatment (not available)", category: "end_of_life", geography: "India", referenceYear: 2024, indicator: "GWP100", value: null, impactUnit: "kg CO2e", perUnit: "vehicle", sourceId: "SRC-PENDING-04", status: "needs_review", notes: "No factor available — stage not modelled." },
];

export const getFactor = (id: string) => FACTORS.find((f) => f.id === id);
export const getSource = (id: string) => SOURCES.find((s) => s.id === id);
