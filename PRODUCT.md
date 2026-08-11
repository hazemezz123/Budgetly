# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary users are roommates and friends in Egypt sharing household expenses (rent, utilities, groceries) from one informal group. Two confirmed roles: regular members who record their payments and track their balance, and an admin who manages members and approves payments. Admin is a member of the same group, not a professional operator.

## Product Purpose

Budgetly tracks shared expenses and payments within one group, computes every member's balance automatically (paid − share), and gives the admin approval authority over payments. Success means the group always knows who owes whom, without spreadsheet math, and trust issues are settled by the admin's approval step.

## Positioning

The admin-approval gate on payments is the mechanism a naive splitter does not have: a recorded payment only counts once the admin approves it, so balances reflect agreed reality, not one member's self-reported claim.

## Operating Context

- Used informally: on phones, at home, in Egyptian Arabic. Bottom navigation and mobile-first layout match this.
- Members record expenses and payments mid-conversation, then the admin reviews pending payments later.
- Money is in EGP; the balance sign convention (positive = you are owed, negative = you owe) is explained to users.

## Capabilities and Constraints

- Capabilities: expense recording with equal/specific/custom splits, payment recording with pending → approved state, admin member management (add/disable), per-member and admin-wide stats and reports.
- Constraints: web platform (React + Vite + Tailwind CSS v4 frontend, Express + MongoDB backend, JWT auth, Google OAuth), no native app; payment approval is manual, not automatic.
- Terminology: مصروف (expense), مدفوعات (payments), pending = مستني موافقة, رصيد (balance) with positive = owes-you / negative = you-owe convention.
- Explicitly undecided: export/PDF, notifications, payment integration, mobile app, multi-currency, charts — listed as future work, not committed.

## Brand Commitments

- UI copy and voice are Egyptian colloquial Arabic; the Arabic reading direction is first-class.
- Four themes are binding: Light, Dark, Warm, Ocean.
- WCAG AAA contrast is binding.
- iOS-inspired modern look is binding ("واجهة عصرية مستوحاة من iOS"), current visual world to be treated as incumbent authority until a redesign decision.

## Evidence on Hand

- README.md: full product description, user stories, admin/user permission matrix, EGP scenario walkthrough (علي/حسام/محمد electricity bill example), future roadmap.
- client/src: React pages (Login, Dashboard, Expenses, AddExpense, Payments, MyPayments, AddPayment, Members), AuthContext, ThemeContext, Tailwind v4 theme tokens.
- server: Express + Mongoose models (User, Expense, Payment), routes (auth, users, expenses, payments, stats).
- No testimonials, case studies, press, or production metrics exist; future work must not fabricate them.

## Product Principles

1. Trust through transparency: every balance is derivable from recorded expenses and approved payments; the approval step exists so no one can inflate their own claim.
2. The admin gate is the source of truth: only approved payments move balances.
3. Speed for the record-keeper: logging an expense or payment mid-conversation takes seconds; the mobile-first, bottom-nav layout exists for that moment.
4. Everyone can self-serve: members see their own balance and pending items without asking the admin; admins get the group-wide view.
5. The group stays small and informal: no invite links, teams, or billing machinery beyond member add/disable.

## Accessibility & Inclusion

- WCAG AAA contrast is a binding requirement across all four themes.
- RTL layout and Egyptian colloquial Arabic are core usability requirements, not cosmetic.
