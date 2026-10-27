import type { Factor } from "./types";

export type Result<T> = { ok: true; value: T } | { ok: false; error: string };

const KNOWN_UNITS = ["kg", "t", "kWh", "MJ", "L", "km", "tkm", "vehicle", "unit"] as const;
export const ACTIVITY_UNITS: readonly string[] = KNOWN_UNITS;

/** Validate a numeric quantity: must be a finite, non-negative number. */
export function validateQuantity(raw: string | number): Result<number> {
  if (raw === null || raw === undefined || (typeof raw === "string" && raw.trim() === "")) return { ok: false, error: "Quantity is required." };
  if (typeof raw !== "number" && (typeof raw !== "string" || !/^[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?$/i.test(raw.trim()))) return { ok: false, error: "Quantity must be a decimal number." };
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
  if (factor.indicator !== "GWP100" || factor.impactUnit !== "kg CO2e")
    return { ok: false, error: "Only GWP100 factors in kg CO2e are supported; incompatible indicators or impact units cannot be aggregated." };
  return { ok: true, value: factor.value };
}

/** Units must match exactly: quantity [perUnit] × factor [impactUnit / perUnit]. */
export function checkUnits(activityUnit: string, factor: Factor): Result<string> {
  if (!KNOWN_UNITS.some((u) => u === activityUnit)) return { ok: false, error: "A supported activity unit is required." };
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
  if (!factor) return { ok: false, error: "No impact factor selected." };
  const f = validateFactor(factor);
  if (!f.ok) return f;
  const u = checkUnits(activityUnit, factor);
  if (!u.ok) return u;
  const impact = q.value * f.value;
  if (!Number.isFinite(impact)) return { ok: false, error: "Impact exceeds the supported numeric range." };
  return {
    ok: true,
    value: {
      impact,
      impactUnit: u.value,
      equation: `${q.value} ${activityUnit} × ${f.value} ${factor.impactUnit}/${factor.perUnit} = ${round(impact)} ${u.value}`,
      factorId: factor.id,
      sourceId: factor.sourceId,
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
  const value = (i.distanceKm * i.kwhPerKm) / i.chargingEfficiency;
  return Number.isFinite(value) ? { ok: true, value } : { ok: false, error: "Grid electricity exceeds the supported numeric range." };
}

export type StageKey = "vehicle_manufacturing" | "battery_manufacturing" | "use_phase" | "maintenance" | "end_of_life";

export const STAGE_LABELS: Record<StageKey, string> = {
  vehicle_manufacturing: "Vehicle manufacturing",
  battery_manufacturing: "Battery manufacturing",
  use_phase: "Use phase",
  maintenance: "Maintenance",
  end_of_life: "End of life",
};
export const STAGE_KEYS = Object.keys(STAGE_LABELS) as StageKey[];

export interface StageInput {
  stage: StageKey;
  applicable: boolean;
  quantity?: number | undefined;
  activityUnit?: string | undefined;
  factor?: Factor | undefined;
  /** Set when a factor already embeds battery impacts. */
  includesBattery?: boolean | undefined;
}

export type StageOutcome =
  | { stage: StageKey; status: "modelled"; result: ImpactResult; factor: Factor }
  | { stage: StageKey; status: "not_applicable" }
  | { stage: StageKey; status: "not_modelled"; reason: string };

export interface VehicleAssessment {
  stages: StageOutcome[];
  /** null blocks any numeric total for invalid inputs; partial valid coverage is explicit. */
  modelledTotal: number | null;
  valid: boolean;
  modelledCount: number;
  applicableCount: number;
  complete: boolean;
  missingStages: StageKey[];
  errors: string[];
}

export function assessVehicle(inputs: StageInput[]): VehicleAssessment {
  const errors: string[] = [];
  const seen = new Set<StageKey>();
  for (const s of inputs) {
    if (!STAGE_KEYS.includes(s.stage)) errors.push(`Unknown lifecycle stage: ${s.stage}.`);
    if (seen.has(s.stage)) errors.push(`Duplicate lifecycle stage: ${s.stage}.`);
    seen.add(s.stage);
    if (typeof s.applicable !== "boolean") errors.push(`Applicability is required for ${s.stage}.`);
  }
  const batteryModelled = inputs.some((s) => s.stage === "battery_manufacturing" && s.applicable);
  const doubleCount = inputs.find((s) => s.stage !== "battery_manufacturing" && s.applicable && s.includesBattery);
  if (batteryModelled && doubleCount)
    errors.push(`Double counting: "${STAGE_LABELS[doubleCount.stage]}" already includes battery impacts while battery manufacturing is modelled separately.`);

  let stages: StageOutcome[] = STAGE_KEYS.map((stage) => {
    const s = inputs.find((x) => x.stage === stage);
    if (!s) return { stage, status: "not_modelled", reason: "Stage definition missing; applicability not established." };
    if (!s.applicable) return { stage: s.stage, status: "not_applicable" };
    const expectedUnit = s.stage === "battery_manufacturing" ? "kWh" : s.stage === "use_phase" ? undefined : "vehicle";
    if (s.activityUnit && expectedUnit && s.activityUnit !== expectedUnit) errors.push(`${STAGE_LABELS[s.stage]} requires activity in ${expectedUnit}.`);
    if (s.quantity !== undefined) {
      const q = validateQuantity(s.quantity);
      if (!q.ok) errors.push(`${STAGE_LABELS[s.stage]}: ${q.error}`);
    }
    if (s.factor) {
      if (s.factor.value !== null) {
        const f = validateFactor(s.factor);
        if (!f.ok) errors.push(`${STAGE_LABELS[s.stage]}: ${f.error}`);
      }
      if (s.activityUnit) {
        const u = checkUnits(s.activityUnit, s.factor);
        if (!u.ok) errors.push(`${STAGE_LABELS[s.stage]}: ${u.error}`);
      }
    }
    if (s.quantity === undefined || !s.activityUnit) return { stage: s.stage, status: "not_modelled", reason: "No activity data." };
    const r = calculateImpact(s.quantity, s.activityUnit, s.factor);
    if (!r.ok) return { stage: s.stage, status: "not_modelled", reason: r.error };
    if (!s.factor) return { stage: s.stage, status: "not_modelled", reason: "No impact factor selected." };
    return { stage: s.stage, status: "modelled", result: r.value, factor: s.factor };
  });

  const sum = stages.reduce((total, s) => s.status === "modelled" ? total + s.result.impact : total, 0);
  if (!Number.isFinite(sum)) errors.push("Aggregated impact exceeds the supported numeric range.");
  const valid = errors.length === 0;
  // Do not expose usable stage numbers after a blocking validation failure.
  if (!valid) stages = stages.map((s) => s.status === "modelled" ? { stage: s.stage, status: "not_modelled", reason: "Assessment invalid — correct blocking errors before using results." } : s);
  const missingStages = stages.filter((s) => s.status === "not_modelled").map((s) => s.stage);
  const modelledCount = stages.filter((s) => s.status === "modelled").length;
  const applicableCount = stages.filter((s) => s.status !== "not_applicable").length;
  const modelledTotal = valid && modelledCount > 0 ? sum : null;
  return { stages, modelledTotal, valid, modelledCount, applicableCount, complete: missingStages.length === 0 && valid, missingStages, errors };
}

export const round = (n: number, dp = 2) => Number(n.toFixed(dp));
export const fmt = (n: number) => n.toLocaleString("en-IN", { maximumFractionDigits: 2 });
