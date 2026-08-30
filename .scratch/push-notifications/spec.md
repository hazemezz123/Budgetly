# Spec: Push Notification — Member adds Pending Expense → Admin notified (OS push + inbox)

## Problem Statement

Members (`role=user`) in a `House` can record a `Pending Expense` (`status=pending`, Arabic مستني موافقة) that waits for the Admin's approval. Today the OS push pipe exists (`server/services/pushNotificationService.js`, `server/models/PushSubscription.js`, `server/controllers/expenseController.js:150-179`, `client/public/sw.js:28`, `client/src/shared/hooks/usePushNotifications.js:25`, VAPID docs in `server/ENV_SETUP.md:68`) and the Admin can opt-in via the Profile page (`client/src/modules/profile/pages/ProfilePage.jsx:572`), but there is no persistent in-app inbox. Once the OS notification is dismissed, the pending expense is invisible until the Admin manually browses `Expenses?status=pending`. If the Admin denied the browser permission or has no `PushSubscription`, they get no signal at all. The product needs a reliable **phone notification menu** — both the OS tray (when closed) and an in-app bell with unread count and history.

## Solution

When any non-Admin member creates a `Pending Expense`, the server atomically (a) writes a new `Notification` inbox row for `House.admin` and (b) fans out a VAPID Web Push to every `PushSubscription` of that admin. The client shows a bell icon in the `Navbar` header (and mobile top bar) with an unread badge, a dropdown of the 10 most recent notifications, and a full `/notifications` page. Clicking a notification (in the OS tray or in the app) navigates to `Expenses?status=pending&expenseId=<id>` and opens the expense detail modal via the existing `budgetly:pending-expense-open` channel (`client/src/shared/context/AuthContext.jsx:84`). The OS push is best-effort and never blocks the expense creation; the inbox row is always created. The inbox expires after 90 days via a TTL index.

## User Stories

### Creator (Member)

1. As a Member, I want to add a مصروف with Equal/Specific/Custom split, so that my House can split the cost without spreadsheet math.
2. As a Member, I want my newly created Expense to enter `pending` automatically when I am not an admin, so that the admin gate (`PRODUCT.md:20`) is respected.
3. As a Member, I want a clear success toast after adding a pending expense, so that I know it is "مستني موافقة" and not yet counted in balances.
4. As a Member, I want to not receive a notification about my own pending expense, so that I am not spammed by my own actions.

### Recipient (Admin)

5. As an Admin, I want to receive an OS push notification on my phone (even when the app is background/closed) when any Member adds a pending expense, so that I can review quickly.
6. As an Admin, I want that OS notification to show an Arabic title `"مصروف جديد بانتظار المراجعة"` and body `"<creatorName> أضاف «<title>» بقيمة <amount> ج.م"` with the Budgetly icon, so that I understand the event at a glance.
7. As an Admin, I want tapping the OS notification to open/focus the Budgetly app and navigate to the pending expense detail (modal or list filtered to `status=pending`), so that I can approve/reject in one tap.
8. As an Admin, I want a bell icon in the Navbar header (desktop + mobile top bar, next to theme toggle) with an unread count badge, so that I see at a glance how many pending reviews await.
9. As an Admin, I want clicking the bell to open a dropdown with the 10 most recent notifications (newest first), each showing title, body, time-ago, and unread dot, so that I can triage without leaving my current page.
10. As an Admin, I want the dropdown to offer "تعليم الكل كمقروء" (mark all read) and "عرض الكل" (view all), so that I can clear the badge or drill into history.
11. As an Admin, I want a full `/notifications` page with paginated list, unread filter, and bulk "mark all read", so that I can review history beyond 10 items.
12. As an Admin, I want clicking any in-app notification row to navigate to `Expenses?status=pending&expenseId=...` and open the `ExpenseDetailsModal`, and simultaneously mark that notification as read.
13. As an Admin, I want unread notifications to remain unread until I explicitly read them (via click or mark-read), not auto-cleared by loading the list.
14. As an Admin, I want notifications to be per-recipient (one DB row per admin, not per device) but push to be per-device (every `PushSubscription` of mine gets the OS push), so that multi-phone works correctly.
15. As an Admin, I want to not be notified when I myself create an expense (self-skip), because I don't need to approve my own `approved` expense.
16. As an Admin, I want the inbox badge to poll in the background (30s interval + on `focus`/`visibilitychange`) even when I denied OS permission, so that the in-app bell still works without push.
17. As an Admin, I want notifications to expire after 90 days so my inbox never grows unbounded.

