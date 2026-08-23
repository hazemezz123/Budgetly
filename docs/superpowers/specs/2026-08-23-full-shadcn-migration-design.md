# Design: Full shadcn/ui Migration of Budgetly

**Date:** 2026-08-23
**Status:** Approved (pending implementation)
**Follows:** `docs/superpowers/specs/2026-08-23-profile-house-addexpense-responsive-design.md` (foundation + 3 pages) — this spec expands to the remaining 56 files.

## Problem

shadcn is installed but only 3 pages consume it (`AddExpensePage`, `ProfilePage`, `HouseDetailsPage` plus `RoleRotationSettings`). The other 16 pages (`Login`, `Register`, `ForgotPassword`, `ResetPassword`, `HouseSelectionPage`, `ExpensesPage`, `MyInvoicesPage`, `AllInvoicesPage`, `AnalyticsPage`, `About`, `Guide`, `ContactDeveloper`, `NotesPage`, `AIPage`, `DashboardPage`, `NotFoundPage`) and 32 module components plus `shared/{Input,Select,ConfirmModal,Loader}` and `app/layout/AppShell` still use plain Tailwind + bespoke primitives, creating two design systems.

## Decisions (user-approved)

| Decision | Choice |
|---|---|
| Scope | Phased by route group (4 phases), not big-bang |
| Visual style | Keep current look (gold/RTL/rounded-3xl) — theme-by-reference, not shadcn defaults |
| Selects | Mixed: native `<select>` on expense/invoice/note filters; Radix `ui/select` on dashboard/admin pickers |
| Cleanup | Delete `shared/Input,Select,ConfirmModal,Loader` after final phase |

## Section 1 — Architecture & Foundation

**Live foundation (do not rebuild):** `@` alias via `vite.config.js` (`path.resolve(__dirname,"./src")`), `src/lib/utils.js` (`cn = twMerge(clsx(...))`), 10 `src/components/ui/*` (`button`, `card`, `input`, `label`, `textarea`, `dialog`, `sheet`, `tabs`, `avatar`, `badge`), `components.json` (`new-york`, `neutral`, `tsx:false`), `index.css` `@theme inline` mapping (`--background: var(--color-bg)` etc. referencing Budgetly tokens so `.dark` redefinitions flow automatically), `App.jsx` `Direction.DirectionProvider dir="rtl"`, `index.html` viewport `maximum-scale=1.0`, global `select { color-scheme }` + `option` dark-contrast fix.

**Primitives to add** (via `npx shadcn@latest add -y -o`): `table` (invoices), `select` (Radix variant only for dashboard/admin — see Section 3), `alert-dialog` (all `ConfirmModal` + `window.confirm`), `sonner` (replaces `Toast`), `drawer` (mobile history/notes, `vaul` under the hood), `skeleton`/`spinner` (replaces `Loader`), `scroll-area`, `separator`, `progress` (analytics bars), `dropdown-menu` (user menus). Keep `card`, `input`, `badge`, `avatar` where available.

**Migration rule:** handlers/state/hooks byte-identical — pure presentation. `shared/Input` with `icon` prop is reimplemented as relative-wrapper + absolute `lucide` at `right-3` + `pr-9` on `ui/input`, sized via `w-4 h-4` (avoids reintroducing the pre-pass inline-style pattern). `shared/ConfirmModal` (already bottom-sheet responsive) is replaced by `ui/alert-dialog` for simple confirms and by responsive `Dialog` with `avatarDialogClasses` (`top-auto bottom-0 ... sm:top-1/2`) + `sm:hidden` drag handle for large content modals (`ExpenseDetailsModal` 340 lines, `RequestDetailsModal`). `Loader` becomes `ui/skeleton` or centered `Spinner`. Every page that today imports from `shared/components` will import from `@/components/ui/*` instead. No new `radix-ui` barrel divergence — keep `from "radix-ui"` imports consistent with existing generated files.

**End state:** `shared/components/Input.jsx` (311 lines), `Select.jsx` (226 lines), `ConfirmModal.jsx`, `Loader.jsx` deleted; `shared/index.js` barrel trimmed to shell-only; no `bg-transparent` selects remain (closed state uses `bg-(--color-bg)` to match `option` fix); no inline `style={{ color:"var(--color-dark)" }}` objects remain.

## Section 2 — Phased Breakdown (by route group)

All phases keep `npm run lint` + `npm run build` clean and a working preview.

