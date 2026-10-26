import { z } from "zod";
import { calculateImpact } from "./calc";
import { CATEGORY_LABELS, type Assessment } from "./types";

const text = z.string().min(1);
const factorSchema = z.object({
  id: text, name: text, category: z.string().refine((v) => v in CATEGORY_LABELS),
  geography: text, referenceYear: z.number().int(), indicator: z.literal("GWP100"),
  value: z.number().finite().nonnegative(), impactUnit: z.literal("kg CO2e"), perUnit: text,
  sourceId: text, status: z.enum(["verified", "proxy", "illustrative", "needs_review"]),
  notes: z.string().optional(), electricityBasis: z.enum(["delivered", "generation"]).optional(),
});
const recordSchema = z.object({
  id: text, createdAt: z.string().datetime(), label: text,
  quantity: z.number().finite().nonnegative(), activityUnit: text, factor: factorSchema,
  sourceTitle: text, impact: z.number().finite().nonnegative(), impactUnit: z.literal("kg CO2e"),
  sourceReference: z.string().optional(), systemBoundary: z.string().optional(),
  assumptions: z.string().optional(), coverageWarning: z.string().optional(),
}).superRefine((r, ctx) => {
  const result = calculateImpact(r.quantity, r.activityUnit, r.factor as Assessment["factor"]);
  if (!result.ok || result.value.impact !== r.impact)
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Stored arithmetic or units do not match." });
  if ((r.factor.id.startsWith("F-") || r.factor.sourceId.startsWith("SRC-")) && !["illustrative", "needs_review"].includes(r.factor.status))
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Synthetic records cannot be promoted to reviewed evidence." });
});

export function parseAssessments(raw: string): Assessment[] {
  const rows = z.array(recordSchema).parse(JSON.parse(raw)) as Assessment[];
  if (new Set(rows.map((r) => r.id)).size !== rows.length) throw new Error("Duplicate record IDs.");
  return rows;
}

export const PARTIAL_WARNING = "Single activity only — not a vehicle lifecycle total; maintenance, end of life and upstream fuel production not assessed. Illustrative — not real-world data.";