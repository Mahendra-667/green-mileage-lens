import type { ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { STATUS_LABELS, type EvidenceStatus } from "@/lib/lca/types";
import { cn } from "@/lib/utils";

const STATUS_CLASS: Record<EvidenceStatus, string> = {
  verified: "bg-status-verified/15 text-status-verified border-status-verified/40",
  proxy: "bg-status-proxy/15 text-status-proxy border-status-proxy/40",
  illustrative: "bg-status-illustrative/15 text-status-illustrative border-status-illustrative/40",
  needs_review: "bg-status-review/15 text-status-review border-status-review/40",
};

export function StatusBadge({ status }: { status: EvidenceStatus }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-sm border px-1.5 py-0.5 font-mono text-[11px] uppercase tracking-wide whitespace-nowrap", STATUS_CLASS[status])}>
      <span className="size-1.5 rounded-full bg-current" />
      {STATUS_LABELS[status]}
    </span>
  );
}

export function PageHeader({ eyebrow, title, children }: { eyebrow: string; title: string; children?: ReactNode }) {
  return (
    <header className="mb-8 border-b border-border pb-6">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">{eyebrow}</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">{title}</h1>
      {children && <div className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">{children}</div>}
    </header>
  );
}

export function Panel({ title, children, className, action }: { title?: string; children: ReactNode; className?: string; action?: ReactNode }) {
  return (
    <section className={cn("rounded-md border border-border bg-card p-5", className)}>
      {title && (
        <div className="mb-4 flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground">{title}</h2>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function Notice({ tone = "warn", children }: { tone?: "warn" | "error" | "info"; children: ReactNode }) {
  const cls = {
    warn: "border-status-illustrative/40 bg-status-illustrative/10",
    error: "border-destructive/40 bg-destructive/10",
    info: "border-primary/30 bg-primary/5",
  }[tone];
  return (
    <div className={cn("flex gap-2 rounded-md border p-3 text-sm text-foreground", cls)}>
      <AlertTriangle className="mt-0.5 size-4 shrink-0" />
      <div className="leading-relaxed">{children}</div>
    </div>
  );
}

export const fieldClass =
  "h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring";
