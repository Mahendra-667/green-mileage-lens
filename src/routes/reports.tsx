import { createFileRoute, Link } from "@tanstack/react-router";
import { Download, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { fmt } from "@/lib/lca/calc";
import { clearAssessments, removeAssessment, useAssessments, useStorageError } from "@/lib/lca/store";
import { toCsv } from "@/lib/lca/csv";
import { Notice, PageHeader, StatusBadge } from "@/components/lca/ui";
import { pageHead } from "@/lib/lca/meta";

export const Route = createFileRoute("/reports")({
  head: () => pageHead("Reports", "Saved assessment results with inputs, factors and source references, exportable as CSV."),
  component: ReportsPage,
});

function ReportsPage() {
  const rows = useAssessments();
  const storageError = useStorageError();
  const [pending, setPending] = useState<string | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);
  const destroy = () => {
    if (pending === null) return;
    const result = pending === "all" ? clearAssessments() : removeAssessment(pending);
    if (!result.ok) toast.error(result.error);
    else toast.success(pending === "all" ? "Saved records cleared from this browser" : "Assessment deleted");
    setPending(null);
  };
  const download = () => {
    let url: string | undefined;
    try {
      url = URL.createObjectURL(new Blob(["\uFEFF", toCsv(rows)], { type: "text/csv;charset=utf-8" }));
      const a = Object.assign(document.createElement("a"), { href: url, download: "GreenAuto-Lens-assessments.csv" });
      document.body.appendChild(a);
      a.click();
      a.remove();
      setExportError(null);
    } catch {
      const message = "CSV export failed. Your saved records were not changed. Check browser download permissions and try again.";
      setExportError(message);
      toast.error(message);
    } finally {
      if (url) { const downloadUrl = url; setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000); }
    }
  };

  return (
    <>
      <PageHeader eyebrow="Reports" title="Assessment results">
        GreenAuto Lens single-activity assessments. Factor, source and assumptions are captured at calculation time. Stored in this browser only — no Cloud database or multi-user persistence.
      </PageHeader>
      <div className="mb-4 flex flex-wrap gap-2">
        <Button onClick={download} disabled={!rows.length}><Download /> Export CSV</Button>
        <Button variant="outline" onClick={() => setPending("all")} disabled={!rows.length && !storageError}><Trash2 /> Clear saved data</Button>
      </div>
      <Notice>Illustrative — not real-world data. Results cover individual activities, not complete vehicle lifecycles; do not cite them as Indian LCA results. CSV includes coverage warnings and source snapshots.</Notice>
      {(storageError || exportError) && <div className="mt-4"><Notice tone="error">{storageError || exportError}</Notice></div>}
      <div className="mt-4 overflow-x-auto rounded-md border border-border bg-card">
        <table className="w-full min-w-[850px] text-sm">
          <thead className="border-b border-border bg-muted text-left font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
            <tr>{["Date", "Label / coverage", "Input", "Factor / provenance", "Result", "Evidence", "Actions"].map((h) => <th scope="col" key={h} className="px-3 py-2.5 font-medium">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((r) => (
              <tr key={r.id}>
                <td className="px-3 py-2.5 font-mono text-xs">{new Date(r.createdAt).toLocaleString("en-IN")}</td>
                <td className="px-3 py-2.5">{r.label}<p className="text-xs text-muted-foreground">Single activity · partial coverage</p></td>
                <td className="px-3 py-2.5 font-mono">{fmt(r.quantity)} {r.activityUnit}</td>
                <td className="px-3 py-2.5 text-xs">{r.factor.name}<br /><span className="font-mono text-muted-foreground">{r.factor.value} {r.factor.impactUnit}/{r.factor.perUnit} · {r.factor.sourceId}</span><details className="mt-1"><summary className="cursor-pointer text-primary">Source & assumptions</summary><p>{r.sourceTitle}</p><p>{r.sourceReference ?? "Reference not captured in legacy record"}</p><p>{r.systemBoundary ?? "Boundary not captured"}</p><p>{r.assumptions ?? "No vehicle assumptions captured"}</p></details></td>
                <td className="px-3 py-2.5 font-mono font-semibold">{fmt(r.impact)} {r.impactUnit}</td>
                <td className="px-3 py-2.5"><StatusBadge status={r.factor.status} /><p className="mt-1 text-xs text-muted-foreground">Illustrative — not real-world data</p></td>
                <td className="px-3 py-2.5"><Button variant="ghost" size="icon" aria-label={`Delete ${r.label}`} title={`Delete ${r.label}`} onClick={() => setPending(r.id)} className="min-h-11 min-w-11 text-muted-foreground hover:text-destructive"><Trash2 className="size-4" /></Button></td>
              </tr>
            ))}
            {!rows.length && <tr><td colSpan={7} className="px-3 py-10 text-center text-muted-foreground">No assessments yet. <Link to="/assessment" className="text-primary underline">Run one</Link>.</td></tr>}
          </tbody>
        </table>
      </div>
      <AlertDialog open={pending !== null} onOpenChange={(open) => { if (!open) setPending(null); }}>
        <AlertDialogContent className="max-w-[calc(100%-2rem)] sm:max-w-lg">
          <AlertDialogHeader><AlertDialogTitle>{pending === "all" ? "Clear all saved data?" : "Delete this assessment?"}</AlertDialogTitle><AlertDialogDescription>This removes {pending === "all" ? "all assessment records" : "this record"} from this browser. Export a CSV first if you need a copy. This cannot be undone.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={destroy}>Confirm deletion</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
