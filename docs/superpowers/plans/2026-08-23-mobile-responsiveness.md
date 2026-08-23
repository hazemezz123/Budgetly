# Mobile Responsiveness Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the Budgetly client into an ultra-responsive, touch-optimized mobile experience across navigation, data views, modals, and forms without regressions on desktop.

**Architecture:** Tailwind CSS responsive utilities (`sm:`, `md:`, `lg:`), conditional mobile card views for dense tables, slide-up bottom sheet patterns for mobile dialogs, 16px minimum font size for form inputs (preventing mobile zoom), and safe-area margin/padding wrappers for native and browser viewports.

**Tech Stack:** React 19, Tailwind CSS v4, Framer Motion, Lucide React, Vite.

---

### Task 1: Navigation & Layout Shell Mobile Polish

**Files:**
- Modify: `client/src/app/layout/AppShell.jsx`
- Modify: `client/src/shared/components/Navbar.jsx`
- Modify: `client/src/index.css`

- [ ] **Step 1: Update AppShell and global CSS for proper mobile viewport padding and safe area offsets**

In `client/src/app/layout/AppShell.jsx`:
- Ensure the main content wrapper has responsive padding: `px-3 sm:px-6 lg:px-8`, and bottom padding `pb-24 md:pb-8` to prevent bottom navigation overlap.

In `client/src/index.css`:
- Ensure `.pt-safe` and `.pb-safe` handle iOS safe area insets cleanly.

- [ ] **Step 2: Streamline mobile Navbar & Bottom Navigation**

In `client/src/shared/components/Navbar.jsx`:
- Remove desktop navigation links from the mobile navbar block.
- Keep only logo, theme toggle, palette toggle, profile button, and logout button in the top mobile header.
- Ensure bottom navigation buttons have minimum touch target height `48px` with clear active states and accessible aria attributes.

- [ ] **Step 3: Run client build to verify compilation**

Run: `npm --prefix client run build`
Expected: Build succeeds with 0 errors.

- [ ] **Step 4: Commit Navigation and Shell changes**

```bash
git add client/src/app/layout/AppShell.jsx client/src/shared/components/Navbar.jsx client/src/index.css
git commit -m "feat(mobile): streamline mobile navbar, bottom navigation, and safe area spacing"
```

---

### Task 2: Modals Bottom Sheet Responsive Behavior

**Files:**
- Modify: `client/src/shared/components/ConfirmModal.jsx`
- Modify: `client/src/modules/expenses/components/ExpenseDetailsModal.jsx`
- Modify: `client/src/modules/invoices/components/RequestDetailsModal.jsx`
- Modify: `client/src/modules/dashboard/components/WelcomeModal.jsx`

- [ ] **Step 1: Update `ConfirmModal.jsx` to render as a bottom sheet on mobile and centered modal on desktop**

In `client/src/shared/components/ConfirmModal.jsx`:
- Update modal container styles:
  - Mobile (`< sm`): aligned to bottom (`items-end sm:items-center`), rounded top corners (`rounded-t-3xl sm:rounded-2xl`), slide up animation (`y: 40` to `y: 0`), max-h `85vh`.
  - Desktop (`>= sm`): centered dialog.
- Ensure action buttons have full touch-target height (min 44px).

- [ ] **Step 2: Update `ExpenseDetailsModal.jsx` and `RequestDetailsModal.jsx` for mobile bottom sheet presentation**

- Add mobile drag handle pill or top-sheet border indicator.
- Add `overflow-y-auto max-h-[80vh] sm:max-h-[85vh]` to ensure tall content scrolls smoothly within bottom sheets.

- [ ] **Step 3: Update `WelcomeModal.jsx`**

- Responsive typography and touch dismiss button for mobile screens.

- [ ] **Step 4: Run client build to verify compilation**

Run: `npm --prefix client run build`
Expected: Build succeeds.

- [ ] **Step 5: Commit modal improvements**

```bash
git add client/src/shared/components/ConfirmModal.jsx client/src/modules/expenses/components/ExpenseDetailsModal.jsx client/src/modules/invoices/components/RequestDetailsModal.jsx client/src/modules/dashboard/components/WelcomeModal.jsx
git commit -m "feat(mobile): adapt modals to responsive bottom sheets on mobile viewports"
```

---

### Task 3: Invoices & Requests Responsive Views (Smart Cards & Tables)

**Files:**
- Modify: `client/src/modules/invoices/pages/AllInvoicesPage.jsx`
- Modify: `client/src/modules/invoices/pages/MyInvoicesPage.jsx`
- Modify: `client/src/modules/invoices/components/InvoicesTable.jsx`
- Modify: `client/src/modules/invoices/components/MobileInvoiceCard.jsx`
- Modify: `client/src/modules/invoices/components/MobileRequestCard.jsx`
- Modify: `client/src/modules/invoices/components/MyInvoicesFilters.jsx`
- Modify: `client/src/modules/invoices/components/MyInvoicesPagination.jsx`

- [ ] **Step 1: Polish `MobileInvoiceCard.jsx` and `MobileRequestCard.jsx`**

