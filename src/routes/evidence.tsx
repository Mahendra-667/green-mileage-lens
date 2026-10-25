import { createFileRoute } from "@tanstack/react-router";
import { FACTORS, SOURCES } from "@/lib/lca/data";
import { PageHeader, StatusBadge } from "@/components/lca/ui";
import { pageHead } from "@/lib/lca/meta";

export const Route = createFileRoute("/evidence")({
  head: () => pageHead("Evidence Registry", "Source registry with organisation, year, geography, system boundary, units, limitations and evidence status."),
  component: EvidencePage,
});

function EvidencePage() {
  return (
    <>
      <PageHeader eyebrow="Evidence Registry" title="Sources behind every factor">
        No real-world citations are included in this build. Demo sources are explicitly marked; pending sources await literature review.
      </PageHeader>
      <div className="grid gap-4">
        {SOURCES.map((s) => (
          <article key={s.id} className="rounded-md border border-border bg-card p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-mono text-xs text-muted-foreground">{s.id} · {s.organisation}</p>
                <h2 className="mt-1 text-base font-semibold text-foreground">{s.title}</h2>
              </div>
              <StatusBadge status={s.status} />
            </div>
            <dl className="mt-4 grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
              {[
                ["Publication year", s.publicationYear ?? "n/a"],
                ["Geography", s.geography],
                ["Reference / URL", s.reference],
                ["System boundary", s.systemBoundary],
                ["Units", s.units],
                ["Linked factors", FACTORS.filter((f) => f.sourceId === s.id).length],
              ].map(([k, v]) => (
                <div key={k as string}>
                  <dt className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">{k}</dt>
                  <dd className="text-foreground">{v}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 border-t border-border pt-3 text-sm text-muted-foreground"><span className="font-medium text-foreground">Limitations: </span>{s.limitations}</p>
          </article>
        ))}
      </div>
    </>
  );
}
