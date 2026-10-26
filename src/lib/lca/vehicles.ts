import { assessVehicle, bevElectricityKwh, type StageInput } from "./calc";
import { getFactor } from "./data";
import type { Factor } from "./types";

/** Illustrative demo assumptions — not real vehicle data. */
export const DEMO_ASSUMPTIONS = {
  lifetimeKm: 150000,
  bevKwhPerKm: 0.15,
  chargingEfficiency: 0.9,
  bevBatteryKwh: 40,
  petrolLPerKm: 0.06,
};

export function bevStages(gridFactor: Factor | undefined): StageInput[] {
  const a = DEMO_ASSUMPTIONS;
  const kwh = bevElectricityKwh({ distanceKm: a.lifetimeKm, kwhPerKm: a.bevKwhPerKm, chargingEfficiency: a.chargingEfficiency });
  return [
    { stage: "vehicle_manufacturing", applicable: true, quantity: 1, activityUnit: "vehicle", factor: getFactor("F-MFG-BEV-GLIDER"), includesBattery: false },
    { stage: "battery_manufacturing", applicable: true, quantity: a.bevBatteryKwh, activityUnit: "kWh", factor: getFactor("F-CMP-BATT") },
    { stage: "use_phase", applicable: true, quantity: kwh.ok ? kwh.value : undefined, activityUnit: "kWh", factor: gridFactor },
    { stage: "maintenance", applicable: true, quantity: 1, activityUnit: "vehicle", factor: getFactor("F-USE-MAINT") },
    { stage: "end_of_life", applicable: true, quantity: 1, activityUnit: "vehicle", factor: getFactor("F-EOL-RECYC") },
  ];
}

export function petrolStages(): StageInput[] {
  const a = DEMO_ASSUMPTIONS;
  return [
    { stage: "vehicle_manufacturing", applicable: true, quantity: 1, activityUnit: "vehicle", factor: getFactor("F-MFG-ICE") },
    { stage: "battery_manufacturing", applicable: false },
    { stage: "use_phase", applicable: true, quantity: a.lifetimeKm * a.petrolLPerKm, activityUnit: "L", factor: getFactor("F-USE-PETROL") },
    { stage: "maintenance", applicable: true, quantity: 1, activityUnit: "vehicle", factor: getFactor("F-USE-MAINT") },
    { stage: "end_of_life", applicable: true, quantity: 1, activityUnit: "vehicle", factor: getFactor("F-EOL-RECYC") },
  ];
}

export const assessBev = (grid: Factor | undefined) => {
  const result = assessVehicle(bevStages(grid));
  if (grid && grid.electricityBasis !== "delivered") {
    return { ...result, valid: false, complete: false, modelledTotal: null, modelledCount: 0,
      errors: [...result.errors, "BEV use requires a delivered-electricity factor; generation-side or unspecified basis is incompatible."],
      stages: result.stages.map((s) => s.status === "modelled" ? { stage: s.stage, status: "not_modelled" as const, reason: "Incompatible electricity basis — assessment invalid." } : s) };
  }
  return result;
};
export const assessPetrol = () => assessVehicle(petrolStages());
