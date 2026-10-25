import { fmt, STAGE_LABELS, type VehicleAssessment } from "@/lib/lca/calc";
import { StatusBadge } from "./ui";

export function StageTable({ a }: { a: VehicleAssessment }) {
  return (
    <table className="w-full text-sm">
      <tbody className="divide-y divide-border">
        {a.stages.map((s) => (
          <tr key={s.stage} className="align-top">
            <td className="py-2 pr-2 text-foreground">{STAGE_LABELS[s.stage]}</td>
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
          <td className="py-2.5">Modelled subtotal</td>
          <td className="py-2.5 text-right font-mono tabular">{fmt(a.modelledTotal)}</td>
          <td className="py-2.5 pl-2 text-right text-xs font-normal text-muted-foreground">kg CO2e</td>
        </tr>
      </tbody>
    </table>
  );
}