**Phase 1 — Warm-up / shared primitives (~10 files, low risk):**
Generate the missing `ui/*` primitives above. Migrate static/auth: `LoginPage` (86 lines, 2 inputs), `RegisterPage` (123, 5 inputs), `ForgotPasswordPage` (93, raw input+motion), `ResetPasswordPage` (111), `AboutPage` (338 static), `GuidePage` (121), `NotFoundPage` (36), `ContactDeveloperPage` (133, 3 Inputs + raw textarea). Migrate `AuthCard` + `GoogleSignInButton`. Replace `Toast.jsx` (80 lines, `color-mix` variants, 4s auto-dismiss) with `sonner` keeping the `useToast()` call shape.

**Phase 2 — Core finance & content (~15 files, medium):**
`ExpensesPage` (129, orchestrator) + `ExpensesList`, `ExpensesHeader`, `ExpensesFiltersPanel` (Select for user + Input min/max), `ExpenseCard` (152, category icons), `ExpensesPagination`, `ExpensesResultsSummary`, `ExpenseDetailsModal` (340, 8-row bottom-sheet + `useModalA11y` → Dialog). `NotesPage` (51) + `NoteCard`, `NoteList`, `NoteFilters` (search+select), `NoteReplySection` (auto-rows textarea `min(max(lines+1,1),6)`), `CreateNoteForm` (48). `DashboardPage` (61 shell) + `StatCard`, `AdminDashboard`, `UserDashboard`, `QuoteCard`, `WelcomeModal` (79, `framer-motion` → Dialog). `AnalyticsPage` (239, 4 summary cards + category bars `width%` → `ui/progress`). Finish `RoleRotationWidget` (36) + polish remaining raw `input/select` in `RoleRotationSettings`.

**Phase 3 — Invoices (high complexity, ~12 files):**
`MyInvoicesPage` (176, `ConfirmModal` x3, card grid `lg:grid-cols-3`, client-side `slice()` pagination, bulk-pay) with `MyInvoicesHeader`/`Filters`/`Pagination`, `InvoiceCard`/`RequestCard`. `AllInvoicesPage` (299, raw pending-requests `<table>` + `MobileRequestCard`, admin user-stats `grid-cols-4` selectable cards) with `InvoicesTable.jsx` (224, `@tanstack/react-table` `useReactTable` + `globalFilter` + `getSortedRowModel`/`getPaginationRowModel` + `flexRender` + `ArrowUpDown` sort) + `MobileInvoiceCard`, `StatusBadge` → `ui/badge`. Preserve TanStack logic, wrap with `ui/table` + `ui/input` search + `ui/button` pagination; keep desktop `table` ↔ `md:hidden` `Mobile*Card` duality. `RequestDetailsModal` (113) → Dialog.

**Phase 4 — Shell + AI + cleanup (~12 files, rewrite risk):**
`AppShell.jsx` (16, `md:flex-row` + `max-w-7xl mx-auto p-3 sm:p-6 lg:p-8 pb-24 md:pb-8`), `Navbar.jsx` (292, `md:hidden` top lock banner + `grid-cols-5` bottom tabs + `ConfirmModal` logout), `Sidebar.jsx` (363, `md:flex` collapsible with `navGroups` role filter + `absolute right-full` collapsed tooltips). Keep custom layout; style with tokens — do not adopt shadcn `SidebarProvider` kit. `AIPage` (238, `framer-motion AnimatePresence` + `ReactMarkdown` bubbles + history `w-1/4 hidden md:flex`) + `AIAssistant` (389, `fixed bottom-24` widget) + `AIButton` (41, FAB). Sweep `client/src`: delete the four old shared primitives, update barrel, replace any remaining `window.confirm` (`RoleRotationSettings handleReset`, `NoteCard handleDelete` already queued for `AlertDialog`), ensure `grep -r "shared/components/(Input|Select|ConfirmModal|Loader)" client/src` is empty, `grep -r "window.confirm"` empty, `grep -r "bg-transparent"` on selects empty, `grep -r "style={{"` on pages empty.

## Section 3 — Key Technical Decisions

