import { createFileRoute } from "@tanstack/react-router";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { getFactor } from "@/lib/lca/data";
import { fmt, STAGE_KEYS, STAGE_LABELS } from "@/lib/lca/calc";
import { comparisonRow } from "@/lib/lca/chart";
import { assessBev, assessPetrol, DEMO_ASSUMPTIONS } from "@/lib/lca/vehicles";
import { StageTable } from "@/components/lca/StageTable";
import { Notice, PageHeader, Panel } from "@/components/lca/ui";
import { pageHead } from "@/lib/lca/meta";

export const Route = createFileRoute("/comparison")({
  head: () => pageHead("Vehicle Comparison", "Stage-by-stage GWP comparison of a BEV and a petrol passenger car using illustrative demo assumptions."),
  component: ComparisonPage,
});

function ComparisonPage() {
  const bev = assessBev(getFactor("F-NRG-GRID"));
  const ice = assessPetrol();
  const data = [comparisonRow("BEV car", bev), comparisonRow("Petrol car", ice)];
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
      <Panel title="Partial illustrative subtotals · GWP100 (kg CO2e)" className="mt-4">
        <p className="mb-3 text-xs text-muted-foreground">Only modelled stages contribute bars. Missing and not-applicable stages have no numeric value; see coverage tables above. Not complete lifecycle results.</p>
        <div className="h-80" role="img" aria-label="Partial illustrative emissions chart; exact stage values, evidence and missing coverage are provided in the preceding tables.">
          <ResponsiveContainer>
            <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid stroke="var(--border)" horizontal={false} />
              <XAxis type="number" stroke="var(--muted-foreground)" fontSize={12} />
              <YAxis type="category" dataKey="name" stroke="var(--muted-foreground)" fontSize={12} width={80} />
              <Tooltip formatter={(value: number) => [`${fmt(value)} kg CO2e · illustrative`, undefined]} labelFormatter={(label) => `${label} — partial illustrative subtotal`} contentStyle={{ background: "var(--card)", borderColor: "var(--border)", color: "var(--foreground)" }} />
              <Legend />
              <Bar dataKey="vehicle_manufacturing" name={STAGE_LABELS.vehicle_manufacturing} stackId="a" fill="var(--chart-3)" />
              <Bar dataKey="battery_manufacturing" name={STAGE_LABELS.battery_manufacturing} stackId="a" fill="var(--chart-4)" />
              <Bar dataKey="use_phase" name={STAGE_LABELS.use_phase} stackId="a" fill="var(--chart-1)" />
              {STAGE_KEYS.filter((k) => k === "maintenance" || k === "end_of_life").map((k) => <Bar key={k} dataKey={k} name={`${STAGE_LABELS[k]} — not modelled`} stackId="a" fill="var(--chart-5)" legendType="none" />)}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Panel>
      <Panel title="Demo assumptions" className="mt-4">
        <ul className="grid gap-2 text-sm sm:grid-cols-2">
          <li>Lifetime distance: <span className="font-mono">{a.lifetimeKm} km</span></li>
          <li>BEV battery/wheel-side consumption: <span className="font-mono">{a.bevKwhPerKm} kWh/km</span>, charging efficiency <span className="font-mono">{a.chargingEfficiency}</span>; divided once to obtain delivered grid electricity.</li>
          <li>BEV battery capacity: <span className="font-mono">{a.bevBatteryKwh} kWh</span> (counted once, glider factor excludes battery)</li>
          <li>Petrol consumption: <span className="font-mono">{a.petrolLPerKm} L/km</span></li>
          <li>Electricity factor: kg CO2e per kWh delivered at charger; excludes vehicle charging losses.</li>
          <li>Petrol use: tank-to-wheel tailpipe only; upstream fuel production excluded.</li>
        </ul>
      </Panel>
    </>
  );
}
