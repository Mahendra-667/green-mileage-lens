import { createFileRoute, Link } from "@tanstack/react-router";
import { FACTORS, SOURCES } from "@/lib/lca/data";
import { useAssessments } from "@/lib/lca/store";
import { STATUS_LABELS, type EvidenceStatus } from "@/lib/lca/types";
import { Notice, PageHeader, Panel, StatusBadge } from "@/components/lca/ui";
import { pageHead } from "@/lib/lca/meta";

export const Route = createFileRoute("/")({
  head: () => pageHead("Overview", "Dataset, source, assessment and evidence-status overview for the GreenAuto Lens automotive LCA prototype."),
  component: Overview,
});

function Stat({ label, value, note }: { label: string; value: number; note?: string }) {
  return (
    <div className="rounded-md border border-border bg-card p-5">
      <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="tabular mt-2 text-4xl font-semibold text-foreground">{value}</p>
      {note && <p className="mt-1 text-xs text-muted-foreground">{note}</p>}
    </div>
  );
}

function Overview() {
  const assessments = useAssessments();
  const statuses: EvidenceStatus[] = ["verified", "proxy", "illustrative", "needs_review"];
  const count = (s: EvidenceStatus) => FACTORS.filter((f) => f.status === s).length;
  const missing = FACTORS.filter((f) => f.value === null).length;

  return (
    <>
      <PageHeader eyebrow="Overview" title="India automotive life cycle assessment workspace">
        GreenAuto Lens organises lifecycle environmental factors, their evidence, and vehicle-level GWP assessments.
        This is a prototype demonstrator — not a verified or third-party-reviewed LCA tool.
      </PageHeader>
      <Notice>
        <strong>All seeded records are illustrative demo data</strong> ("Illustrative — not real-world data"). No value in this build is a verified Indian environmental factor or official statistic.
      </Notice>
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Dataset records" value={FACTORS.length} note={`${missing} with missing values`} />
        <Stat label="Sources" value={SOURCES.length} note="All demo or pending" />
        <Stat label="Saved assessments" value={assessments.length} note="Stored in this browser" />
        <Stat label="Verified factors" value={count("verified")} note="None yet" />
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Panel title="Evidence status of dataset records">
          <ul className="space-y-3">
            {statuses.map((s) => (
              <li key={s} className="flex items-center gap-3">
                <div className="w-28"><StatusBadge status={s} /></div>
                <div className="h-2 flex-1 rounded-full bg-muted">
                  <div className="h-2 rounded-full bg-primary" style={{ width: `${(count(s) / FACTORS.length) * 100}%` }} />
                </div>
                <span className="tabular w-8 text-right font-mono text-sm">{count(s)}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-muted-foreground">Labels: {statuses.map((s) => STATUS_LABELS[s]).join(" · ")}.</p>
        </Panel>
        <Panel title="Workflows">
          <ul className="divide-y divide-border text-sm">
            {[
              ["/database", "Browse & filter environmental factors"],
              ["/assessment", "Run a quantity × factor assessment"],
              ["/comparison", "Compare BEV vs petrol passenger car (demo)"],
              ["/scenario", "Test grid-electricity scenarios on BEV use phase"],
              ["/reports", "Review results and export CSV"],
            ].map(([to, label]) => (
              <li key={to}>
                <Link to={to} className="flex justify-between py-2.5 text-foreground hover:text-primary">
                  {label} <span className="font-mono text-muted-foreground">→</span>
                </Link>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </>
  );
}
