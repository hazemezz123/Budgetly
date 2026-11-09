# Backend Logic (Budgetly)

This document describes the current backend behavior as implemented in the server code.

## Overview
- Runtime: Node.js + Express + MongoDB (Mongoose).


- Server   entry: `server/server.js`.
- Middleware: CORS, JSON body parsing, rate limiter.
- Routes are mounted under `/api/*`.
- Mongo connection uses `MONGODB_URI` or defaults to `mongodb://localhost:27017/expense-tracker`.

## Middleware and Security
- `authenticate` reads `Authorization: Bearer <token>`, verifies JWT, loads the user from DB, checks `isActive`, and sets `req.user`.
- `isAdmin` checks `req.user.role === "admin"`.
- Rate limiting: 250 requests per 15 minutes per IP.

## Data Models

### User
- `username` (unique), `email` (optional, unique), `password`, `name`.
- `role`: `admin` or `user`.
- `isActive`, `profilePicture`.
- `house` reference.
- Password reset fields + `getResetPasswordToken` method.

### House
- `name` (unique), `houseId` (unique, optional), `admin`, `members`, `password`.
- `dishwashingRotation`: `{ enabled, startDate (YYYY-MM-DD), order[] }`.

### Expense
- `description`, `category`, `status` (`pending`, `approved`, `rejected`).
- `totalAmount`, `splitType` (`equal`, `specific`, `custom`).
- `splits[]` with `{ user, amount }`.
- `createdBy`, `paidBy` (optional), `generatedFromPayment` (optional).
- `house`, `date`.
- Pre-save validation ensures `splits` sum equals `totalAmount` (tolerance 0.01).

### Invoice
- `user`, `expense`, `amount`, `description`.
- `status`: `pending`, `awaiting_approval`, `partially_paid`, `paid`, `offset`.
- `paidAmount` (cash allocated), `offsetAmount` (netted amount).
- `paymentRequest` reference (Payment), used only by the legacy invoice-payment flow.
- `house`, `dueDate`.

### Payment
- `user` (sender), `recipient` (settlement receiver), `amount`, `description`.
- `transactionType`: `payment`, `received`, or `settlement` (default `payment`).
- `status`: `pending`, `approved`, `rejected`.
- `recordedBy`, `approvedBy`.
- `linkedExpense` (optional), `house`, `date`.

### Note
- `content`, `createdBy`, `house`, `date`.
- `replies[]` with `content`, `createdBy`, `createdAt`.

### ChatHistory
- `user`, `title`.
- `messages[]` with `role`, `content`, `timestamp`.

## Core Business Flows

### Expenses
- Create expense:
  - Split logic:
    - `equal`: split across all active users in the same house.
    - `specific`: split across `selectedUsers` equally.
    - `custom`: use `customSplits` as-is.
  - Status is `approved` if creator is admin, otherwise `pending`.
  - `createdBy` is always the requester; `paidBy` is the chosen payer (admin) or requester.
  - If approved immediately, invoices are generated for each split. The payer's invoice is marked `paid`, others `pending`.
- Approve expense (admin):
  - Sets expense status to `approved`.
  - Generates invoices for each split. Payer is `paidBy` (fallback `createdBy`).
- Reject expense (admin): sets status to `rejected`.
- Update expense (admin): only pending expenses can be updated; updates fields and recalculates splits.
- Delete expense (admin): deletes related invoices and any linked payment requests, then deletes the expense.
- Delete own pending request: only creator can delete, only if `pending`.