### Subscription & Permission

18. As an Admin, I want to enable push via Profile → "إشعارات المصاريف" → "تفعيل" which triggers `Notification.requestPermission()` and `PushManager.subscribe()` with the VAPID public key from `GET /api/notifications/vapid-public-key`, then saves via `POST /api/notifications/subscribe`.
19. As an Admin, I want a clear error toast if my browser does not support Push/SW, or permission is denied, with instructions to enable via browser site settings.
20. As a user on any role, I want to disable push per-device via "إيقاف" which calls `POST /api/notifications/unsubscribe` and `PushSubscription.deleteOne`, without affecting other devices.
21. As a returning Admin with `Notification.permission === "granted"` but no active `PushSubscription` (e.g., after clearing site data), I want `AuthContext` to auto-resubscribe on login via `syncPushSubscriptionIfNeeded`/`resubscribeIfStale` pattern already in `client/src/shared/context/AuthContext.jsx:24-78`.

### House & Edge Cases

22. As a system, I want to skip notification entirely if `req.user.house` is missing or `House.admin` is absent/inactive, logging a warning, so that no orphan rows are created.
23. As a system, I want expense creation to succeed even if inbox write fails or `sendPushToUsers` throws (log error, don't 500 the expense), so that reliability of the expense flow is preserved.
24. As a system, I want `GET /api/expenses` to remain the source of truth for pending lists; notifications are pointers that deeplink to it, not a separate queue.

### Non-functional / Brand

25. As a user, I want all notification UI text in Egyptian Arabic (عامية) and RTL layout, using `Cairo` for body and `Roboto Mono` for amounts (`DESIGN.md:48`), so that voice is consistent.
26. As an admin, I want the bell + dropdown + page to respect the four themes (Light/Dark/Warm/Ocean) and WCAG AAA contrast, using surface/border/primary tokens (`DESIGN.md:59`) and the standard gold badge for unread.
27. As an admin, I want clicking an OS notification while the app is already open to dispatch `budgetly:notification-click` → `budgetly:pending-expense-open` and focus the existing tab (current `sw.js:56-106` + `AuthContext.jsx:84` behavior), not duplicate tabs.

## Implementation Decisions

- **Domain terms:** Follow `CONTEXT.md` — `House`, `Member`, `Admin`, `Expense`, `Pending Expense`, `Notification` (inbox row, per-recipient, 90-day TTL), `PushSubscription` (per-device endpoint+keys). Avoid "push" for the inbox row; use "notification" for inbox and "push" only for Web Push.
- **Schema — new `Notification` model (`server/models/Notification.js`):**
  ```
  {
    recipient: ObjectId(User) index,
    sender: ObjectId(User),
    house: ObjectId(House) index,
    expense: ObjectId(Expense),
    type: "pending-expense" enum,
    title: String, // "مصروف جديد بانتظار المراجعة"
    body: String,  // "<creator> أضاف «<title>» بقيمة <amount> ج.م"
    url: String,   // "/expenses?status=pending&expenseId=<id>"
    data: { expenseId, houseId, creatorName, totalAmount, category },
    icon: String default "/assets/logo.png",
    badge: String default "/favicon-96x96.png",
    tag: String unique-per-expense, // "pending-expense-<expenseId>"
    read: Boolean default false,
    readAt: Date | null,
    createdAt, updatedAt (timestamps)
  }
  Indexes: {recipient, read, createdAt desc}, {recipient, createdAt}, {house}, TTL {createdAt expireAfterSeconds 7776000 (90d)}
  ```
  Lean on the pre-existing `PushSubscription` model — no change except reusing `getSubscriptionsForUsers` fan-out.
- **Server — `createExpense` wiring (`server/controllers/expenseController.js:150-179` extended):** After `Expense.create` with `status=pending`, run an inline `try/catch` block that:
  1) Loads `House.admin` (already done) and checks `house.admin.toString() !== req.user.id`; if same, skip.
  2) Builds `title/body/url/tag/data` via the existing `buildNotificationPayload` helper (reuse `pushNotificationService:buildNotificationPayload`).
  3) Writes `Notification.create({...})` for the admin (new service `notificationService.createNotification` or direct model call — prefer a thin `services/notificationService.js` with `createForPendingExpense` and `markRead` helpers).
  4) Calls `sendPushToUsers([house.admin], payload)` — best-effort, catch and `console.error`, do not throw. Preserve existing response path (status 201 with populated expense). No transaction needed; failure to notify does not rollback expense.
