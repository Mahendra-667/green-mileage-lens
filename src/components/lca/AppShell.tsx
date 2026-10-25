import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { BarChart3, BookOpen, Car, Database, FileText, FlaskConical, LayoutDashboard, Library, SlidersHorizontal } from "lucide-react";

const NAV = [
  { to: "/", label: "Overview", icon: LayoutDashboard },
  { to: "/database", label: "Environmental Database", icon: Database },
  { to: "/evidence", label: "Evidence Registry", icon: Library },
  { to: "/assessment", label: "LCA Assessment", icon: FlaskConical },
  { to: "/comparison", label: "Vehicle Comparison", icon: Car },
  { to: "/scenario", label: "Scenario Analysis", icon: SlidersHorizontal },
  { to: "/methodology", label: "Methodology", icon: BookOpen },
  { to: "/reports", label: "Reports", icon: FileText },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background lg:flex">
      <aside className="border-b border-sidebar-border bg-sidebar text-sidebar-foreground lg:sticky lg:top-0 lg:h-screen lg:w-64 lg:shrink-0 lg:border-b-0 lg:border-r">
        <div className="flex items-center gap-2 px-5 py-4 lg:py-6">
          <div className="grid size-8 place-items-center rounded-sm bg-sidebar-primary text-sidebar-primary-foreground">
            <BarChart3 className="size-4" />
          </div>
          <div>
            <p className="text-sm font-semibold leading-none">GreenAuto Lens</p>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-widest opacity-60">India auto LCA · v0.1</p>
          </div>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:overflow-visible">
          {NAV.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              activeOptions={{ exact: to === "/" }}
              className="flex shrink-0 items-center gap-2.5 rounded-sm px-3 py-2 text-sm opacity-75 transition hover:bg-sidebar-accent hover:opacity-100"
              activeProps={{ className: "bg-sidebar-accent !opacity-100 font-medium" }}
            >
              <Icon className="size-4" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="hidden px-5 pt-6 text-[11px] leading-relaxed opacity-60 lg:block">
          Prototype demonstrator. Not a verified or third-party-reviewed LCA tool. Seed data is illustrative.
        </div>
      </aside>
      <main className="min-w-0 flex-1 px-5 py-8 lg:px-10 lg:py-10">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