### Net Settlement
- `buildSettlementSnapshot` computes each member's net balance from approved expenses, invoice shares, and approved payments.
- Approved cash payments are allocated to direct debtor→creditor invoices FIFO; the remainder of each debtor's invoices is marked `offset` up to their net debt.
- A greedy plan matches net debtors to net creditors. Transfer amounts never exceed the current net balance.
- `GET /api/settlements` returns the current net balance, payables, receivables, pending requests, history, and (for admins) the full plan.
- `POST /api/settlements` creates a `Payment` with `transactionType: "settlement"`; members need admin approval and admins record immediately.
- `PUT /api/settlements/:id/approve` uses a per-house `House.settlementLock` acquired by atomic `findOneAndUpdate`, then re-reads the settlement and revalidates net debt under that lock before changing `pending → approved` and reconciling invoices inside a DB transaction.
- If two different settlements compete for the same debt, the second revalidation fails after the first approval; the stale request is marked `rejected` and the API returns `409`.
- The lock has a 60-second expiry and a 2-second acquisition wait. If it is still busy, approval returns `409` and leaves the request pending for a retry.
- Transactional path (replica set): payment approval and invoice reconciliation commit or roll back together.
- Standalone fallback: the per-house lock still prevents concurrent over-approval because lock acquisition is a single-document atomic update. However, payment approval and invoice reconciliation are separate writes, so a process crash between them can leave the payment approved while invoice allocations are stale. The next read or write reconciliation repairs the invoice fields; it cannot undo an approved payment.
- `PUT /api/settlements/:id/reject` atomically rejects a pending settlement.

### Invoices and Payments (legacy compatibility)
- Get invoices:
  - My invoices: filters by `user` and `house`, populates expense/creditor fields, and returns `remainingAmount`.
  - All invoices (admin): filters by `house`, populates user, expense, creditor, and paymentRequest.
- The member UI now uses settlement requests instead of per-invoice Pay/bulk-pay.
- Legacy pay invoice endpoint still exists:
  - Rejects fully offset/settled invoices and only charges the remaining amount.
  - Checks the live net debt before creating or approving a legacy payment.
  - Creates a `Payment` with `status: pending` and links it in `invoice.paymentRequest`.
  - Sets invoice status to `awaiting_approval`.
- Approve legacy invoice payment (admin):
  - Rechecks net debt, then sets payment `approved` and invoice `paid`; reconciliation repairs allocations.
- Reject legacy invoice payment (admin):
  - Sets payment `rejected`, resets invoice to `pending`, clears `paymentRequest`, then reconciles.
- Bulk legacy pay:
  - Includes pending and partially paid invoices, charges only remaining amounts, and rechecks net debt.

### Stats and Balances
- Balance calculation uses:
- `externalPaid`: sum of approved expenses paid by the user (`paidBy`, fallback `createdBy`).
- `internalSent`: sum of approved payments where `user` is the sender.
- `expenseShare`: sum of the user's invoice amounts for approved expenses.
- `internalReceived`: sum of approved payments where the user is the recipient, with legacy `invoice.paymentRequest` fallback.
  - `balance = externalPaid + internalSent - (expenseShare + internalReceived)`.
- `invoicesAssigned = max(0, -balance)`, so it reports net debt rather than the gross sum of pending invoices.
- `getBalances`: returns net balance, total paid, and net owed per active user in the house.
- `getUserStats`: includes recent invoices and category breakdown based on invoices.
- `getAdminDashboard`: aggregates totals for users, expenses, invoices, payments, plus category breakdown from invoices. `totalOwed` is the sum of net debtor balances.

### Analytics
- Monthly analytics:
  - Expenses are grouped by month based on `expense.date` and the user's split amount.
  - Payments are derived from `paid` invoices (not from Payments collection).
  - Returns monthly totals, category breakdown, and summary stats.
- Category trends:
  - Looks back `months` (default 6) and aggregates expense splits by category per month.

### Houses
- Create house: creates new house, sets creator as admin, removes user from old house if needed.
- Join house: validates password, removes user from old house, adds to new house, sets role to `user`.
- Update name/houseId/password: admin-only checks and updates.
- Leave house: non-admins can leave; admin must transfer/delete instead.
- Remove member: admin-only, cannot remove admin.
- Delete house: admin-only; clears house from all users.
- Clear house data: admin-only; deletes expenses, invoices, payments by house.
- Export house data: admin-only; generates CSV for expenses or invoices.

