# Mobile & Small Device Responsiveness Design Spec

**Date:** 2026-08-23  
**Status:** Approved by User  
**Target:** Client-side React Application (`/client`)

---

## 1. Executive Summary
Transform the Budgetly web application into a first-class mobile and small-device experience. The overhaul covers full viewport adaptability: streamlined mobile top & bottom navigation, converting dense desktop tables into smart mobile cards, responsive modals adapting to bottom sheets, 44px+ touch targets, iOS safe-area support, and 16px minimum font size for form inputs to prevent mobile browser zoom.

---

## 2. Navigation & App Shell
- **Top Navigation (`Navbar.jsx`)**:
  - Compact header for mobile (`md:hidden`), displaying brand logo, quick theme mode toggle (light/dark), palette picker, profile shortcut, and logout modal trigger.
  - Remove all desktop-only horizontal menu links from the mobile top bar.
  - Proper top safe-area inset (`pt-safe`).
- **Bottom Navigation Dock**:
  - Sticky bottom tab bar with 5 primary mobile actions: Dashboard, Expenses, elevated Center "Add" Action Button, Invoices, and House Details.
  - Safe-area bottom inset support (`pb-safe`) ensuring compatibility with iOS home indicator and Android navigation bars.
  - Minimum 48px touch targets for each icon/label button.
- **Main Container Layout (`AppShell.jsx`)**:
  - Responsive container width (`max-w-7xl mx-auto px-3 sm:px-6 lg:px-8`).
  - Dynamic bottom spacing on mobile (`pb-24`) preventing any page content from being obscured behind the bottom dock.

---

## 3. Data Tables & Card Transformations
- **Invoices (`AllInvoicesPage.jsx`, `InvoicesTable.jsx`, `MyInvoicesPage.jsx`)**:
  - Desktop: Multi-column responsive data table.
  - Mobile (`< 768px`): Automated conversion into touch-optimized `MobileInvoiceCard` and `MobileRequestCard` components.
  - Displays user avatar, description, formatted amount, status chip, and full-width action buttons.
  - Filters & Pagination controls formatted into full-width mobile stacks.
- **Expenses (`ExpensesPage.jsx`, `ExpensesList.jsx`, `ExpenseCard.jsx`, `ExpensesFiltersPanel.jsx`)**:
  - Dynamic grid layout (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`).
  - Mobile filters collapsible panel with full-width select boxes and sliders.
  - Touch-friendly pagination controls.

---

## 4. Dashboard, House & Tool Modules
- **Dashboard (`DashboardPage.jsx`, `UserDashboard.jsx`, `AdminDashboard.jsx`)**:
  - Stacked stat cards on small screens (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`).
  - Responsive role rotation widget and daily quote card.
- **House Details (`HouseDetailsPage.jsx`)**:
  - Responsive member listing cards and rotation settings.
- **Notes (`NotesPage.jsx`, `NoteCard.jsx`, `CreateNoteForm.jsx`)**:
  - Multi-line touch textareas and responsive reply threads.
- **Auth & Static Pages (`LoginPage.jsx`, `RegisterPage.jsx`, `AboutPage.jsx`, `GuidePage.jsx`)**:
  - Single-column centered cards with fluid padding on mobile viewports.

---

## 5. Forms, Inputs & Dialogs
- **Inputs & Selects (`Input.jsx`, `Select.jsx`)**:
  - Standard minimum font-size `16px` on mobile inputs to eliminate iOS safari auto-zoom on focus.
  - Minimum height `44px-48px` for all clickable/tappable elements.
- **Modals & Dialogs (`ConfirmModal.jsx`, `ExpenseDetailsModal.jsx`, `RequestDetailsModal.jsx`, `WelcomeModal.jsx`)**:
  - Mobile: Slide-up bottom sheet behavior with rounded top corners, backdrop blur, swipe/tap dismiss, and maximum height constraint (`max-h-[85vh]`).
  - Desktop: Centered dialog popups.

---

## 6. Verification & Quality Gates
- Build verification via `npm run build` in `/client`.
- Manual verification across simulated viewport sizes:
  - 375px (iPhone SE)
  - 390px (iPhone 14/15)
  - 412px (Samsung Galaxy / Pixel)
  - 768px (iPad / Tablet)
  - 1024px+ (Desktop)
