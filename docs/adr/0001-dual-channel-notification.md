# Dual-channel notification: persistent inbox + VAPID Web Push

When a Member creates a Pending Expense we need the Admin to learn about it both when the app is open and when it is closed. We decided to deliver two channels from the same `createExpense` call: (1) a persistent `Notification` row for the in-app bell menu (one row per recipient, 90-day TTL, read/unread), and (2) a best-effort VAPID Web Push fan-out to every `PushSubscription` of `House.admin` via `web-push`. Inbox writes always succeed even if push fails or permission is denied; OS push never blocks the expense transaction.

Considered options: push-only (loses history after OS dismiss), inbox-only (misses background phone tray), FCM/Capacitor native (heavier SDK, needs native build). VAPID keeps the stack web-only and matches the existing `PushSubscription` + `sw.js` push handler.
