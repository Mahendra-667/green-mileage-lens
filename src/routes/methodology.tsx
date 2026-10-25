import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Panel, StatusBadge } from "@/components/lca/ui";
import { pageHead } from "@/lib/lca/meta";

export const Route = createFileRoute("/methodology")({
  head: () => pageHead("Methodology", "Functional unit, system boundary, GWP indicator, equations, data quality labels, assumptions and limitations."),
  component: MethodologyPage,
});

const Eq = ({ children }: { children: string }) => <pre className="mt-2 overflow-x-auto rounded-sm bg-muted p-3 font-mono text-xs text-foreground">{children}</pre>;

function MethodologyPage() {
  return (
    <>
      <PageHeader eyebrow="Methodology" title="How GreenAuto Lens calculates impacts">
        This prototype follows the general structure of attributional LCA but is a demonstrator, not a verified or third-party-reviewed LCA tool.
      </PageHeader>
      <div className="grid gap-4 text-sm leading-relaxed text-muted-foreground lg:grid-cols-2">
        <Panel title="Functional unit">One passenger car providing 150,000 km of service in an Indian context (demo assumption).</Panel>
        <Panel title="System boundary">Intended cradle-to-grave: vehicle manufacturing, battery manufacturing (BEV only), use phase, maintenance and end of life. In this build only manufacturing, battery and use phase have factors; the rest are flagged as not modelled.</Panel>
        <Panel title="Impact indicator">Global Warming Potential, 100-year horizon (GWP100), reported in kg CO2e. Other indicators are not yet supported.</Panel>
        <Panel title="Equations">
          <Eq>{"Impact_i = Q_i [unit] × EF_i [kg CO2e / unit]"}</Eq>
          <Eq>{"E_grid = distance × consumption / charging_efficiency"}</Eq>
          <Eq>{"Subtotal = Σ Impact_i  (modelled stages only)"}</Eq>
          <p className="mt-2">Units must match exactly. Missing factors are excluded and flagged, never set to zero.</p>
        </Panel>
        <Panel title="Data quality labels">
          <ul className="space-y-2">
            <li className="flex gap-2"><StatusBadge status="verified" /> Traceable, reviewed source matching geography and boundary.</li>
            <li className="flex gap-2"><StatusBadge status="proxy" /> Real data from a different region, year or technology.</li>
            <li className="flex gap-2"><StatusBadge status="illustrative" /> Synthetic demo value — not real-world data.</li>
            <li className="flex gap-2"><StatusBadge status="needs_review" /> Pending source or unresolved quality issues.</li>
          </ul>
        </Panel>
        <Panel title="Assumptions & limitations">
          <ul className="list-disc space-y-1 pl-4">
            <li>All seed factors are illustrative; none are verified Indian data.</li>
            <li>BEV glider factor excludes the battery; battery is counted once to avoid double counting.</li>
            <li>Petrol use phase is tank-to-wheel; upstream fuel production is not included.</li>
            <li>Single national grid factor; no regional, temporal or marginal modelling.</li>
            <li>No battery replacement, degradation or recycling credits.</li>
          </ul>
        </Panel>
      </div>
    </>
  );
}
