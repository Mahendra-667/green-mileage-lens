import type { Factor } from "./types";

export type Result<T> = { ok: true; value: T } | { ok: false; error: string };

const KNOWN_UNITS = ["kg", "t", "kWh", "MJ", "L", "km", "tkm", "vehicle", "unit"] as const;
export const ACTIVITY_UNITS: readonly string[] = KNOWN_UNITS;

/** Validate a numeric quantity: must be a finite, non-negative number. */
export function validateQuantity(raw: string | number): Result<number> {
  if (raw === "" || raw === null || raw === undefined) return { ok: false, error: "Quantity is required." };
  const n = typeof raw === "number" ? raw : Number(String(raw).trim());
  if (!Number.isFinite(n)) return { ok: false, error: "Quantity must be a finite number." };
  if (n < 0) return { ok: false, error: "Quantity cannot be negative." };
  return { ok: true, value: n };
}

/** A factor is usable only if it has a numeric value. Missing is never zero. */
export function validateFactor(factor: Factor | undefined): Result<number> {
  if (!factor) return { ok: false, error: "No impact factor selected." };
  if (factor.value === null || !Number.isFinite(factor.value))
    return { ok: false, error: `Factor "${factor.name}" has no value. Missing factors are not treated as zero.` };
  if (factor.value < 0) return { ok: false, error: "Negative factors (credits) are not supported in this prototype." };
  return { ok: true, value: factor.value };
}

/** Units must match exactly: quantity [perUnit] × factor [impactUnit / perUnit]. */
export function checkUnits(activityUnit: string, factor: Factor): Result<string> {
  if (!activityUnit) return { ok: false, error: "Activity unit is required." };
  if (activityUnit !== factor.perUnit)
    return {
      ok: false,
      error: `Incompatible units: activity in "${activityUnit}" but factor is per "${factor.perUnit}". No automatic conversion is applied.`,
    };
  return { ok: true, value: factor.impactUnit };
}

export interface ImpactResult {
  impact: number;
  impactUnit: string;
  equation: string;
  factorId: string;
  sourceId: string;
}

export function calculateImpact(quantity: string | number, activityUnit: string, factor: Factor | undefined): Result<ImpactResult> {
  const q = validateQuantity(quantity);
  if (!q.ok) return q;
  const f = validateFactor(factor);
  if (!f.ok) return f;
  const u = checkUnits(activityUnit, factor!);
  if (!u.ok) return u;
  const impact = q.value * f.value;
  return {
    ok: true,
    value: {
      impact,
      impactUnit: u.value,
      equation: `${q.value} ${activityUnit} × ${f.value} ${factor!.impactUnit}/${factor!.perUnit} = ${round(impact)} ${u.value}`,
      factorId: factor!.id,
      sourceId: factor!.sourceId,
    },
  };
}

export interface BevUseInputs {
  distanceKm: number;
  kwhPerKm: number; // at the wheel/battery
  chargingEfficiency: number; // 0–1
}

/** Grid electricity drawn over the use phase (kWh). */
export function bevElectricityKwh(i: BevUseInputs): Result<number> {
  for (const [k, v] of Object.entries(i)) {
    const r = validateQuantity(v);
    if (!r.ok) return { ok: false, error: `${k}: ${r.error}` };
  }
  if (i.chargingEfficiency <= 0 || i.chargingEfficiency > 1)
    return { ok: false, error: "Charging efficiency must be between 0 (exclusive) and 1." };
  return { ok: true, value: (i.distanceKm * i.kwhPerKm) / i.chargingEfficiency };
}

export type StageKey = "vehicle_manufacturing" | "battery_manufacturing" | "use_phase" | "maintenance" | "end_of_life";

export const STAGE_LABELS: Record<StageKey, string> = {
  vehicle_manufacturing: "Vehicle manufacturing",
  battery_manufacturing: "Battery manufacturing",
  use_phase: "Use phase",
  maintenance: "Maintenance",
  end_of_life: "End of life",
};

export interface StageInput {
  stage: StageKey;
  applicable: boolean;
  quantity?: number;
  activityUnit?: string;
  factor?: Factor;
  /** Set when a factor already embeds battery impacts. */
  includesBattery?: boolean;
}

export type StageOutcome =
  | { stage: StageKey; status: "modelled"; result: ImpactResult; factor: Factor }
  | { stage: StageKey; status: "not_applicable" }
  | { stage: StageKey; status: "not_modelled"; reason: string };

export interface VehicleAssessment {
  stages: StageOutcome[];
  modelledTotal: number;
  complete: boolean;
  missingStages: StageKey[];
  errors: string[];
}

export function assessVehicle(inputs: StageInput[]): VehicleAssessment {
  const errors: string[] = [];
  const batteryModelled = inputs.some((s) => s.stage === "battery_manufacturing" && s.applicable && s.factor?.value != null);
  const doubleCount = inputs.find((s) => s.stage !== "battery_manufacturing" && s.includesBattery);
  if (batteryModelled && doubleCount)
    errors.push(`Double counting: "${STAGE_LABELS[doubleCount.stage]}" already includes battery impacts while battery manufacturing is modelled separately.`);

  const stages: StageOutcome[] = inputs.map((s) => {
    if (!s.applicable) return { stage: s.stage, status: "not_applicable" };
    if (s.quantity === undefined || !s.activityUnit) return { stage: s.stage, status: "not_modelled", reason: "No activity data." };
    const r = calculateImpact(s.quantity, s.activityUnit, s.factor);
    if (!r.ok) return { stage: s.stage, status: "not_modelled", reason: r.error };
    return { stage: s.stage, status: "modelled", result: r.value, factor: s.factor! };
  });

  const missingStages = stages.filter((s) => s.status === "not_modelled").map((s) => s.stage);
  const modelledTotal = stages.reduce((sum, s) => (s.status === "modelled" ? sum + s.result.impact : sum), 0);
  return { stages, modelledTotal, complete: missingStages.length === 0 && errors.length === 0, missingStages, errors };
}

export const round = (n: number, dp = 2) => Math.round(n * 10 ** dp) / 10 ** dp;
export const fmt = (n: number) => n.toLocaleString("en-IN", { maximumFractionDigits: 2 });