- **Fidelity over defaults:** new `ui/*` files are themed by reference (`--primary: var(--color-primary)` etc.), so `bg-card` = `var(--color-surface)` and `border` = `#c3cedd`/`#2a2a2e`. `rounded-3xl`/`p-6`/`backdrop-blur-xl` classes stay verbatim; no shadcn radius remapping (it would silently change `rounded-lg/xl` everywhere — omitted deliberately in the foundation).
- **Selects:** expense/invoice/note filters keep native `<select>` (`h-11 sm:h-10 w-full rounded-xl border border-(--color-border) bg-(--color-bg) text-(--color-dark) color-scheme: light/dark` + `option { background: var(--color-bg); color: var(--color-dark) }` global fix already committed). Dashboard/admin user pickers (`AllInvoicesPage` selectable cards' `<select>` if any, `AdminDashboard` filters) use Radix `ui/select` where the dropdown benefits from fully themed styling.
- **Modals:** simple confirms (`ConfirmModal` types `danger/warning/info/primary`, 4 on `HouseDetailsPage`, 3 on `MyInvoicesPage`) → `ui/alert-dialog`. Large content modals keep scrollable `DialogContent` with the responsive `avatarDialogClasses` pattern verified in Phase 1 review (overriding `top-[50%] left-[50%] -translate-x/y-1/2 max-w-[calc(100%-2rem)]` via matching-modifier `top-auto bottom-0 left-0 right-0 translate-x-0 translate-y-0 max-w-none w-full rounded-t-3xl rounded-b-none border-b-0 ... sm:top-1/2` + `group-data-[orientation]` fixes for `TabsList`).
- **Inputs:** `shared/Input` parity (sizes `sm/md/lg`, variants `default/filled/outlined`, password `Eye/Off`, `hint/error/success`, `showCharCount`) is not re-implemented one-for-one — only the actually used features per page are carried (labels via `ui/label`, password toggle where `ResetPasswordPage`/`LoginPage` need it, char-count where `CreateNoteForm` needs it). Icon-in-input uses the `Input.jsx`-era RTL convention: absolute `right-3` + `pr-12`/`pr-10` via `pr-9` on `ui/input`, keeping `pointer-events-none` on the icon span.
- **Loader & Toaster:** `Loader.jsx` (21, `Loader2` + `بنحمّل...`) is not a component-for-component swap — use `ui/skeleton` for card/table skeletons and a centered `Spinner` for full-page loading, keeping the `text` prop string. `Toast` variants map to `sonner`'s `toast.success/error/warning/info` with the same `color-mix` tints where possible.
- **Table:** `InvoicesTable.jsx` keeps TanStack state (`globalFilter`, sorting, pagination) unchanged; only its JSX shell becomes `ui/table` (`Table`, `TableHeader`, `TableRow`, `TableHead` with `ArrowUpDown` sort button via `ui/button variant="ghost"`), search `Input`, pagination `Button`s.

## Section 4 — Verification, Risks & Success Criteria

**Automated per phase:** `npm run lint` + `npm run build` in `client/` exit 0; no new `eslint` disables beyond the 3 already in generated `badge/button/tabs.jsx` for `react-refresh/only-export-components`.

**Manual viewport matrix (RTL + `.dark` toggled):** `375 / 390 / 412 / 768 / 1024+` — bottom-sheet `Dialog`s show `sm:hidden` drag handle at 36px width, centered max-w above; `min-h-[44px]` targets hold; `TabsList` active pill gold `bg-(--color-primary)` / ink `text-(--color-on-fill)` survives both `group-data-[orientation]` and `dark:data-[state=active]` overrides (Phase 3 review fixes); selects show light-on-dark / dark-on-light correctly.

**Risks & mitigations:**
- `InvoicesTable` + `Mobile*Card` duality — covered by keeping TanStack logic untouched; only styling layer changes.
- `Navbar/Sidebar` collapsed tooltips `absolute right-full` — preserve verbatim positioning; style with `bg-(--color-surface) border-(--color-border)` not `SidebarProvider`.
- Radix `Select` feeling less native on phones — contained to dashboard/admin per mixed strategy.
- Bundle delta — `vendor-ui` chunk already `~200kB`; new `table/select` add ~15kB gzipped tracked in `dist/assets/*.css` (`95.75kB` baseline).

**Success criteria (final phase):**
- `rg -n "from.*shared/components/(Input|Select|ConfirmModal|Loader)" client/src` = 0
- `rg -n "window\\.confirm" client/src` = 0
- All 19 pages import primitives only from `@/components/ui/*` where a primitive is used; native `select`s carry `bg-(--color-bg)` + `color-scheme` classes
- `npm run build` passes; `git log --oneline` shows 4 phased commits (one per phase above), each bisectable.

## Out of Scope

- Backend `server/` changes.
- New features or routes.
- Replacing `@tanstack/react-table` with another data library.
- Adopting `shadcn SidebarProvider` kit wholesale.
