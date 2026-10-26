import { STAGE_KEYS, type VehicleAssessment } from "./calc";

/** Missing, inapplicable and invalid impacts have no numeric chart value. */
export function comparisonRow(name: string, assessment: VehicleAssessment) {
  return {
    name,
    ...Object.fromEntries(STAGE_KEYS.map((key) => {
      const stage = assessment.stages.find((s) => s.stage === key);
      return [key, assessment.valid && stage?.status === "modelled" ? stage.result.impact : null];
    })),
  };
}