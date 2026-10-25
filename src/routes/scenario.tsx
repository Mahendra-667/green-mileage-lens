import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { getFactor } from "@/lib/lca/data";
import { bevElectricityKwh, fmt, validateQuantity } from "@/lib/lca/calc";
import { assessBev, DEMO_ASSUMPTIONS } from "@/lib/lca/vehicles";
import type { Factor } from "@/lib/lca/types";
import { fieldClass, Notice, PageHeader, Panel, StatusBadge } from "@/components/lca/ui";
import { pageHead } from "@/lib/lca/meta";

export const Route = createFileRoute("/scenario")({
  head: () => pageHead("Scenario Analysis", "Adjust an illustrative grid electricity emissions factor and recalculate the BEV use-phase result against baseline."),
  component: ScenarioPage,
});

function ScenarioPage() {
  const base = getFactor("F-NRG-GRID")!;
  const [raw, setRaw] = useState("0.45");
  const v = validateQuantity(raw);
  const scenarioFactor: Factor = { ...base, id: "SCENARIO-GRID", name: "User scenario grid factor", value: v.ok ? v.value : null, status: "illustrative" };
  const baseline = assessBev(base);
  const scenario = assessBev(scenarioFactor);
  const use = (a: typeof baseline) => {
    const s = a.stages.find((x) => x.stage === "use_phase");
    return s?.status === "modelled" ? s.result.impact : null;
  };
  const kwh = bevElectricityKwh({ distanceKm: DEMO_ASSUMPTIONS.lifetimeKm, kwhPerKm: DEMO_ASSUMPTIONS.bevKwhPerKm, chargingEfficiency: DEMO_ASSUMPTIONS.chargingEfficiency });
  const b = use(baseline), s = use(scenario);

  return (
    <>
      <PageHeader eyebrow="Scenario Analysis" title="Grid electricity sensitivity — BEV use phase">
        Only the electricity emissions factor changes. Distance, consumption, charging efficiency and all other stages are held constant.
      </PageHeader>
      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="Scenario input">
          <div className="mb-3"><StatusBadge status="illustrative" /></div>
          <label className="block text-sm"><span className="mb-1 block text-muted-foreground">Grid factor (kg CO2e/kWh)</span>
            <input className={`${fieldClass} font-mono`} value={raw} onChange={(e) => setRaw(e.target.value)} inputMode="decimal" /></label>
          <input type="range" min={0} max={1.2} step={0.01} value={v.ok ? v.value : 0} onChange={(e) => setRaw(e.target.value)} className="mt-3 w-full accent-primary" />
          <p className="mt-2 text-xs text-muted-foreground">Baseline (illustrative): <span className="font-mono">{base.value} kg CO2e/kWh</span></p>
          {!v.ok && <div className="mt-3"><Notice tone="error">{v.error}</Notice></div>}
        </Panel>
        <Panel title="Use-phase result" className="lg:col-span-2">
          <div className="grid grid-cols-3 gap-4">
            {[["Baseline", b], ["Scenario", s], ["Change", b !== null && s !== null ? s - b : null]].map(([k, val]) => (
              <div key={k as string}>
                <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">{k}</p>
                <p className="tabular mt-1 font-mono text-2xl font-semibold text-foreground">{val === null ? "—" : fmt(val as number)}</p>
                <p className="text-xs text-muted-foreground">kg CO2e</p>
              </div>
            ))}
          </div>
          <div className="mt-5 border-t border-border pt-4 text-sm text-muted-foreground">
            <p><span className="font-medium text-foreground">What changed:</span> grid factor {base.value} → {v.ok ? v.value : "invalid"} kg CO2e/kWh.</p>
            <p className="mt-1 font-mono text-xs">Use phase = {kwh.ok ? fmt(kwh.value) : "?"} kWh drawn from grid × grid factor</p>
            <p className="mt-2">Modelled BEV subtotal: baseline {fmt(baseline.modelledTotal)} → scenario {fmt(scenario.modelledTotal)} kg CO2e (manufacturing and battery unchanged; maintenance and end-of-life still not modelled).</p>
          </div>
        </Panel>
      </div>
    </>
  );
}