- Enhance touch targets, status badges, formatted currency values, and action button sizes (minimum 44px tap target).
- Wrap user metadata cleanly to avoid text truncation on 320px-375px screens.

- [ ] **Step 2: Update `InvoicesTable.jsx` to render mobile cards on `< md` viewports**

- Hide raw HTML `<table>` on mobile (`hidden md:table`) and display responsive card list (`md:hidden flex flex-col gap-3`).

- [ ] **Step 3: Refine `AllInvoicesPage.jsx` and `MyInvoicesPage.jsx` filter & user stats grid**

- Change user stats grid to `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3`.
- Stack bulk actions and filter buttons cleanly on mobile.

- [ ] **Step 4: Run client build to verify compilation**

Run: `npm --prefix client run build`
Expected: Build succeeds.

- [ ] **Step 5: Commit Invoices mobile responsiveness**

```bash
git add client/src/modules/invoices/
git commit -m "feat(mobile): enhance invoices and request cards for small screens"
```

---

### Task 4: Expenses & Notes Responsive Grid & Filters

**Files:**
- Modify: `client/src/modules/expenses/pages/ExpensesPage.jsx`
- Modify: `client/src/modules/expenses/components/ExpensesFiltersPanel.jsx`
- Modify: `client/src/modules/expenses/components/ExpensesHeader.jsx`
- Modify: `client/src/modules/expenses/components/ExpenseCard.jsx`
- Modify: `client/src/modules/notes/pages/NotesPage.jsx`
- Modify: `client/src/modules/notes/components/NoteCard.jsx`
- Modify: `client/src/modules/notes/components/CreateNoteForm.jsx`

- [ ] **Step 1: Optimize Expenses filters and list for mobile viewports**

In `client/src/modules/expenses/components/ExpensesFiltersPanel.jsx`:
- Ensure inputs and filter selects take full width on mobile (`w-full`).
- Add accessible spacing between user filter and amount range inputs.

In `client/src/modules/expenses/components/ExpenseCard.jsx`:
- Adjust padding (`p-3.5 sm:p-5`), badge sizing, and action button touch areas.

- [ ] **Step 2: Polish Notes page, NoteCard, and CreateNoteForm**

- Make create note inputs and action triggers touch-friendly.
- Ensure note replies list doesn't cause overflow on narrow screens.

- [ ] **Step 3: Run client build to verify compilation**

Run: `npm --prefix client run build`
Expected: Build succeeds.

- [ ] **Step 4: Commit Expenses and Notes mobile enhancements**

```bash
git add client/src/modules/expenses/ client/src/modules/notes/
git commit -m "feat(mobile): optimize expenses list, filters, and notes for mobile viewports"
```

---

### Task 5: Dashboard, House Details & Form Inputs Mobile Polish

**Files:**
- Modify: `client/src/modules/dashboard/pages/DashboardPage.jsx`
- Modify: `client/src/modules/dashboard/components/UserDashboard.jsx`
- Modify: `client/src/modules/dashboard/components/AdminDashboard.jsx`
- Modify: `client/src/modules/house/pages/HouseDetailsPage.jsx`
- Modify: `client/src/modules/house/components/RoleRotationWidget.jsx`
- Modify: `client/src/shared/components/Input.jsx`
- Modify: `client/src/shared/components/Select.jsx`

- [ ] **Step 1: Prevent mobile zoom on form input focus**

In `client/src/shared/components/Input.jsx` and `client/src/shared/components/Select.jsx`:
- Ensure base mobile font size is `text-base` (16px) on inputs so iOS Safari does not zoom the page upon focusing.

- [ ] **Step 2: Optimize Dashboard stats grids and widgets**

In `UserDashboard.jsx` and `AdminDashboard.jsx`:
- Ensure stats card grid scales smoothly: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`.
- Streamline chart wrappers with horizontal scroll or auto-scaling SVGs on small screens.

In `RoleRotationWidget.jsx` and `HouseDetailsPage.jsx`:
- Stack member lists and rotation badges cleanly on mobile.

- [ ] **Step 3: Run client build to verify compilation**

Run: `npm --prefix client run build`
Expected: Build succeeds with 0 errors.

- [ ] **Step 4: Commit Dashboard, House and Input improvements**

```bash
git add client/src/modules/dashboard/ client/src/modules/house/ client/src/shared/components/Input.jsx client/src/shared/components/Select.jsx
git commit -m "feat(mobile): polish dashboard, house details, and inputs for mobile devices"
```

---

### Task 6: Final Verification & Standards Check

**Files:**
- Test all pages across viewports (375px, 390px, 768px, 1024px+).

- [ ] **Step 1: Run client linter**

Run: `npm --prefix client run lint`
Expected: Passes with no unresolved errors.

- [ ] **Step 2: Run production build**

Run: `npm --prefix client run build`
Expected: Vite build succeeds with complete asset bundles.

- [ ] **Step 3: Verification check on server tests**

Run: `npm --prefix server test`
Expected: Server tests pass.
