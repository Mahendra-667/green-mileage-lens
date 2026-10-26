import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
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
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <div className="min-h-screen bg-background lg:flex">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:bg-background focus:p-3 focus:text-foreground">Skip to content</a>
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
        <Button variant="ghost" className="mx-3 mb-3 min-h-11 text-sidebar-foreground lg:hidden" aria-expanded={menuOpen} aria-controls="workspace-nav" onClick={() => setMenuOpen(!menuOpen)}>Workspace menu {menuOpen ? "−" : "+"}</Button>
        <nav id="workspace-nav" aria-label="Workspace" className={`${menuOpen ? "flex" : "hidden"} flex-col gap-1 px-3 pb-3 lg:flex`}>
          {NAV.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              activeOptions={{ exact: to === "/" }}
              onClick={() => setMenuOpen(false)}
              className="flex min-h-11 shrink-0 items-center gap-2.5 rounded-sm px-3 py-2 text-sm transition hover:bg-sidebar-accent focus-visible:outline-2 focus-visible:outline-sidebar-ring"
              activeProps={{ className: "bg-sidebar-accent font-medium", "aria-current": "page" }}
            >
              <Icon className="size-4" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="hidden px-5 pt-6 text-[11px] leading-relaxed opacity-60 lg:block">
          Prototype demonstrator. Not a verified or third-party-reviewed LCA tool. Seed data is illustrative. Browser-local storage only.
        </div>
      </aside>
      <main id="main-content" className="min-w-0 flex-1 px-4 py-6 lg:px-10 lg:py-10">
        <div className="mx-auto max-w-6xl"><p className="mb-5 border-b border-border pb-3 text-xs text-muted-foreground">GreenAuto Lens · Prototype demonstrator — not verified or third-party-reviewed. Illustrative — not real-world data.</p>{children}</div>
      </main>
    </div>
  );
}
