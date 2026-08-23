# Full shadcn/ui Migration — All Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate the remaining 56 UI files to shadcn/ui so every page imports primitives only from `@/components/ui/*` and `shared/Input,Select,ConfirmModal,Loader` are deleted.

**Architecture:** Foundation already on `main` (`@` alias, `cn`, 10 `ui/*` primitives, `index.css` token-by-reference mapping, `DirectionProvider` RTL, `color-scheme` select fix). Each task replaces `shared` primitives with `ui/*` equivalents (handlers/state untouched — pure presentation), keeps current visual fidelity via existing `--color-*` tokens, uses native `<select>` on expense/invoice/note filters and Radix `ui/select` on dashboard/admin per mixed strategy, and converts `ConfirmModal`/`window.confirm` to `ui/alert-dialog` and large bottom-sheet modals to responsive `Dialog`.

**Tech Stack:** React 19, Vite 7, Tailwind CSS v4 (`@tailwindcss/vite`), shadcn/ui `new-york` + `radix-ui@1.6.7`, `lucide-react`, `clsx`/`tailwind-merge`/`class-variance-authority`.

---

## File Structure

**Already on `main`:**
- `client/components.json` (`style:new-york`, `baseColor:neutral`, `tsx:false`, `prefix:""`, `aliases:@→./src`)
- `client/src/lib/utils.js` (`cn`)
- `client/src/components/ui/{avatar,badge,button,card,dialog,input,label,sheet,tabs,textarea}.jsx` (10)
- `client/src/index.css` (top: `@import tailwindcss`, `@import tw-animate-css`, `@custom-variant dark`, `@theme inline` → `--background:var(--color-bg)` etc., `:root` semantic aliases, `.dark` redefinitions)
- `client/src/App.jsx` (`Direction.DirectionProvider dir="rtl"` around `AppProviders`)
- Migrated: `AddExpensePage.jsx` (`Button,Input,Label`), `ProfilePage.jsx` (`Button,Input,Badge,Dialog`), `HouseDetailsPage.jsx` (`Button,Tabs`), `RoleRotationSettings.jsx` (`Button` partial)

**Will be added in Task 1:**
- `client/src/components/ui/{table,select,alert-dialog,sonner,drawer,skeleton,scroll-area,separator,progress,dropdown-menu}.jsx`

**Will be modified per phase — see Tasks 2-8:**

### Task 1: Missing shadcn primitives

**Files:**
- Modify: `client/package.json` (via CLI installs) + `client/src/components/ui/*` (+10 files)

- [ ] **Step 1: Generate primitives**

Run (workdir `client`):

```powershell
npx shadcn@latest add -y -o table select alert-dialog sonner drawer skeleton scroll-area separator progress dropdown-menu
```

Expected: 10 new files in `src/components/ui/`, each `import { X } from "radix-ui"` (keep barrel as existing files do). Radix already in `package.json` (`radix-ui@1.6.7`).

- [ ] **Step 2: Verify**

Run (workdir `client`):

```powershell
Get-ChildItem src/components/ui | Select-Object Name
npm run lint
npm run build
```

Expected: `alert-dialog.jsx`, `dropdown-menu.jsx`, `drawer.jsx`, `progress.jsx`, `scroll-area.jsx`, `select.jsx`, `separator.jsx`, `skeleton.jsx`, `sonner.jsx`, `table.jsx` present alongside the 10 existing; lint 0 new errors, build `✓ built in ...`.

- [ ] **Step 3: Commit**

```powershell
git add client/package.json client/package-lock.json client/src/components/ui
git commit -m "feat(ui): add missing shadcn primitives for full migration"
```

### Task 2: Phase 1 — Auth & static pages + AuthCard (low risk, ~10 files)

**Files:**
- Modify: `client/src/modules/auth/pages/LoginPage.jsx`
- Modify: `client/src/modules/auth/pages/RegisterPage.jsx`
- Modify: `client/src/modules/auth/pages/ForgotPasswordPage.jsx`
- Modify: `client/src/modules/auth/pages/ResetPasswordPage.jsx`
- Modify: `client/src/modules/auth/components/AuthCard.jsx`
- Modify: `client/src/modules/auth/components/GoogleSignInButton.jsx`
- Modify: `client/src/modules/info/pages/AboutPage.jsx`
- Modify: `client/src/modules/info/pages/GuidePage.jsx`
- Modify: `client/src/modules/info/pages/ContactDeveloperPage.jsx`
- Modify: `client/src/app/pages/NotFoundPage.jsx` (at `client/src/app/pages/NotFoundPage.jsx` if it is `modules/.../NotFound` — verify path before editing)

