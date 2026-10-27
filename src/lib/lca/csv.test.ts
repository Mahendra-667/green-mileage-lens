import { describe, expect, it } from "vitest";
import { csvEscape, toCsv } from "./csv";
import { getFactor } from "./data";
import type { Assessment } from "./types";

function record(overrides: Partial<Assessment> = {}): Assessment {
  const factor = getFactor("F-MAT-STEEL")!;
  return {
    id: "a-1",
    createdAt: "2026-10-27T00:00:00.000Z",
    label: "Steel sheet",
    quantity: 100,
    activityUnit: "kg",
    factor,
    sourceTitle: "Demo source title",
    impact: 250,
    impactUnit: "kg CO2e",
    ...overrides,
  };
}

describe("CSV export", () => {
  it("escapes spreadsheet-sensitive leading characters", () => {
    expect(csvEscape("=SUM(A1)")).toBe('"\'=SUM(A1)"');
    expect(csvEscape("+cmd")).toBe("\"'+cmd\"");
    expect(csvEscape("@risk")).toBe('"\'@risk"');
    expect(csvEscape("-1")).toBe('\'-1');
    expect(csvEscape('He said "hi"')).toBe('"He said ""hi"""');
  });
  it("preserves source references and provenance columns", () => {
    const csv = toCsv([record({ sourceReference: "Demo Reference (2026)", systemBoundary: "Cradle-to-gate (demo)" })]);
    const row = csv.split("\r\n")[1]!;
    expect(row).toContain('"Demo Reference (2026)"');
    expect(row).toContain('"Cradle-to-gate (demo)"');
    expect(row).toContain('"Illustrative — not real-world data"');
    expect(row).toContain(`"${getFactor("F-MAT-STEEL")!.sourceId}"`);
  });
  it("flags partial coverage on single-activity records", () => {
    const csv = toCsv([record()]);
    expect(csv).toContain("not a vehicle lifecycle total");
  });
  it("rejects records whose stored arithmetic no longer matches", () => {
    expect(() => toCsv([record({ impact: 999 })])).toThrow();
  });
});