- **Server — notification service (`server/services/notificationService.js` new):** Functions: `createNotificationForPendingExpense({recipientId, senderId, houseId, expense})`, `listNotifications({recipientId, page, limit, unreadOnly})`, `getUnreadCount`, `markOneRead`, `markAllRead`, `remove`. Thin wrapper around the model; push stays in `pushNotificationService.js`.
- **Server — routes (`server/routes/notifications.js` expanded, mounted at `/api/notifications` in `server/server.js:89`):** Keep existing `GET /vapid-public-key`, `POST /subscribe`, `POST /unsubscribe` (`authenticate`); add `GET /` (list paginated, `?page&limit&unreadOnly`), `GET /unread-count` (lightweight `{count}`), `PATCH /:id/read`, `PATCH /read-all`, `DELETE /:id` — all `authenticate`. Admin-only is not enforced for list endpoints; any authenticated user can list own notifications, but only the admin will have pending-expense rows.
- **Server — validation/middleware:** Reuse `authenticate` (`server/middleware/auth.js`). No new validation beyond `notifications` query Zod (page/limit numeric). Rate-limiter already global.
- **Client — push plumbing remains:** `client/src/shared/hooks/usePushNotifications.js:25`, `client/src/modules/auth/api/pushApi.js`, `client/public/sw.js:28-106`, `client/src/shared/context/AuthContext.jsx:24-78` (`syncPushSubscriptionIfNeeded`/`resubscribeIfStale` + `budgetly:notification-click` → `budgetly:pending-expense-open`) — no change except ensuring the Profile toggle (`ProfilePage.jsx:572`) continues to work.
- **Client — inbox API (`client/src/modules/notifications/api/notificationsApi.js` new):** `GET /notifications`, `GET /notifications/unread-count`, `PATCH /notifications/:id/read`, `PATCH /notifications/read-all`, `DELETE /notifications/:id` via the shared `utils/api` (JWT cookie/header).
- **Client — query keys (`client/src/shared/api/queryKeys.js` extend):** Add `notifications: { all: ["notifications"], list: (page, unreadOnly)=>["notifications", page, unreadOnly], unreadCount: ["notifications","unread-count"] }`.
- **Client — bell UI (`client/src/shared/components/Navbar.jsx:101` header mod + new `client/src/shared/components/NotificationBell.jsx` + `client/src/modules/notifications/components/NotificationDropdown.jsx`):** Bell uses `Bell` icon from `lucide-react`, sits in the header quick-tools row next to the `StickyNote`/theme/profile buttons; shows a gold badge with unread count when >0. Click opens a `DropdownMenu`/`Sheet` showing up to 10 recent items (skeleton while loading). Each item renders title (bold), body (secondary), time-ago (`Intl.RelativeTimeFormat` ar-EG), unread dot. Footer has "تعليم الكل كمقروء" (calls `PATCH /read-all` + invalidates `unreadCount`) and "عرض الكل" → `/notifications`. Clicking item calls `PATCH /:id/read` then navigates `navigate(url)` and dispatches `budgetly:pending-expense-open` so `ExpensesPage` opens `ExpenseDetailsModal`.
- **Client — full page (`client/src/modules/notifications/pages/NotificationsPage.jsx` new, route `/notifications`):** Paginated list (10/page), tabs All/Unread, empty state in Arabic, bulk mark-all, pull-to-refresh on mobile. Reuses `Card`, `Badge`, `Skeleton` from `components/ui`.
- **Client — polling:** `NotificationBell` owns a `useQuery` for `unreadCount` with `refetchInterval: 30000`, plus `window.addEventListener("focus")` and `document.visibilitychange` refetch via `queryClient.invalidateQueries`. Also refetch after expense mutations (`useAddExpense` invalidates notifications indirectly via refetch on focus).
- **Routing (`client/src/app/router/routes.jsx`):** Add `path: "/notifications", element: <ProtectedRoute><NotificationsPage/></ProtectedRoute>`.
- **Styling:** Follow `DESIGN.md` tokens — gold accent only on the bell badge and unread dot, surfaces in `bg-(--color-surface)`/`border-(--color-border)`, rounded-2xl cards, flat-by-default shadows, glass blur on dropdown. Amounts in `Roboto Mono`.
- **Perf:** Index choices above keep unread-count as an indexed `countDocuments({recipient, read:false})`. Send push fan-out is `Promise.all` over subscriptions; TTL avoids unbounded growth. No extra WS needed — polling is cheap at 30s per active tab.

