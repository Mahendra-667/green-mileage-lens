import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ACTIVITY_UNITS, calculateImpact, fmt } from "@/lib/lca/calc";
import { FACTORS, getFactor, getSource } from "@/lib/lca/data";
import { addAssessment, useStorageError } from "@/lib/lca/store";
import { PARTIAL_WARNING } from "@/lib/lca/records";
import { fieldClass, Notice, PageHeader, Panel, StatusBadge } from "@/components/lca/ui";
import { pageHead } from "@/lib/lca/meta";

export const Route = createFileRoute("/assessment")({
  head: () => pageHead("LCA Assessment", "Calculate GWP impact as activity quantity multiplied by impact factor, with unit checks and provenance."),
  component: AssessmentPage,
});

function AssessmentPage() {
  const [label, setLabel] = useState("Body-in-white steel");
  const [factorId, setFactorId] = useState("F-MAT-STEEL");
  const [qty, setQty] = useState("350");
  const [unit, setUnit] = useState("kg");
  const storageError = useStorageError();
  const factor = getFactor(factorId);
  const source = factor && getSource(factor.sourceId);
  const result = useMemo(() => calculateImpact(qty, unit, factor), [qty, unit, factor]);

  const save = () => {
    if (!result.ok || !factor) return;
    const saved = addAssessment({
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      label: label.trim() || factor.name,
      quantity: Number(qty),
      activityUnit: unit,
      factor: { ...factor },
      sourceTitle: source?.title ?? "Unknown",
      impact: result.value.impact,
      impactUnit: result.value.impactUnit,
      sourceReference: source?.reference ?? "No source reference available",
      systemBoundary: source?.systemBoundary ?? "Boundary not established",
      assumptions: `Single activity: ${qty} ${unit}; exact-unit multiplication; no vehicle lifecycle assumptions. ${factor.notes ?? ""}`,
      coverageWarning: PARTIAL_WARNING,
    });
    if (saved.ok) toast.success("Assessment saved in this browser — see Reports");
    else toast.error(saved.error);
  };

  return (
    <>
      <PageHeader eyebrow="LCA Assessment" title="Activity × impact factor">
        Impact = activity quantity × impact factor. Units must match exactly; no implicit conversion is applied.
      </PageHeader>
      <div className="mb-4"><Notice tone="info">Single-activity result, not a complete vehicle LCA. Saved assessments stay in this browser only; no Cloud database or multi-user storage is enabled.</Notice></div>
      {storageError && <div className="mb-4"><Notice tone="error">{storageError}</Notice></div>}
      <div className="grid gap-4 lg:grid-cols-5">
        <Panel title="Inputs" className="lg:col-span-2">
          <div className="space-y-4 text-sm">
            <label className="block"><span className="mb-1 block text-muted-foreground">Assessment label</span>
              <input className={fieldClass} value={label} onChange={(e) => setLabel(e.target.value)} maxLength={80} /></label>
            <label className="block"><span className="mb-1 block text-muted-foreground">Impact factor</span>
              <select className={fieldClass} value={factorId} onChange={(e) => { setFactorId(e.target.value); const f = getFactor(e.target.value); if (f) setUnit(f.perUnit); }}>
                {FACTORS.map((f) => <option key={f.id} value={f.id}>{f.name}{f.value === null ? " — missing" : ""}</option>)}
              </select></label>
            <div className="grid grid-cols-3 gap-2">
              <label className="col-span-2 block"><span className="mb-1 block text-muted-foreground">Activity quantity</span>
                <input className={`${fieldClass} font-mono`} inputMode="decimal" value={qty} onChange={(e) => setQty(e.target.value)} /></label>
              <label className="block"><span className="mb-1 block text-muted-foreground">Unit</span>
                <select className={fieldClass} value={unit} onChange={(e) => setUnit(e.target.value)}>
                  {ACTIVITY_UNITS.map((u) => <option key={u}>{u}</option>)}
                </select></label>
            </div>
          </div>
        </Panel>
        <Panel title="Result" className="lg:col-span-3">
          {result.ok ? (
            <>
              <p className="tabular break-words font-mono text-3xl font-semibold text-primary">{fmt(result.value.impact)} <span className="text-lg text-muted-foreground">{result.value.impactUnit}</span></p>
              <p className="mt-2 break-words font-mono text-xs text-muted-foreground">{result.value.equation}</p>
              <p className="mt-2 text-xs text-muted-foreground">GWP100 · Illustrative — not real-world data · partial activity coverage</p>
              <Button className="mt-4" onClick={save}>Save assessment</Button>
            </>
          ) : (
            <Notice tone="error">{result.error}</Notice>
          )}
          {factor && (
            <div className="mt-6 border-t border-border pt-4 text-sm">
              <div className="flex items-center justify-between"><h3 className="font-medium text-foreground">Provenance</h3><StatusBadge status={factor.status} /></div>
              <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <dt className="text-muted-foreground">Factor</dt><dd className="font-mono">{factor.id} = {factor.value ?? "missing"} {factor.impactUnit}/{factor.perUnit}</dd>
                <dt className="text-muted-foreground">Source</dt><dd>{source?.id} — {source?.title}</dd>
                <dt className="text-muted-foreground">Reference</dt><dd>{source?.reference}</dd>
                <dt className="text-muted-foreground">Boundary</dt><dd>{source?.systemBoundary}</dd>
                <dt className="text-muted-foreground">Limitations</dt><dd>{source?.limitations}</dd>
              </dl>
              {factor.status !== "verified" && <div className="mt-3"><Notice>This factor is not verified. Result is for demonstration only.</Notice></div>}
            </div>
          )}
        </Panel>
      </div>
    </>
  );
}
