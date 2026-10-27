import { describe, expect, it } from "vitest";
import { comparisonRow } from "./chart";
import { assessVehicle, type StageInput } from "./calc";
import { getFactor } from "./data";

function assessment(inputs: StageInput[]) {
  return assessVehicle(inputs);
}

describe("Comparison chart rows", () => {
  it("gives non-modelled, inapplicable and invalid stages a null chart value", () => {
    const a = assessment([
      { stage: "vehicle_manufacturing", applicable: true, quantity: 1, activityUnit: "vehicle", factor: getFactor("F-MFG-BEV-GLIDER") },
      { stage: "battery_manufacturing", applicable: true, quantity: 40, activityUnit: "kWh", factor: getFactor("F-CMP-BATT") },
      { stage: "use_phase", applicable: true, quantity: 1, activityUnit: "kWh", factor: getFactor("F-MAT-STEEL") }, // incompatible unit
      { stage: "maintenance", applicable: true, quantity: 1, activityUnit: "vehicle", factor: getFactor("F-USE-MAINT") },
      { stage: "end_of_life", applicable: true, quantity: 1, activityUnit: "vehicle", factor: getFactor("F-EOL-RECYC") }, // missing factor value
    ]);
    expect(a.valid).toBe(false);
    const row = comparisonRow("Demo BEV", a);
    expect(row.name).toBe("Demo BEV");
    expect(row.vehicle_manufacturing).toBeNull();
    expect(row.battery_manufacturing).toBeNull();
    expect(row.use_phase).toBeNull();
    expect(row.maintenance).toBeNull();
    expect(row.end_of_life).toBeNull();
  });
  it("keeps numeric values only for genuinely modelled stages of a valid assessment", () => {
    const a = assessment([
      { stage: "vehicle_manufacturing", applicable: true, quantity: 1, activityUnit: "vehicle", factor: getFactor("F-MFG-ICE") },
      { stage: "battery_manufacturing", applicable: false },
      { stage: "use_phase", applicable: false },
      { stage: "maintenance", applicable: false },
      { stage: "end_of_life", applicable: false },
    ]);
    expect(a.valid).toBe(true);
    const row = comparisonRow("Demo petrol", a);
    expect(row.vehicle_manufacturing).toBe(6500);
    expect(row.battery_manufacturing).toBeNull();
    expect(row.use_phase).toBeNull();
    expect(row.maintenance).toBeNull();
    expect(row.end_of_life).toBeNull();
  });
});