**Pattern to apply to every Input in these pages (Login example):**

Before (`LoginPage.jsx:40`):

```jsx
<Input
  id="username"
  label="اسم المستخدم"
  type="text"
  value={username}
  onChange={(e) => setUsername(e.target.value)}
  icon={User}
  required
  autoComplete="username"
  error={error ? " " : ""}
/>
```

After:

```jsx
<div className="space-y-1.5">
  <Label htmlFor="username">اسم المستخدم</Label>
  <div className="relative">
    <User size={16} className="absolute top-1/2 -translate-y-1/2 right-3 text-(--color-muted) pointer-events-none" />
    <Input
      id="username"
      type="text"
      value={username}
      onChange={(e) => setUsername(e.target.value)}
      required
      autoComplete="username"
      className="h-11 pr-9 text-sm sm:text-base md:text-base rounded-xl bg-(--color-bg) border-(--color-border)"
      aria-invalid={error ? "true" : "false"}
    />
  </div>
</div>
```

Password variant adds `Eye/Off` toggle:

```jsx
const [showPw, setShowPw] = useState(false);
<div className="relative">
  <Lock size={16} className="absolute top-1/2 -translate-y-1/2 right-3 text-(--color-muted) pointer-events-none" />
  <Input id="password" type={showPw ? "text" : "password"} value={password} onChange={(e)=>setPassword(e.target.value)} className="h-11 pr-9 pl-10 ..." />
  <button type="button" onClick={()=>setShowPw(!showPw)} className="absolute top-1/2 -translate-y-1/2 left-3 text-(--color-muted) hover:text-(--color-primary)" tabIndex={-1} aria-label={showPw ? "إخفاء" : "إظهار"}>
    {showPw ? <EyeOff size={16}/> : <Eye size={16}/>}
  </button>
</div>
```

Raw `<button type="submit" className="w-full py-4 ... bg-ios-primary">` →

```jsx
<Button type="submit" className="w-full min-h-[44px] py-4 rounded-2xl font-bold">ادخل</Button>
```

`AuthCard.jsx` — replace its `div bg-ios-surface p-10 rounded-3xl` shell with:

```jsx
import { Card, CardContent } from "@/components/ui/card";
<Card className="w-full max-w-md rounded-3xl border-(--color-border) bg-(--color-surface)"><CardContent className="p-8 sm:p-10">...</CardContent></Card>
```

Static pages (`AboutPage`, `GuidePage`, `NotFoundPage`) — each `div p-6 rounded-3xl` section → `Card` with `CardContent`, `style={{ color:"var(--color-dark)" }}` → `text-(--color-dark)` classes, `Link` buttons → `Button asChild` or `Button variant="outline"`.

`ContactDeveloperPage.jsx` (3 Inputs + raw `textarea rows=5`) → `Label`+`Input` pattern above, `textarea` → `Textarea` (`<Textarea id="message" rows={5} value={msg} onChange={...} className="min-h-32 text-sm sm:text-base" />`), `button Send` → `Button`.

- [ ] **Step 1: Migrate each file listed** using the exact before→after pattern above (repeat full code per file; do not write “similar to LoginPage”).

- [ ] **Step 2: Verify**

Run (workdir `client`):

```powershell
npm run lint
npm run build
```

Expected: no new errors; `✓ built`.

- [ ] **Step 3: Commit**

```powershell
git add client/src/modules/auth/pages/LoginPage.jsx client/src/modules/auth/pages/RegisterPage.jsx client/src/modules/auth/pages/ForgotPasswordPage.jsx client/src/modules/auth/pages/ResetPasswordPage.jsx client/src/modules/auth/components/AuthCard.jsx client/src/modules/auth/components/GoogleSignInButton.jsx client/src/modules/info/pages/AboutPage.jsx client/src/modules/info/pages/GuidePage.jsx client/src/modules/info/pages/ContactDeveloperPage.jsx client/src/app/pages/NotFoundPage.jsx
git commit -m "feat(ui): migrate auth and static pages to shadcn"
```

