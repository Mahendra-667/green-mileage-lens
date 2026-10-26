import { parseAssessments, PARTIAL_WARNING } from "./records";
import type { Assessment } from "./types";

// Escape RFC 4180 fields and neutralise spreadsheet formulas in untrusted labels.
export const csvEscape = (v: unknown) => {
  const text = String(v ?? "");
  const safe = /^[\s]*[=+\-@]/.test(text) ? `'${text}` : text;
  return `"${safe.replace(/"/g, '""')}"`;
};
export function toCsv(rows: Assessment[]) {
  const validated = parseAssessments(JSON.stringify(rows));
  const header = ["product", "id", "created_at", "label", "quantity", "activity_unit", "indicator", "factor_id", "factor_name", "factor_value", "factor_unit", "evidence_status", "data_quality", "source_id", "source_title", "source_reference", "system_boundary", "assumptions", "impact", "impact_unit", "coverage_warning", "storage_scope", "disclaimer"];
  const lines = validated.map((r) => ["GreenAuto Lens", r.id, r.createdAt, r.label, r.quantity, r.activityUnit, r.factor.indicator, r.factor.id, r.factor.name, r.factor.value, `${r.factor.impactUnit}/${r.factor.perUnit}`, r.factor.status, "Illustrative — not real-world data", r.factor.sourceId, r.sourceTitle, r.sourceReference ?? "Not captured in legacy record", r.systemBoundary ?? "Not captured in legacy record", r.assumptions ?? `Activity ${r.quantity} ${r.activityUnit}; no vehicle assumptions captured`, r.impact, r.impactUnit, r.coverageWarning ?? PARTIAL_WARNING, "This browser only; not Cloud or multi-user", "Prototype demonstrator; not a verified or third-party-reviewed LCA tool"].map(csvEscape).join(","));
  return [header.join(","), ...lines].join("\r\n");
}