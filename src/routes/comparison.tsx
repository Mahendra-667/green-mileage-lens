import { createFileRoute } from "@tanstack/react-router";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { getFactor } from "@/lib/lca/data";
import { STAGE_LABELS } from "@/lib/lca/calc";
import { assessBev, assessPetrol, DEMO_ASSUMPTIONS } from "@/lib/lca/vehicles";
import { StageTable } from "@/components/lca/StageTable";
import { Notice, PageHeader, Panel } from "@/components/lca/ui";
import { pageHead } from "@/lib/lca/meta";

export const Route = createFileRoute("/comparison")({
  head: () => pageHead("Vehicle Comparison", "Stage-by-stage GWP comparison of a BEV and a petrol passenger car using illustrative demo assumptions."),
  component: ComparisonPage,
});

function ComparisonPage() {
  const bev = assessBev(getFactor("F-NRG-GRID")!);
  const ice = assessPetrol();
  const val = (a: typeof bev, k: string) => {
    const s = a.stages.find((x) => x.stage === k);
    return s?.status === "modelled" ? Math.round(s.result.impact) : 0;
  };
  const data = [
    { name: "BEV car", ...Object.fromEntries(["vehicle_manufacturing", "battery_manufacturing", "use_phase"].map((k) => [k, val(bev, k)])) },
    { name: "Petrol car", ...Object.fromEntries(["vehicle_manufacturing", "battery_manufacturing", "use_phase"].map((k) => [k, val(ice, k)])) },
  ];
  const a = DEMO_ASSUMPTIONS;

  return (
    <>
      <PageHeader eyebrow="Vehicle Comparison" title="BEV vs petrol passenger car (demo)">
        Functional unit: one passenger car over {a.lifetimeKm.toLocaleString("en-IN")} km. All assumptions and factors are illustrative.
      </PageHeader>
      <Notice tone="error">
        <strong>Incomplete coverage — not a cradle-to-grave LCA.</strong> Maintenance and end-of-life have no available factors and are excluded from both totals. Petrol use phase is tank-to-wheel only (no fuel production); BEV electricity uses an illustrative grid factor. Subtotals are therefore partial and should not be compared as complete lifecycle results.
      </Notice>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Panel title="BEV passenger car"><StageTable a={bev} /></Panel>
        <Panel title="Petrol passenger car"><StageTable a={ice} /></Panel>
      </div>
      <Panel title="Modelled stages (kg CO2e)" className="mt-4">
        <div className="h-72">
          <ResponsiveContainer>
            <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid stroke="var(--border)" horizontal={false} />
              <XAxis type="number" stroke="var(--muted-foreground)" fontSize={12} />
              <YAxis type="category" dataKey="name" stroke="var(--muted-foreground)" fontSize={12} width={80} />
              <Tooltip />
              <Legend />
              <Bar dataKey="vehicle_manufacturing" name={STAGE_LABELS.vehicle_manufacturing} stackId="a" fill="var(--chart-3)" />
              <Bar dataKey="battery_manufacturing" name={STAGE_LABELS.battery_manufacturing} stackId="a" fill="var(--chart-4)" />
              <Bar dataKey="use_phase" name={STAGE_LABELS.use_phase} stackId="a" fill="var(--chart-1)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Panel>
      <Panel title="Demo assumptions" className="mt-4">
        <ul className="grid gap-2 text-sm sm:grid-cols-2">
          <li>Lifetime distance: <span className="font-mono">{a.lifetimeKm} km</span></li>
          <li>BEV consumption: <span className="font-mono">{a.bevKwhPerKm} kWh/km</span>, charging efficiency <span className="font-mono">{a.chargingEfficiency}</span></li>
          <li>BEV battery capacity: <span className="font-mono">{a.bevBatteryKwh} kWh</span> (counted once, glider factor excludes battery)</li>
          <li>Petrol consumption: <span className="font-mono">{a.petrolLPerKm} L/km</span></li>
        </ul>
      </Panel>
    </>
  );
}