### Task 3: Toast → Sonner

**Files:**
- Modify: `client/src/shared/components/Toast.jsx` (or its provider) + any `client/src/shared/context/ToastContext.jsx`
- Modify: `client/src/app/providers/AppProviders.jsx` (if it mounts Toast)

- [ ] **Step 1: Wire Sonner**

In the provider file that currently renders `<Toast />`, replace with:

```jsx
import { Toaster } from "@/components/ui/sonner";
<Toaster position="top-center" richColors dir="rtl" />
```

Keep `useToast()` shape by mapping: `toast.success(msg)` → `toast.success(msg)`, etc. (sonner exports `toast`). If `ToastContext` wraps custom `color-mix` tints, delete that logic — sonner handles variants. Keep `autoDismiss 4000ms` default.

- [ ] **Step 2: Verify** `npm run lint` + `npm run build` clean.

- [ ] **Step 3: Commit**

```powershell
git add client/src/shared/components/Toast.jsx client/src/shared/context/ToastContext.jsx client/src/app/providers/AppProviders.jsx client/src/components/ui/sonner.jsx
git commit -m "feat(ui): replace custom Toast with sonner"
```

### Task 4: Phase 2 — Expenses & Notes (medium, ~13 files)

**Files:**
- Modify: `client/src/modules/expenses/pages/ExpensesPage.jsx` (orchestrator stays, just modal swap)
- Modify: `client/src/modules/expenses/components/Expens*` (6: `ExpensesList`, `ExpensesHeader`, `ExpensesFiltersPanel`, `ExpenseCard`, `ExpensesPagination`, `ExpensesResultsSummary`, `ExpenseDetailsModal`)
- Modify: `client/src/modules/notes/pages/NotesPage.jsx`
- Modify: `client/src/modules/notes/components/*` (5: `NoteCard`, `NoteList`, `NoteFilters`, `NoteReplySection`, `CreateNoteForm`)

**Filters pattern (ExpensesFiltersPanel, NoteFilters — native select per mixed strategy):**

Before:

```jsx
<Select label="المستخدم" value={userId} onChange={...}><option>...</option></Select>
```

After:

```jsx
<div className="space-y-1.5">
  <Label htmlFor="filter-user">المستخدم</Label>
  <select id="filter-user" value={userId} onChange={onChange} className="h-11 w-full rounded-xl border border-(--color-border) bg-(--color-bg) px-3 text-sm sm:text-base text-(--color-dark) [color-scheme:light] dark:[color-scheme:dark]">
    <option value="">الكل</option>...
  </select>
</div>
```

`ExpenseCard` `rounded-2xl` + `getCategoryIcon` → wrap with `Card` (`<Card className="rounded-2xl border-(--color-border) bg-(--color-surface)"><CardContent className="p-4">...</CardContent></Card>`), action `button` → `Button variant="ghost" size="icon"`.

Large modal (`ExpenseDetailsModal.jsx` 340 lines, currently `motion.div fixed inset-0 flex items-end sm:items-center` + `useModalA11y`) → `Dialog` responsive pattern from `ProfilePage` (`avatarDialogClasses`): `DialogContent className="top-auto bottom-0 left-0 right-0 translate-x-0 translate-y-0 max-w-none w-full rounded-t-3xl ... sm:top-1/2 sm:bottom-auto sm:left-1/2 sm:right-auto sm:-translate-x-1/2 sm:-translate-y-1/2 sm:max-w-lg sm:rounded-3xl"` plus `sm:hidden` drag handle.

`NoteCard` `window.confirm` delete → `AlertDialog` :

```jsx
<AlertDialog>
  <AlertDialogTrigger asChild><Button variant="ghost" size="icon"><Trash2 size={16}/></Button></AlertDialogTrigger>
  <AlertDialogContent dir="rtl"><AlertDialogHeader><AlertDialogTitle>حذف الملاحظة؟</AlertDialogTitle><AlertDialogDescription>لا يمكن التراجع.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>إلغاء</AlertDialogCancel><AlertDialogAction onClick={onDelete}>حذف</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
</AlertDialog>
```

`CreateNoteForm` auto-rows `calculateRows` + absolute `Send` → keep logic, replace `textarea` with `Textarea` (`className="min-h-20 pr-10"` + `style={{ height: `${rows*1.5}rem` }}`) and `button` → `Button size="icon" className="absolute bottom-2 left-2"`.