### Users
- Get users: active users in the same house as the requester.
- Get user: fetch by ID (no house scoping).
- Create/update/deactivate users: admin-only.
- Self updates: profile picture, username, name, email.

### Notes
- Notes are scoped to the user’s house.
- Any member can create notes and replies.
- Delete note: admin or note creator.

### Dishwashing Rotation
- Rotation stored in `House.dishwashingRotation`.
- Uses Cairo timezone for date calculations.
- Admin can enable/disable and set rotation order.
- Returns today’s assignment and upcoming schedule.

### AI Assistant
- Uses Google Generative AI (Gemini) with a fixed system prompt.
- Persists chat history per user and provides list/detail/delete endpoints.

### Email Utility
- Uses SMTP or Gmail. If missing config, logs the email to console.

## API Routes (Current)

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/forgot-password`
- `PUT /api/auth/reset-password/:token`

### Users
- `GET /api/users`
- `GET /api/users/:id`
- `POST /api/users` (admin)
- `PUT /api/users/:id` (admin)
- `DELETE /api/users/:id` (admin)
- `PATCH /api/users/me/profile-picture`
- `PATCH /api/users/me/username`
- `PATCH /api/users/me/name`
- `PATCH /api/users/me/profile`

### Houses
- `GET /api/houses`
- `GET /api/houses/:id`
- `POST /api/houses`
- `POST /api/houses/:id/join`
- `PATCH /api/houses/:id/name`
- `PATCH /api/houses/:id/houseId`
- `PATCH /api/houses/:id/password`
- `POST /api/houses/:id/leave`
- `DELETE /api/houses/:id/members/:memberId`
- `DELETE /api/houses/:id/clear-data`
- `GET /api/houses/:id/export/:type`
- `DELETE /api/houses/:id`

### Dishwashing (mounted under /api/houses)
- `GET /api/houses/:id/dishwashing`
- `PUT /api/houses/:id/dishwashing`
- `DELETE /api/houses/:id/dishwashing`
- `GET /api/houses/:id/dishwashing/today`
- `GET /api/houses/:id/dishwashing/schedule`

### Expenses
- `GET /api/expenses` (pagination + optional filters: `status`, `createdBy`)
- `POST /api/expenses`
- `PUT /api/expenses/:id` (admin)
- `PUT /api/expenses/:id/approve` (admin)
- `PUT /api/expenses/:id/reject` (admin)
- `DELETE /api/expenses/:id/my-request`
- `DELETE /api/expenses/:id` (admin)

### Invoices
- `GET /api/invoices/my-invoices`
- `GET /api/invoices/all` (admin)
- `POST /api/invoices/:id/pay` (legacy)
- `POST /api/invoices/bulk-pay` (legacy)
- `PUT /api/invoices/:id/approve` (admin, legacy)
- `PUT /api/invoices/:id/reject` (admin, legacy)

### Settlements
- `GET /api/settlements`
- `POST /api/settlements`
- `PUT /api/settlements/:id/approve` (admin)
- `PUT /api/settlements/:id/reject` (admin)

### Stats
- `GET /api/stats/balances`
- `GET /api/stats/user/:userId`
- `GET /api/stats/admin/dashboard`

### Analytics
- `GET /api/analytics/monthly`
- `GET /api/analytics/trends`

### Notes
- `GET /api/notes`
- `POST /api/notes`
- `POST /api/notes/:id/reply`
- `DELETE /api/notes/:id`

### AI
- `POST /api/ai/chat`
- `GET /api/ai/chats`
- `GET /api/ai/chats/:chatId`
- `DELETE /api/ai/chats/:chatId`

## Notes
- There is no dedicated `/api/payments` route mounted in the server; payments are created via settlement actions or the legacy invoice flow.
- Run `npm run backfill:settlements` after deploying the net-settlement changes to populate invoice allocations and legacy payment recipients.
