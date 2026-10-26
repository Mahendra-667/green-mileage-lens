<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Architecture
- Keep the existing TanStack route tree and one shared AppShell main landmark so navigation and metadata stay coherent.
- Centralize arithmetic/stage validation in `src/lib/lca/calc.ts`; invalid assessments expose no numeric totals or stage results to prevent misleading comparisons.
- Build chart rows through `src/lib/lca/chart.ts` with null for non-modelled/inapplicable/invalid stages so missing values cannot imply zero emissions.
- Validate browser records through `src/lib/lca/records.ts` before reads/writes/exports, and publish cache changes only after successful storage writes so failed saves are never reported as persistent.
- Capture source/assumption snapshots at save time and centralize CSV serialization in `src/lib/lca/csv.ts` so historical provenance and export safety remain testable outside route modules.