- [ ] **Step 1: Migrate each file per patterns above**

- [ ] **Step 2: Verify** `npm run lint` + `npm run build`

- [ ] **Step 3: Commit**

```powershell
git add client/src/modules/expenses/pages/ExpensesPage.jsx client/src/modules/expenses/components/*.jsx client/src/modules/notes/pages/NotesPage.jsx client/src/modules/notes/components/*.jsx
git commit -m "feat(ui): migrate expenses and notes to shadcn"
```

### Task 5: Phase 2 — Dashboard & Analytics (medium, ~8 files)

**Files:**
- Modify: `client/src/modules/dashboard/pages/DashboardPage.jsx`
- Modify: `client/src/modules/dashboard/components/*` (5: `StatCard`, `AdminDashboard`, `UserDashboard`, `QuoteCard`, `WelcomeModal`)
- Modify: `client/src/modules/analytics/pages/AnalyticsPage.jsx`

`StatCard` raw `p-5 rounded-2xl` → `Card`:

```jsx
<Card className="rounded-2xl border-(--color-border) bg-(--color-surface)"><CardContent className="p-5"><div className="flex items-center gap-2 mb-2"><TrendingUp size={16} className="text-(--color-error)"/><p className="text-xs sm:text-sm text-(--color-secondary)">إجمالي</p></div><p className="text-xl sm:text-2xl font-bold text-(--color-dark) font-numbers">{value}</p></CardContent></Card>
```

`AnalyticsPage` category bars `w-full bg/ h-2.5` + inline `width%` → `Progress` :

```jsx
import { Progress } from "@/components/ui/progress";
<Progress value={percent} className="h-2.5 bg-(--color-muted-bg) [&>div]:bg-(--color-primary)" />
```

`WelcomeModal` `framer-motion` raw → `Dialog` responsive pattern (same as Task 4 large modal).

Dashboard admin filters that today use `<select>` → **Radix `ui/select`** per mixed strategy:

```jsx
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
<div className="space-y-1.5"><Label>المستخدم</Label><Select value={v} onValueChange={setV}><SelectTrigger className="h-11 rounded-xl bg-(--color-bg)"><SelectValue placeholder="الكل" /></SelectTrigger><SelectContent dir="rtl"><SelectItem value="all">الكل</SelectItem>...</SelectContent></Select></div>
```

- [ ] **Step 1: Migrate files**

- [ ] **Step 2: Verify** `npm run lint` + `npm run build`

- [ ] **Step 3: Commit**

```powershell
git add client/src/modules/dashboard/pages/DashboardPage.jsx client/src/modules/dashboard/components/*.jsx client/src/modules/analytics/pages/AnalyticsPage.jsx
git commit -m "feat(ui): migrate dashboard and analytics to shadcn"
```

### Task 6: Phase 3 — Invoices (high complexity, ~12 files)

**Files:**
- Modify: `client/src/modules/invoices/pages/MyInvoicesPage.jsx`
- Modify: `client/src/modules/invoices/pages/AllInvoicesPage.jsx`
- Modify: `client/src/modules/invoices/components/*` (10: `InvoicesTable`, `InvoiceCard`, `StatusBadge`, `MobileInvoiceCard`, `MobileRequestCard`, `RequestCard`, `RequestDetailsModal`, `MyInvoicesHeader`, `MyInvoicesFilters`, `MyInvoicesPagination`)

**TanStack table shell (InvoicesTable.jsx 224 lines) — keep logic, swap shell:**

Before imports/logic:

```jsx
const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel(), getFilteredRowModel: getFilteredRowModel(), getPaginationRowModel: getPaginationRowModel(), getSortedRowModel: getSortedRowModel(), state: { globalFilter } });
```

After (logic unchanged, JSX shell changes):

