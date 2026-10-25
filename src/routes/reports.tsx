import { createFileRoute, Link } from "@tanstack/react-router";
import { Download, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fmt } from "@/lib/lca/calc";
import { getSource } from "@/lib/lca/data";
import { clearAssessments, removeAssessment, useAssessments } from "@/lib/lca/store";
import type { Assessment } from "@/lib/lca/types";
import { Notice, PageHeader, StatusBadge } from "@/components/lca/ui";
import { pageHead } from "@/lib/lca/meta";

export const Route = createFileRoute("/reports")({
  head: () => pageHead("Reports", "Saved assessment results with inputs, factors and source references, exportable as CSV."),
  component: ReportsPage,
});

const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;

export function toCsv(rows: Assessment[]) {
  const header = ["id", "created_at", "label", "quantity", "activity_unit", "factor_id", "factor_name", "factor_value", "factor_unit", "evidence_status", "source_id", "source_title", "source_reference", "impact", "impact_unit", "disclaimer"];
  const lines = rows.map((r) => [r.id, r.createdAt, r.label, r.quantity, r.activityUnit, r.factor.id, r.factor.name, r.factor.value, `${r.factor.impactUnit}/${r.factor.perUnit}`, r.factor.status, r.factor.sourceId, r.sourceTitle, getSource(r.factor.sourceId)?.reference, r.impact, r.impactUnit, "Prototype demonstrator; not a verified LCA"].map(esc).join(","));
  return [header.join(","), ...lines].join("\n");
}

function ReportsPage() {
  const rows = useAssessments();
  const download = () => {
    const url = URL.createObjectURL(new Blob([toCsv(rows)], { type: "text/csv" }));
    const a = Object.assign(document.createElement("a"), { href: url, download: "greenauto-lens-assessments.csv" });
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <PageHeader eyebrow="Reports" title="Assessment results">
        Each saved assessment keeps a snapshot of the factor and source used at the time of calculation.
      </PageHeader>
      <div className="mb-4 flex flex-wrap gap-2">
        <Button onClick={download} disabled={!rows.length}><Download /> Export CSV</Button>
        <Button variant="outline" onClick={clearAssessments} disabled={!rows.length}>Clear all</Button>
      </div>
      <Notice>Results are based on illustrative or unverified factors and must not be cited as real-world Indian LCA results.</Notice>
      <div className="mt-4 overflow-x-auto rounded-md border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted text-left font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
            <tr>{["Date", "Label", "Input", "Factor", "Result", "Status", ""].map((h) => <th key={h} className="px-3 py-2.5 font-medium">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((r) => (
              <tr key={r.id}>
                <td className="px-3 py-2.5 font-mono text-xs">{new Date(r.createdAt).toLocaleString("en-IN")}</td>
                <td className="px-3 py-2.5">{r.label}</td>
                <td className="px-3 py-2.5 font-mono">{fmt(r.quantity)} {r.activityUnit}</td>
                <td className="px-3 py-2.5 text-xs">{r.factor.name}<br /><span className="font-mono text-muted-foreground">{r.factor.value} {r.factor.impactUnit}/{r.factor.perUnit} · {r.factor.sourceId}</span></td>
                <td className="px-3 py-2.5 font-mono font-semibold">{fmt(r.impact)} {r.impactUnit}</td>
                <td className="px-3 py-2.5"><StatusBadge status={r.factor.status} /></td>
                <td className="px-3 py-2.5"><button aria-label="Delete" onClick={() => removeAssessment(r.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="size-4" /></button></td>
              </tr>
            ))}
            {!rows.length && <tr><td colSpan={7} className="px-3 py-10 text-center text-muted-foreground">No assessments yet. <Link to="/assessment" className="text-primary underline">Run one</Link>.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
