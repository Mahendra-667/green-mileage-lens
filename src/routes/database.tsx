import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { FACTORS, getSource } from "@/lib/lca/data";
import { CATEGORY_LABELS, STATUS_LABELS, type LifecycleCategory } from "@/lib/lca/types";
import { fieldClass, PageHeader, StatusBadge } from "@/components/lca/ui";
import { pageHead } from "@/lib/lca/meta";
import { fmt } from "@/lib/lca/calc";

export const Route = createFileRoute("/database")({
  head: () => pageHead("Environmental Database", "Search and filter automotive lifecycle environmental factors by category, geography, year, indicator and evidence status."),
  component: DatabasePage,
});

const uniq = (xs: (string | number)[]) => Array.from(new Set(xs.map(String)));

function DatabasePage() {
  const [q, setQ] = useState("");
  const [f, setF] = useState({ category: "", geography: "", year: "", indicator: "", status: "" });
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLSelectElement>) => setF({ ...f, [k]: e.target.value });

  const rows = useMemo(
    () =>
      FACTORS.filter(
        (r) =>
          (!q || `${r.name} ${r.id}`.toLowerCase().includes(q.toLowerCase())) &&
          (!f.category || r.category === f.category) &&
          (!f.geography || r.geography === f.geography) &&
          (!f.year || String(r.referenceYear) === f.year) &&
          (!f.indicator || r.indicator === f.indicator) &&
          (!f.status || r.status === f.status),
      ),
    [q, f],
  );

  return (
    <>
      <PageHeader eyebrow="Environmental Database" title="Lifecycle impact factors">
        Factors are expressed as impact per activity unit. Records without a value are shown as missing — never as zero.
      </PageHeader>
      <div className="mb-4 grid gap-2 md:grid-cols-3 lg:grid-cols-6">
        <input className={`${fieldClass} lg:col-span-1`} placeholder="Search name or ID…" value={q} onChange={(e) => setQ(e.target.value)} />
        <select className={fieldClass} value={f.category} onChange={set("category")}>
          <option value="">All categories</option>
          {(Object.keys(CATEGORY_LABELS) as LifecycleCategory[]).map((c) => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
        </select>
        <select className={fieldClass} value={f.geography} onChange={set("geography")}>
          <option value="">All geographies</option>
          {uniq(FACTORS.map((r) => r.geography)).map((g) => <option key={g}>{g}</option>)}
        </select>
        <select className={fieldClass} value={f.year} onChange={set("year")}>
          <option value="">All years</option>
          {uniq(FACTORS.map((r) => r.referenceYear)).map((y) => <option key={y}>{y}</option>)}
        </select>
        <select className={fieldClass} value={f.indicator} onChange={set("indicator")}>
          <option value="">All indicators</option>
          <option value="GWP100">GWP100 (kg CO2e)</option>
        </select>
        <select className={fieldClass} value={f.status} onChange={set("status")}>
          <option value="">All evidence status</option>
          {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>
      <div className="overflow-x-auto rounded-md border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted text-left font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
            <tr>{["ID", "Factor", "Category", "Geography", "Year", "Value", "Unit", "Source", "Status"].map((h) => <th key={h} className="px-3 py-2.5 font-medium">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((r) => (
              <tr key={r.id} className="align-top">
                <td className="px-3 py-2.5 font-mono text-xs text-muted-foreground">{r.id}</td>
                <td className="px-3 py-2.5 text-foreground">{r.name}{r.notes && <p className="text-xs text-muted-foreground">{r.notes}</p>}</td>
                <td className="px-3 py-2.5">{CATEGORY_LABELS[r.category]}</td>
                <td className="px-3 py-2.5">{r.geography}</td>
                <td className="px-3 py-2.5 tabular">{r.referenceYear}</td>
                <td className="px-3 py-2.5 tabular font-mono">{r.value === null ? <span className="text-destructive">missing</span> : fmt(r.value)}</td>
                <td className="px-3 py-2.5 font-mono text-xs whitespace-nowrap">{r.impactUnit}/{r.perUnit}</td>
                <td className="px-3 py-2.5 font-mono text-xs">{getSource(r.sourceId)?.id}</td>
                <td className="px-3 py-2.5"><StatusBadge status={r.status} /></td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={9} className="px-3 py-8 text-center text-muted-foreground">No records match these filters.</td></tr>}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">{rows.length} of {FACTORS.length} records · All values illustrative — not real-world data.</p>
    </>
  );
}
