# Net Settlement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace per-invoice payments with a net settlement flow that cancels reciprocal and circular debts while keeping invoices as auditable history.

**Architecture:** One pure settlement engine computes per-member net balances, allocates cash payments to invoices, reduces each debtor's outstanding invoices to their net debt, marks the remainder `offset`, and produces a greedy debtor→creditor transfer plan. Settlement requests are `Payment` documents with an explicit sender and recipient; admin approval is one atomic conditional update followed by idempotent reconciliation.

**Tech Stack:** Node.js, Express, Mongoose, node:test, React 19, TanStack Query, Tailwind/Radix.

**Spec:** User requirements in the 2026-11-08 conversation.

## Global Constraints

- Do not delete invoices or mark them `paid` because they were netted; use `offset`.
- Invoices remain the historical expense breakdown; the settlement plan is the authoritative payable/receivable.
- Keep the existing admin approval gate and admin-only routes.
- Existing tests must keep passing; add tests, do not weaken them.
- All financial writes are idempotent; approval must never create a second transaction.
- Backward compatibility: legacy invoice payments still count through `invoice.paymentRequest`.

## Review Focus

- Overpayment/rounding: settlement amounts must never exceed the current net payable.
- Race: two admins approving the same request must produce one approved payment.
- Legacy data: paid invoices with no `paidAmount` and payments with no `recipient` must still balance.
- Partial payments: a later settlement must only request the remaining net debt.
- Invoice history: changing net balances must not delete or hide old expense invoices.

---

### Task 1: Pure settlement engine

**Files:**
- Create: `server/services/settlementService.js`
- Test: `server/test/settlementService.test.js`

**Interfaces:**
- Produces: `buildSettlementSnapshot({ users, expenses, invoices, payments }) -> { balancesByUserId, invoices, transfers }`
  - `balancesByUserId[id] = { externalPaid, internalSent, invoicesAssigned, internalReceived, balance }`
  - `invoices[] = { _id, paidAmount, offsetAmount, remainingAmount, status }`
  - `transfers[] = { fromUserId, toUserId, amount }`
- Produces: `roundCurrency(number) -> number`

- [ ] Write failing tests for mutual 100/100, one-sided 50 debt, 3-member cycle, 5-member mixed, partial settlement, and legacy paid invoices.
- [ ] Run `npm test` and confirm the new tests fail on missing module/behavior.
- [ ] Implement the engine: approved expenses and payments form balances; approved cash payments allocate to matching invoices; each debtor keeps pending invoices up to their net debt and offsets the rest; greedy transfers match net debtors to net creditors.
- [ ] Run the settlement tests and the full server suite.

### Task 2: Models and migration

**Files:**
- Modify: `server/models/Invoice.js`
- Modify: `server/models/Payment.js`
- Create: `server/scripts/backfillSettlementData.js`

**Interfaces:**
- `Invoice.status` adds `partially_paid`, `offset`.
- `Invoice.paidAmount`, `Invoice.offsetAmount` default `0`.
- `Payment.recipient` refs `User`; `Payment.transactionType` adds `settlement`.

- [ ] Write/extend model tests or assertions through the engine test fixtures.
- [ ] Add fields, enum values, and indexes (`house + recipient + status`).
- [ ] Add an idempotent backfill script that writes invoice allocations and legacy `Payment.recipient` values.
- [ ] Run the server suite.

### Task 3: Stats integration

**Files:**
- Modify: `server/services/statsService.js`
- Modify: `server/controllers/statsController.js`
- Modify: `server/test/statsService.test.js`

**Interfaces:**
- `buildHouseBalanceSnapshot` delegates to `buildSettlementSnapshot` and keeps its existing return shape.
- `invoicesAssigned = max(0, -balance)`.

- [ ] Add a failing test asserting a member with a zero net balance has zero `invoicesAssigned` even with pending invoices.
- [ ] Count approved `settlement` payments by `recipient`, with legacy `invoice.paymentRequest` fallback.
- [ ] Update selects to include `recipient`, `paidAmount`, `offsetAmount`, `paymentRequest`.
- [ ] Update admin `totalOwed` to sum net positive debts, not gross non-paid invoices.
- [ ] Run the full server suite.