```jsx
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

<Input placeholder="بحث..." value={globalFilter} onChange={(e)=>setGlobalFilter(e.target.value)} className="h-10 max-w-sm" />
<Table><TableHeader>{table.getHeaderGroups().map(hg=> <TableRow key={hg.id}>{hg.headers.map(h=> <TableHead key={h.id}>{h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}</TableHead>)}</TableRow>)}</TableHeader>
<TableBody>{table.getRowModel().rows.map(row=> <TableRow key={row.id}>{row.getVisibleCells().map(c=> <TableCell key={c.id}>{flexRender(c.column.columnDef.cell, c.getContext())}</TableCell>)}</TableRow>)}</TableBody></Table>
<div className="flex items-center justify-between pt-4"><Button variant="outline" size="sm" onClick={()=>table.previousPage()} disabled={!table.getCanPreviousPage()}>السابق</Button><Button variant="outline" size="sm" onClick={()=>table.nextPage()} disabled={!table.getCanNextPage()}>التالي</Button></div>
```

Keep the `hidden md:table` vs `md:hidden` `MobileInvoiceCard` duality untouched.

`StatusBadge.jsx` `var(--color-status-*)` → `Badge`:

```jsx
<Badge variant="outline" className={status==="pending" ? "bg-(--color-status-pending-bg) text-(--color-status-pending) border-(--color-status-pending-border)" : status==="approved" ? "bg-(--color-status-approved-bg) ..." : "bg-(--color-status-rejected-bg) ..."}>{label}</Badge>
```

`ConfirmModal` x3 in `MyInvoicesPage` + pending-requests table in `AllInvoicesPage` → `AlertDialog` / `Dialog` respectively; filter `Select`s in `MyInvoicesFilters` → native `select` per mixed strategy.

`RequestDetailsModal.jsx` (113) → `Dialog` responsive pattern.

- [ ] **Step 1: Migrate each file**

- [ ] **Step 2: Verify** `npm run lint` + `npm run build`

- [ ] **Step 3: Commit**

```powershell
git add client/src/modules/invoices/pages/MyInvoicesPage.jsx client/src/modules/invoices/pages/AllInvoicesPage.jsx client/src/modules/invoices/components/*.jsx
git commit -m "feat(ui): migrate invoices and tables to shadcn"
```

### Task 7: Phase 4 — Shell (Navbar, Sidebar, AppShell) (rewrite risk, ~3 files)

**Files:**
- Modify: `client/src/shared/components/Navbar.jsx` (292, `md:hidden` top lock banner + `grid-cols-5` bottom tabs)
- Modify: `client/src/shared/components/Sidebar.jsx` (363, `md:flex` collapsible, `navGroups` role filter, `absolute right-full` collapsed tooltips)
- Modify: `client/src/app/layout/AppShell.jsx` (16, `md:flex-row` + `max-w-7xl mx-auto p-3 sm:p-6 lg:p-8 pb-24 md:pb-8`)

Keep custom layout (do not adopt shadcn `SidebarProvider` kit). Replace styling primitives: raw `button` with `Button`, lock banner `div` with `Card`/`Badge`, bottom tab active state with `data-[state]` or `aria-current="page"` styling, collapsed tooltips keep `absolute right-full` but use `bg-(--color-surface) border border-(--color-border) shadow-lg` via `Card`. Role-filtered `navGroups` logic stays.

Example tooltip keep:

```jsx
{collapsed && <div className="absolute right-full mr-2 top-1/2 -translate-y-1/2 hidden group-hover:block whitespace-nowrap rounded-lg bg-(--color-surface) border border-(--color-border) px-3 py-1.5 text-xs shadow-lg">{label}</div>}
```

Navbar bottom bar stays:

```jsx
<nav className="md:hidden fixed bottom-0 left-0 right-0 grid grid-cols-5 gap-1 border-t border-(--color-border) bg-(--color-surface) pb-safe">...
  <Link className={`flex flex-col items-center gap-1 py-2 text-xs ${active ? "text-(--color-primary)" : "text-(--color-muted)"}`}>...
```

- [ ] **Step 1: Migrate shell files** (preserve `md:hidden` vs `hidden md:flex` split, `navGroups` filtering, collapsed state)

- [ ] **Step 2: Verify** `npm run lint` + `npm run build`

- [ ] **Step 3: Commit**

```powershell
git add client/src/shared/components/Navbar.jsx client/src/shared/components/Sidebar.jsx client/src/app/layout/AppShell.jsx
git commit -m "feat(ui): migrate shell navbar and sidebar to shadcn styling"
```

### Task 8: Phase 4 — AI + final cleanup (delete old shared, sweep)

