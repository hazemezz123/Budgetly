# Budgetly

Shared-expense tracker for a single Egyptian house — members record مصاريف and payments, the admin approves them, and balances show who owes whom.

## Language

### Group

**House**:
A shared living group that owns members, expenses, payments and notifications. Identified by `houseId`.
_Avoid_: Group, Team, Workspace

**Member**:
A `User` who belongs to a `House` with `role=user`. Can create pending expenses and view own balance.
_Avoid_: Client, Customer

**Admin**:
The `User` referenced by `House.admin` with `role=admin`. The sole approval authority for the house; a member, not an external operator.
_Avoid_: Owner, Moderator, Super-admin

### Financial

**Expense**:
A cost to be split among members (title, totalAmount, category, splitType equal/specific/custom, splits). Arabic مصروف.
_Avoid_: Bill, Charge, Transaction

**Pending Expense**:
An `Expense` with `status=pending` awaiting admin approval. Created by a non-admin; generates no Invoices and does not affect balances until approved. Arabic مستني موافقة.
_Avoid_: Draft, Unapproved expense

**Payment / Invoice**:
A money movement recorded against an expense. `Invoice` is the per-member slice; `Payment` is the user's submission. Only `approved` payments count in balance (`balance = approvedPayments − shareOfApprovedExpenses`).
_Avoid_: Transfer, Settlement

### Notifications

**Notification**:
A persistent inbox row for one recipient pointing at one `Pending Expense` awaiting review. Stores `title/body/url/data{expenseId, houseId}`, `read/readAt`, expires after 90 days. One row per recipient, not per device.
_Avoid_: Push, Alert, Event

**PushSubscription**:
A browser-generated Web Push endpoint plus VAPID keys (`p256dh`, `auth`) for one device. A user may have many; used to deliver OS-level push even when the app is closed.
_Avoid_: Device token, FCM token, Notification
