import { fmt, STAGE_LABELS, type VehicleAssessment } from "@/lib/lca/calc";
import { Notice, StatusBadge } from "./ui";

export function StageTable({ a }: { a: VehicleAssessment }) {
  return (
    <div className="min-w-0">
    {!a.valid && <Notice tone="error"><strong>Assessment blocked — total unavailable.</strong> {a.errors.join(" ")}</Notice>}
    <p className="mb-3 text-xs text-muted-foreground">{a.complete ? "Defined stages covered" : "Incomplete coverage"} · {a.modelledCount}/{a.applicableCount} applicable stages modelled · Illustrative — not real-world data</p>
    <table className="w-full text-sm">
      <thead className="text-left text-xs text-muted-foreground"><tr><th scope="col">Stage</th><th scope="col" className="text-right">kg CO2e</th><th scope="col" className="text-right">Evidence</th></tr></thead>
      <tbody className="divide-y divide-border">
        {a.stages.map((s) => (
          <tr key={s.stage} className="align-top">
            <th scope="row" className="py-2 pr-2 text-left font-normal text-foreground">{STAGE_LABELS[s.stage]}<span className="block text-xs text-muted-foreground">{s.status === "modelled" ? "Modelled" : s.status === "not_applicable" ? "Not applicable" : "Not modelled"}</span>{s.status === "modelled" && <span className="block break-words font-mono text-[10px] text-muted-foreground" title={`${s.factor.name}: ${s.factor.value} ${s.factor.impactUnit}/${s.factor.perUnit}`}>{s.factor.id} · {s.factor.sourceId}</span>}</th>
            {s.status === "modelled" && (
              <>
                <td className="py-2 text-right font-mono tabular">{fmt(s.result.impact)}</td>
                <td className="py-2 pl-2 text-right"><StatusBadge status={s.factor.status} /></td>
              </>
            )}
            {s.status === "not_applicable" && <td colSpan={2} className="py-2 text-right text-xs text-muted-foreground">Not applicable</td>}
            {s.status === "not_modelled" && <td colSpan={2} className="py-2 text-right text-xs text-destructive">Not modelled — {s.reason}</td>}
          </tr>
        ))}
        <tr className="font-semibold">
          <td className="py-2.5">Partial illustrative subtotal</td>
          <td className="py-2.5 text-right font-mono tabular">{a.modelledTotal === null ? "Unavailable" : fmt(a.modelledTotal)}</td>
          <td className="py-2.5 pl-2 text-right text-xs font-normal text-muted-foreground">kg CO2e</td>
        </tr>
      </tbody>
    </table>
    </div>
  );
}
