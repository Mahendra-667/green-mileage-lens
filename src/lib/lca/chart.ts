import { STAGE_KEYS, type StageKey, type VehicleAssessment } from "./calc";

/** Non-modelled, inapplicable and invalid stages carry a null chart value. */
export type ComparisonRow = { name: string } & Partial<Record<StageKey, number | null>>;

/** Missing, inapplicable and invalid impacts have no numeric chart value. */
export function comparisonRow(name: string, assessment: VehicleAssessment): ComparisonRow {
  return {
    name,
    ...Object.fromEntries(STAGE_KEYS.map((key) => {
      const stage = assessment.stages.find((s) => s.stage === key);
      return [key, assessment.valid && stage?.status === "modelled" ? stage.result.impact : null];
    })),
  };
}