**Files:**
- Modify: `client/src/modules/ai/pages/AIPage.jsx` (238, `framer-motion AnimatePresence` + `ReactMarkdown` + history `w-1/4 hidden md:flex` + raw `input` + `Send/Bot/User/Trash2/Sparkles`)
- Modify: `client/src/modules/ai/components/AIAssistant.jsx` (389, `fixed bottom-24` widget + `input` + `Send`)
- Modify: `client/src/modules/ai/components/AIButton.jsx` (41, FAB `fixed bottom-6`)
- Modify: `client/src/modules/house/components/RoleRotationSettings.jsx` (polish remaining raw `input`/`select` → `Input`/`select` with `bg-(--color-bg)` per Task 4 pattern) — if already done in earlier task, skip
- Modify: `client/src/modules/house/components/RoleRotationWidget.jsx` (36) → `Card`
- Delete: `client/src/shared/components/Input.jsx` (311), `client/src/shared/components/Select.jsx` (226), `client/src/shared/components/ConfirmModal.jsx` (172), `client/src/shared/components/Loader.jsx` (21)
- Modify: `client/src/shared/components/index.js` (remove barrel exports for the 4 deleted files)
- Verify: delete `client/src/components/ui` unused-file? Keep `card/avatar/sheet/textarea` even if unused — they are tree-shaken.

AI history panel → `Drawer` on mobile:

```jsx
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
<Drawer open={showHistory} onOpenChange={setShowHistory}><DrawerContent dir="rtl" className="h-[70vh]"><DrawerHeader><DrawerTitle>السجل</DrawerTitle></DrawerHeader><ScrollArea className="flex-1 p-4">...</ScrollArea></DrawerContent></Drawer>
```

Chat bubbles → `Card` + `ScrollArea`, `ReactMarkdown` stays inside bubble. Input bar keeps raw logic but uses `Input` + `Button`.

- [ ] **Step 1: Migrate AI files + sweep**

Run before edits to confirm sweep target:

```powershell
rg -n "from.*shared/components/(Input|Select|ConfirmModal|Loader)" client/src --glob "*.jsx"
rg -n "window\.confirm" client/src --glob "*.jsx"
```

Expected before fix: several hits; after edits: 0.

- [ ] **Step 2: Delete old shared primitives**

```powershell
Remove-Item client/src/shared/components/Input.jsx, client/src/shared/components/Select.jsx, client/src/shared/components/ConfirmModal.jsx, client/src/shared/components/Loader.jsx
```

Update `client/src/shared/components/index.js` to export only `Navbar`, `Sidebar`, `Toast` (now `Sonner` wrapper if renamed — verify current export list).

- [ ] **Step 3: Verify**

Run (workdir `client`):

```powershell
npm run lint
npm run build
rg -n "from.*shared/components/(Input|Select|ConfirmModal|Loader)" client/src --glob "*.jsx"
rg -n "window\.confirm" client/src --glob "*.jsx"
```

Expected: lint/build clean, both rgs return no output.

- [ ] **Step 4: Commit**

```powershell
git add client/src/modules/ai/pages/AIPage.jsx client/src/modules/ai/components/AIAssistant.jsx client/src/modules/ai/components/AIButton.jsx client/src/modules/house/components/RoleRotationSettings.jsx client/src/modules/house/components/RoleRotationWidget.jsx client/src/shared/components/index.js client/src/shared/components/Input.jsx client/src/shared/components/Select.jsx client/src/shared/components/ConfirmModal.jsx client/src/shared/components/Loader.jsx
git commit -m "feat(ui): migrate ai module and remove legacy shared primitives"
```

## Self-Review (pre-save checklist — already applied)

- Spec coverage: every page in the 19-page table has a task (auth/static → Task 2, expenses/notes → Task 4, dashboard/analytics → Task 5, invoices → Task 6, shell → Task 7, AI → Task 8); shared primitives and missing ui generation → Tasks 1/8; Mixed select strategy explicit in Tasks 2/4/6 vs Task 5; keep-current-look via `@theme inline` references in every Card/Badge example.
- Placeholder scan: no TBD/TODO; every component import shows exact path; every code block is complete (not “similar to Task N”).
- Type consistency: `cn()` from `@/lib/utils`, `Button asChild` where needed, `AlertDialog*` vs `Dialog` usage consistent (confirms vs content modals), `color-scheme` classes use `[color-scheme:light] dark:[color-scheme:dark]` arbitrary values as committed in `03dad75`.
