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
  const base = getFactor("F-NRG-GRID");
  const [raw, setRaw] = useState("0.45");
  if (!base) return <Notice tone="error">Baseline electricity factor unavailable.</Notice>;
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
      <div className="mb-4"><Notice tone="info">Local scenario only — the environmental dataset is unchanged. Both results are illustrative and incomplete, not lifecycle totals.</Notice></div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="Scenario input">
          <div className="mb-3"><StatusBadge status="illustrative" /></div>
          <label className="block text-sm"><span className="mb-1 block text-muted-foreground">Grid factor (kg CO2e/kWh)</span>
            <input className={`${fieldClass} font-mono`} value={raw} onChange={(e) => setRaw(e.target.value)} inputMode="decimal" /></label>
          <input aria-label="Adjust local delivered grid factor" type="range" min={0} max={1.2} step={0.01} value={v.ok ? Math.min(v.value, 1.2) : 0} onChange={(e) => setRaw(e.target.value)} className="mt-3 min-h-11 w-full accent-primary" />
          <p className="mt-2 text-xs text-muted-foreground">Per kWh delivered at charger; excludes vehicle charging losses. Slider spans 0–1.2; numeric input accepts any finite non-negative value.</p>
          <p className="mt-2 text-xs text-muted-foreground">Baseline (illustrative): <span className="font-mono">{base.value} kg CO2e/kWh</span></p>
          {!v.ok && <div className="mt-3"><Notice tone="error">{v.error}</Notice></div>}
        </Panel>
        <Panel title="Use-phase result" className="lg:col-span-2">
          <div className="grid gap-4 sm:grid-cols-3" aria-live="polite">
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
            <p className="mt-2">Partial illustrative BEV subtotal: baseline {baseline.modelledTotal === null ? "unavailable" : fmt(baseline.modelledTotal)} → scenario {scenario.modelledTotal === null ? "unavailable" : fmt(scenario.modelledTotal)} kg CO2e.</p>
            <p className="mt-1">Coverage: baseline {baseline.modelledCount}/{baseline.applicableCount}, scenario {scenario.modelledCount}/{scenario.applicableCount} applicable stages modelled. Maintenance and end of life not modelled.</p>
            <dl className="mt-3 grid grid-cols-2 gap-2 text-xs"><dt>Distance (before → after)</dt><dd>{DEMO_ASSUMPTIONS.lifetimeKm} → {DEMO_ASSUMPTIONS.lifetimeKm} km</dd><dt>Battery/wheel consumption</dt><dd>{DEMO_ASSUMPTIONS.bevKwhPerKm} → {DEMO_ASSUMPTIONS.bevKwhPerKm} kWh/km</dd><dt>Charging efficiency</dt><dd>{DEMO_ASSUMPTIONS.chargingEfficiency} → {DEMO_ASSUMPTIONS.chargingEfficiency} (applied once)</dd><dt>Battery capacity</dt><dd>{DEMO_ASSUMPTIONS.bevBatteryKwh} → {DEMO_ASSUMPTIONS.bevBatteryKwh} kWh</dd></dl>
            {!scenario.valid && <Notice tone="error">Assessment blocked: {scenario.errors.join(" ")}</Notice>}
          </div>
        </Panel>
      </div>
    </>
  );
}
