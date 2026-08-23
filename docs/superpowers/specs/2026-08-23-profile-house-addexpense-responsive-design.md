# Design: shadcn/ui Foundation + Responsive Overhaul of Profile, House Details & Add Expense Pages

**Date:** 2026-08-23
**Status:** Approved design (pending implementation)
**Follows:** `docs/superpowers/plans/2026-08-23-mobile-responsiveness.md` (previous pass — did not cover Profile; partially covered House Details)

## Problem

Three screens lag behind the mobile-responsiveness conventions established in the previous pass:

1. **ProfilePage** (`client/src/modules/profile/pages/ProfilePage.jsx`) — untouched by the previous pass. Uses pre-pass patterns: inline `style={{ color: "var(--color-dark)" }}` objects, small touch targets (`py-2 sm:py-1` buttons), an off-convention stats grid, and a hand-rolled centered desktop-style avatar modal.
2. **HouseDetailsPage** (`client/src/modules/house/pages/HouseDetailsPage.jsx`) — mostly compliant but has a cramped horizontal-scroll tab bar and inconsistent density ramps.
3. **AddExpensePage** ("add invoice", `client/src/modules/expenses/pages/AddExpensePage.jsx`) — oversized on phones: `p-8` form padding, fixed `text-3xl` header, wide `gap-6` spacing, oversized user-picker cards.

The user also chose to adopt a **shadcn/ui-style component approach** as the app's going-forward UI foundation, starting with these three pages.

## Decisions (user-approved)

| Decision | Choice |
|---|---|
| UI approach | shadcn/ui-style components (Radix primitives + Tailwind) |
| Adoption scope | Foundation setup + these 3 pages only; existing `shared/components/*` untouched |
| Mobile input sizing | Smaller everything incl. fonts (~14px on mobile), accepting iOS zoom-on-focus, mitigated via viewport meta fix |
| Setup style | Canonical `shadcn init` with theme mapped onto existing tokens |

## Section 1 — Foundation

### Init

Run `npx shadcn@latest init` inside `client/`. Produces:

- `components.json`
- `client/src/lib/utils.js` — `cn()` helper (JS project: `.js`, not `.ts`)
- Dependencies: `clsx`, `tailwind-merge`, `class-variance-authority`, `tw-animate-css`

### Theme mapping

Map shadcn semantic variables **by reference** onto existing Budgetly tokens in `index.css` so components inherit the app look and any future dark mode keeps working:

```css
--background: var(--color-bg);
--foreground: var(--color-dark);
--primary: var(--color-primary);
--card: var(--color-surface);
--border: var(--color-border);
--muted-foreground: var(--color-secondary);
--destructive: var(--color-status-rejected);
--radius: 1rem;
```

(Exact token names verified against `index.css` during implementation.)

### RTL

Wrap the router in Radix `<DirectionProvider dir="rtl">`. shadcn components are Tailwind-based and follow logical properties under RTL. The app is already RTL Arabic throughout.

### iOS zoom mitigation

Add `maximum-scale=1` to the viewport meta in `client/index.html` so sub-16px mobile inputs don't trigger jump-zoom on iPhone PWA use. Android (Capacitor target) is unaffected either way.

### Components to add

Only what the 3 pages need:

`button`, `card`, `input`, `label`, `textarea`, `dialog`, `sheet` (Radix bottom sheet), `tabs`, `avatar`, `badge`

### Deliberate exclusions

- **No Radix `Select`** — native dropdowns give superior touch UX on phones (system wheel/sheet pickers). Existing styled native `Select` stays.
- **Old `shared/components/*` unchanged** — other pages keep importing them. Two systems coexist intentionally; gradual migration documented as future work.

## Section 2 — Page Designs

### Add Expense Page

Compact mobile density via responsive ramps. All logic from `useAddExpense()` untouched — pure presentation.

- Header: icon tile `p-2.5 sm:p-3`, icon 24→32px, title `text-xl sm:text-3xl`, margin `mb-5 sm:mb-8`
- Form card: `p-4 sm:p-8`, `space-y-4 sm:space-y-6`, `rounded-2xl sm:rounded-3xl`
- Inputs/labels: shadcn Input at `text-sm` (14px) mobile → `text-base` desktop; same ramp for selects/labels
- Category + amount grid: stacked on mobile, `gap-4 sm:gap-6`
- User-picker cards: `p-3 sm:p-4`, avatars `w-10 h-10 sm:w-12 sm:h-12`, `gap-2 sm:gap-4`, check badge positioned for RTL
- Submit button: `py-3.5 sm:py-4`, keeps ≥44px touch target

### Profile Page

Biggest cleanup:

- Migrate all inline `style={{...}}` objects to Tailwind token classes (`text-(--color-dark)` etc.) — unlocks hover/focus states, matches House Details idiom
- Avatar selector modal → shadcn `Sheet` (`side="bottom"`) with drag handle on mobile; centered `Dialog` on `sm:` up. Scrollable avatar grid.
- Editable-field save/cancel buttons → shadcn Buttons, `min-h-[44px]`, full-width row on mobile
- Stats grid aligned to plan convention: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`
- Role pill → Badge; header/info-grid structure otherwise preserved

### House Details Page

Lighter touch — mostly compliant already:

- Tab bar → shadcn `Tabs` styled as equal-width segmented control filling screen width on mobile (replaces cramped horizontal-scroll buttons)
- Stats card padding `p-4 sm:p-6`; member rows consistent `gap-3 sm:gap-4`
- Rotation widget/settings tab get matching density ramps; remaining raw `<button>`s converted to shadcn Button variants
- All ConfirmModal usages stay as-is (already good)

### Error handling / behavior

Loading and error states preserved everywhere. No API, hook, or routing changes in any page. Pure presentation refactor plus additive foundation.

## Section 3 — Verification & Rollout

**Automated:** `npm run lint` + `npm run build` in `client/` after each page conversion.

**Manual viewport matrix (RTL verified):**

| Width | Expectations |
|---|---|
| 375 / 390 / 412 px | Compact density, bottom-sheet avatar modal, full-width segmented tabs, ≥44px targets, no horizontal overflow |
| 768 px | Clean bottom-nav → sidebar transition |
| 1024 px+ | Visually unchanged vs. current desktop |

**Commit strategy:** one commit each — foundation → Add Expense → Profile → House Details — so regressions are bisectable.

## Out of Scope (future work)

- Migrating remaining pages from `shared/components` to `ui/*`
- Dark mode
- Replacing native Select
