# Server Performance Enhancement Design Spec

## Overview
Optimize database query execution speed, memory footprint, and server throughput in Budgetly by implementing strategic MongoDB indexing, replacing in-memory Node.js processing with native MongoDB aggregation pipelines, and using Mongoose `.lean()` for all read endpoints.

## Architecture & Scope
- **Target Backend Components**:
  - Models: `server/models/Note.js`, `server/models/ChatHistory.js`, `server/models/Expense.js`, `server/models/Invoice.js`
  - Controllers: `server/controllers/analyticsController.js`, `server/controllers/noteController.js`, `server/controllers/expenseController.js`, `server/controllers/invoiceController.js`
  - Services: `server/services/statsService.js`
- **Scope**:
  1. High-efficiency database indexing.
  2. Aggregation pipeline refactoring for analytics.
  3. Mongoose `.lean()` and selection optimizations across API routes.

## Detailed Changes

### 1. Database Indexing (`server/models/`)
Add indexes to eliminate unindexed collection scans:
- `Note.js`: `{ house: 1, createdAt: -1 }`
- `ChatHistory.js`: `{ user: 1, updatedAt: -1 }`
- `Expense.js`: `{ "splits.user": 1, status: 1, date: -1 }`
- `Invoice.js`: `{ user: 1, status: 1, createdAt: -1 }`

### 2. Aggregation Pipelines (`server/controllers/analyticsController.js`)
Replace in-memory array operations (`.forEach`, `.filter`) with MongoDB native aggregation pipelines for `getMonthlyAnalytics` and `getCategoryTrends`:
- **`getMonthlyAnalytics`**: Use `$match` on user splits, `$unwind` on splits, `$group` by year-month and category to aggregate monthly expenses and paid invoices natively.
- **`getCategoryTrends`**: Use `$match` on user splits and date range, `$unwind`, and `$group` by month and category.

### 3. Read Query Lean Optimization (`server/controllers/`)
- Audit `noteController.js`, `expenseController.js`, `invoiceController.js`, and `houseController.js` to ensure `.lean()` is called on read queries that do not require Mongoose document instance methods.

## Verification Strategy
- Run `npm test` in `server/` to ensure unit/integration tests pass.
- Verify node server starts without syntax or index errors.