## Testing Decisions

- **What we test:** External behaviour at the highest useful seam — HTTP/API contracts — not implementation details. For server: mocking Mongoose models (`User.findById`, `House.findById`, `Expense.create`, `Notification.create`, `PushSubscription.find`) as prior art does (`server/test/invoiceController.bulkApprove.test.js`, `server/test/analyticsController.test.js` using `node:test` + `assert/strict`). For client: hook/api unit tests or component tests only if needed; prefer API layer tests.
- **Existing seam to prefer:** Controller-unit seam (`expenseController.createExpense(req,res)` and `notificationController.list/getUnreadCount/markRead`) with stubbed models — matches current codebase's `node:test` style. Ideal one-seam would be integration via `supertest` against `/api/expenses` + `/api/notifications`; keep both possible, but unit-with-mocks is the pragmatic first seam given no existing integration harness.
- **Server tests to write:**
  1) `notificationService.test.js`: create+list+unreadCount+markRead+markAllRead + TTL shape.
  2) `expenseController.notification.test.js`: when non-admin creates pending expense, `Notification.create` called once for `House.admin`, `sendPushToUsers` called with correct payload (title/body/tag/url/data), self-skip when `req.user.id === house.admin`, swallowing push errors keeps 201 response.
  3) `notificationController.test.js`: `GET /api/notifications` paginated + unread filter, `GET /unread-count`, `PATCH /:id/read` 404/403 when not owner, `PATCH /read-all`, `DELETE`.
  4) Existing regression: ensure `GET /api/expenses` unchanged.
- **Client tests:** Lightweight — `notificationsApi.test.js` (mocks `utils/api`), `NotificationBell.test.js` if adoption allows (unread badge renders, click marks read).
- **Prior art:** `invoiceController.bulkApprove.test.js` (mock `Invoice.find`/`Payment.findById`/`User.findById`, `createRes` helper, `test.afterEach` restoration). Follow same helpers for `Notification` mocks. Use `node --test` (Node built-in), no Jest added unless needed.

## Out of Scope

- FCM / Capacitor native push (only VAPID Web Push via `web-push`).
- Email fallback for notifications.
- Notifying other triggers (payments, invoice approvals, expense approval/rejection) beyond pending-expense creation.
- Multi-admin fan-out beyond `House.admin` (deferred; would query `User.find({house, role: admin, isActive})`).
- In-notification approve/reject actions (action buttons in push); approval stays on Expense details page.
- Real-time socket (WebSocket/SSE) — polling only for this slice.
- Any modification to balance formula (`balance = approvedPayments − shareOfApprovedExpenses`) or invoice generation.

## Further Notes

- VAPID keys: reuse `server/ENV_SETUP.md:68` — generate via `node -e "import('web-push').then(...)"` and set `VAPID_PUBLIC_KEY/PRIVATE_KEY/SUBJECT` in `server/.env`. If absent, `pushNotificationService` auto-generates ephemeral keys (warns) — fine for dev but document in README that prod requires persistent keys.
- `client/public/sw.js` already handles `push`→`showNotification` and `notificationclick`→`clients.matchAll` + `postMessage` (`budgetly:notification-click`). Keep as-is; the new inbox shares the same `payload.notification.data` so both channels stay in sync.
- Deep-link pattern `"/expenses?status=pending&expenseId=<id>"` is currently dispatched via `AuthContext` → `budgetly:pending-expense-open` custom event; extend `ExpensesPage` to open `ExpenseDetailsModal` when `expenseId` is present in URL.
- Consider a follow-up ticket for `DELETE /notifications` bulk cleanup or user preference "mute house notifications".