### Task 4: Persistence reconciliation

**Files:**
- Modify: `server/services/settlementService.js`
- Modify: `server/controllers/expenseController.js`
- Modify: `server/controllers/invoiceController.js`

**Interfaces:**
- Produces: `reconcileHouseInvoices(houseId, { session } = {})`
- Produces: `getSettlementSnapshot(houseId)`

- [ ] Add an integration-style test for reconciliation if a DB mock is practical; otherwise test the pure output used by reconciliation.
- [ ] Reconcile after expense creation/approval/deletion and after settlement approval.
- [ ] Mark the payer's own invoice `paidAmount = amount` at creation.
- [ ] Run the full server suite.

### Task 5: Settlement API

**Files:**
- Create: `server/controllers/settlementController.js`
- Create: `server/routes/settlements.js`
- Modify: `server/server.js`
- Test: `server/test/settlementController.test.js`

**Interfaces:**
- `GET /api/settlements` -> current user's plan, payables, receivables, pending requests, history.
- `POST /api/settlements` `{ creditorId, amount? }` -> creates a settlement request.
- `PUT /api/settlements/:id/approve` (admin) -> atomic approve + reconcile.
- `PUT /api/settlements/:id/reject` (admin) -> atomic reject.
- `approveSettlementPayment({ paymentId, houseId, adminId, session, paymentModel })` returns the approved payment or `null`.

- [ ] Write a failing test: the second atomic approval returns `null` and does not create another transaction.
- [ ] Write a failing test: a member cannot request more than the current net payable.
- [ ] Implement controller/routes with validation, admin gate, and transaction helper.
- [ ] Run the full server suite.

### Task 6: Invoice API compatibility

**Files:**
- Modify: `server/controllers/invoiceController.js`
- Modify: `server/routes/invoices.js`

**Interfaces:**
- `getMyInvoices` returns populated creditor and `remainingAmount`.
- Legacy pay endpoints reject fully offset/covered invoices and only charge the remaining amount.

- [ ] Add failing tests for paying a fully offset invoice and for paying a partially paid invoice's remaining amount.
- [ ] Implement guards and response enrichment.
- [ ] Run the full server suite.

### Task 7: Member UI

**Files:**
- Create: `client/src/modules/invoices/api/settlementsApi.js`
- Create: `client/src/modules/invoices/hooks/useSettlements.js`
- Create: `client/src/modules/invoices/components/SettlementPanel.jsx`
- Modify: `client/src/modules/invoices/pages/MyInvoicesPage.jsx`
- Modify: `client/src/modules/invoices/components/InvoiceCard.jsx`
- Modify: `client/src/modules/invoices/components/MyInvoicesHeader.jsx`
- Modify: `client/src/modules/dashboard/pages/DashboardPage.jsx`
- Modify: `client/src/shared/api/queryKeys.js`

- [ ] Replace the per-invoice Pay/bulk-pay controls with the settlement panel.
- [ ] Show payables and receivables with member names and remaining net amounts.
- [ ] Show invoice statuses/amounts: pending, partially paid, paid, offset.
- [ ] Invalidate settlement, invoice, stats, and dashboard queries after mutations.
- [ ] Run client lint/build.

### Task 8: Admin UI and verification

**Files:**
- Modify: `client/src/modules/invoices/pages/AllInvoicesPage.jsx`
- Modify: `client/src/modules/invoices/hooks/useAllInvoices.js`
- Modify: `client/src/modules/invoices/components/InvoicesTable.jsx`
- Modify: `client/src/modules/invoices/components/MobileInvoiceCard.jsx`
- Modify: `client/src/modules/invoices/components/StatusBadge.jsx`

- [ ] Add pending settlement requests with approve/reject actions.
- [ ] Keep the existing legacy invoice approval tab working.
- [ ] Add status badges and paid/offset/remaining details to admin tables.
- [ ] Run all server tests, client lint/build, and report results, migrations, and risks.
