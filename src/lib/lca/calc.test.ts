import { describe, expect, it } from "vitest";
import { assessVehicle, bevElectricityKwh, calculateImpact, validateQuantity } from "./calc";
import { getFactor } from "./data";

const steel = getFactor("F-MAT-STEEL")!;

describe("LCA calculation rules", () => {
  it("multiplies quantity by factor", () => {
    const r = calculateImpact(100, "kg", steel);
    expect(r.ok && r.value.impact).toBe(250);
  });
  it("rejects negative and non-numeric quantities", () => {
    expect(validateQuantity(-1).ok).toBe(false);
    expect(validateQuantity("abc").ok).toBe(false);
    expect(validateQuantity("").ok).toBe(false);
  });
  it("refuses to multiply incompatible units", () => {
    expect(calculateImpact(100, "kWh", steel).ok).toBe(false);
  });
  it("never treats a missing factor as zero", () => {
    expect(calculateImpact(1, "vehicle", getFactor("F-EOL-RECYC")).ok).toBe(false);
  });
  it("computes BEV grid electricity with charging losses", () => {
    const r = bevElectricityKwh({ distanceKm: 1000, kwhPerKm: 0.15, chargingEfficiency: 0.9 });
    expect(r.ok && Math.round(r.value * 100) / 100).toBeCloseTo(166.67);
  });
  it("flags unmodelled stages as incomplete", () => {
    const a = assessVehicle([
      { stage: "vehicle_manufacturing", applicable: true, quantity: 1, activityUnit: "vehicle", factor: getFactor("F-MFG-ICE") },
      { stage: "end_of_life", applicable: true, quantity: 1, activityUnit: "vehicle", factor: getFactor("F-EOL-RECYC") },
    ]);
    expect(a.complete).toBe(false);
    expect(a.missingStages).toEqual(["end_of_life"]);
    expect(a.modelledTotal).toBe(6500);
  });
  it("flags double-counted battery impacts", () => {
    const a = assessVehicle([
      { stage: "vehicle_manufacturing", applicable: true, quantity: 1, activityUnit: "vehicle", factor: getFactor("F-MFG-ICE"), includesBattery: true },
      { stage: "battery_manufacturing", applicable: true, quantity: 40, activityUnit: "kWh", factor: getFactor("F-CMP-BATT") },
    ]);
    expect(a.errors.length).toBe(1);
    expect(a.complete).toBe(false);
  });
});
