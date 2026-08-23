# Budgetly

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="client/public/assets/logo-dark.png">
    <source media="(prefers-color-scheme: light)" srcset="client/public/assets/logo-light.png">
    <img src="client/public/assets/logo-light.png" alt="Budgetly Logo" width="160" />
  </picture>
</p>

<p align="center">
  <b>Simple way to split bills with roommates and friends.</b><br/>
  Track who paid, who owes, and who is clear — no more Excel math.
</p>

<p align="center">
  <a href="#"><img src="https://img.shields.io/badge/React-19.1-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" /></a>
  <a href="#"><img src="https://img.shields.io/badge/Vite-7.1-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" /></a>
  <a href="#"><img src="https://img.shields.io/badge/Tailwind_CSS-v4-38BDF8?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind" /></a>
  <a href="#"><img src="https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node" /></a>
  <a href="#"><img src="https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" /></a>
  <a href="#"><img src="https://img.shields.io/badge/PWA-Ready-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white" alt="PWA" /></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/License-MIT-yellow?style=flat-square" alt="License" />
  <img src="https://img.shields.io/badge/Version-1.0.0-blue?style=flat-square" alt="Version" />
  <img src="https://img.shields.io/badge/PRs-Welcome-brightgreen?style=flat-square" alt="PRs" />
  <img src="https://img.shields.io/badge/Language-Arabic%20%2F%20English-orange?style=flat-square" alt="Lang" />
  <img src="https://img.shields.io/badge/WCAG-AAA-000000?style=flat-square" alt="WCAG" />
</p>

<p align="center">
  <a href="#-quick-start">Quick Start</a> •
  <a href="#-features">Features</a> •
  <a href="#-how-it-works">How It Works</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-api-overview">API</a>
</p>

---

## <img src="https://img.icons8.com/fluency/24/star.png" width="22" height="22" style="vertical-align: middle; margin-right: 6px;"> What is Budgetly?

**Budgetly** is a web app for small groups — roommates, friends, or family — who share money.

> **Example:** 3 friends share a flat. One pays electricity, another buys groceries. Budgetly splits each cost, records who paid, and shows the balance for everyone. No confusion. No arguments.

**Simple idea:**
```
Your Balance = Total You Paid - Your Share of All Expenses

  + Positive  →  People owe YOU money
  - Negative  →  YOU owe money
  0           →  You are clear
```

---

## <img src="https://img.icons8.com/fluency/24/sparkling.png" width="22" height="22" style="vertical-align: middle; margin-right: 6px;"> Features

### <img src="https://img.icons8.com/fluency/24/user-male-circle.png" width="20" height="20" style="vertical-align: middle; margin-right: 6px;"> For Everyone
| Icon | Feature | Simple Explanation |
| :--- | :--- | :--- |
| <img src="https://img.icons8.com/fluency/24/money.png" width="20" height="20"> | **Add Expenses** | Add a bill and choose how to split it |
| <img src="https://img.icons8.com/fluency/24/bank-card-back-side.png" width="20" height="20"> | **Record Payments** | Say "I paid 200 EGP" in 2 clicks |
| <img src="https://img.icons8.com/fluency/24/combo-chart.png" width="20" height="20"> | **See Your Balance** | Know instantly if you owe or are owed |
| <img src="https://img.icons8.com/fluency/24/edit.png" width="20" height="20"> | **Edit Payments** | Fix or delete your pending payments |
| <img src="https://img.icons8.com/fluency/24/dashboard.png" width="20" height="20"> | **Dashboard** | Clean stats and recent activity |

### <img src="https://img.icons8.com/fluency/24/crown.png" width="20" height="20" style="vertical-align: middle; margin-right: 6px;"> For Admins
| Icon | Feature | Simple Explanation |
| :--- | :--- | :--- |
| <img src="https://img.icons8.com/fluency/24/conference.png" width="20" height="20"> | **Manage Members** | Add or disable people |
| <img src="https://img.icons8.com/fluency/24/checked-checkbox.png" width="20" height="20"> | **Approve Payments** | One click to approve or reject |
| <img src="https://img.icons8.com/fluency/24/report-card.png" width="20" height="20"> | **All Reports** | See totals for every member |
| <img src="https://img.icons8.com/fluency/24/synchronize.png" width="20" height="20"> | **Role Rotation** | Auto-rotate house chores |
| <img src="https://img.icons8.com/fluency/24/export-csv.png" width="20" height="20"> | **Export Data** | Download expenses as CSV |

### <img src="https://img.icons8.com/fluency/24/paint-palette.png" width="20" height="20" style="vertical-align: middle; margin-right: 6px;"> Design
- <img src="https://img.icons8.com/fluency/20/iphone.png" width="16" height="16" style="vertical-align: middle;"> **Mobile First** — Bottom nav, works great on phones
- <img src="https://img.icons8.com/fluency/20/brightness.png" width="16" height="16" style="vertical-align: middle;"> **4 Themes** — `Light` / `Dark` / `Warm` / `Ocean`
- <img src="https://img.icons8.com/fluency/20/language.png" width="16" height="16" style="vertical-align: middle;"> **Egyptian Arabic** — Simple, friendly words (عامية)
- <img src="https://img.icons8.com/fluency/20/accessibility.png" width="16" height="16" style="vertical-align: middle;"> **WCAG AAA** — High contrast, easy to read for everyone
- <img src="https://img.icons8.com/fluency/20/apple-logo.png" width="16" height="16" style="vertical-align: middle;"> **Modern UI** — iOS-inspired, clean and fast

---

## <img src="https://img.icons8.com/fluency/24/layers.png" width="22" height="22" style="vertical-align: middle; margin-right: 6px;"> Tech Stack

| Part | Tools | Why |
| :--- | :--- | :--- |
| <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" width="18" height="18" style="vertical-align: middle;"> **Frontend** | `React 19` + `Vite 7` + `Tailwind CSS v4` + `Framer Motion` | Fast, modern, beautiful |
| <img src="https://img.icons8.com/fluency/20/puzzle.png" width="18" height="18" style="vertical-align: middle;"> **UI** | `shadcn/ui` + `Radix UI` + `Lucide Icons` + `Sonner` | Clean components |
| <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/redux/redux-original.svg" width="18" height="18" style="vertical-align: middle;"> **State** | `TanStack Query` + `React Router 7` | Simple data flow |
| <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg" width="18" height="18" style="vertical-align: middle;"> **Backend** | `Node.js` + `Express 5` + `Mongoose 8` | Stable and fast |
| <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg" width="18" height="18" style="vertical-align: middle;"> **Database** | `MongoDB` | Flexible for expenses |
| <img src="https://img.icons8.com/fluency/20/lock.png" width="18" height="18" style="vertical-align: middle;"> **Auth** | `JWT` + `Google OAuth` + `bcryptjs` | Safe login |
| <img src="https://img.icons8.com/fluency/20/pwa.png" width="18" height="18" style="vertical-align: middle;"> **PWA** | `vite-plugin-pwa` + `Capacitor` | Install like a native app |

---

## <img src="https://img.icons8.com/fluency/24/folder-invoices.png" width="22" height="22" style="vertical-align: middle; margin-right: 6px;"> Project Structure

```bash
Budgetly/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── app/            #   → Router + AppShell
│   │   ├── modules/        #   → house, expense, invoice, analytics
│   │   ├── shared/         #   → Navbar, Sidebar, Context
│   │   └── components/ui/  #   → shadcn components
│   └── public/assets/      #   → Logo (light/dark) & PWA icons
│
├── server/                 # Express Backend
│   ├── models/             #   → User, House, Expense, Invoice, Note
│   ├── routes/             #   → auth, houses, expenses, invoices
│   ├── middleware/         #   → auth, validation
│   └── server.js           #   → Entry point
│
└── docs/                   # Docs & Plans
```

---

## <img src="https://img.icons8.com/fluency/24/rocket.png" width="22" height="22" style="vertical-align: middle; margin-right: 6px;"> Quick Start

### <img src="https://img.icons8.com/fluency/20/checklist.png" width="18" height="18" style="vertical-align: middle; margin-right: 4px;"> 1. Requirements

| Need | Version |
| :--- | :--- |
| <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg" width="16" height="16" style="vertical-align: middle;"> Node.js | `v18+` (v20 best) |
| <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg" width="16" height="16" style="vertical-align: middle;"> MongoDB | Local or Atlas |
| <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/npm/npm-original-wordmark.svg" width="16" height="16" style="vertical-align: middle;"> npm | `v9+` |

### <img src="https://img.icons8.com/fluency/20/download.png" width="18" height="18" style="vertical-align: middle; margin-right: 4px;"> 2. Clone & Install

```bash
# Clone the project
git clone https://github.com/your-username/Budgetly.git
cd Budgetly

# Install everything at once
npm run install-all
# Or manually:
# npm install && cd server && npm install && cd ../client && npm install
```

### <img src="https://img.icons8.com/fluency/20/settings.png" width="18" height="18" style="vertical-align: middle; margin-right: 4px;"> 3. Setup Environment

**Backend** — create `server/.env`:
```env
MONGODB_URI=mongodb://localhost:27017/budgetly
JWT_SECRET=your_super_secret_key_here
PORT=5000
GOOGLE_CLIENT_ID=your_google_client_id
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

**Frontend** — create `client/.env.development.local`:
```env
VITE_API_URL=http://localhost:5000/api
```

> <img src="https://img.icons8.com/fluency/20/light-on.png" width="16" height="16" style="vertical-align: middle;"> Tip: Check `server/ENV_SETUP.md` and `client/.env.development.example` for full list.

### <img src="https://img.icons8.com/fluency/20/play.png" width="18" height="18" style="vertical-align: middle; margin-right: 4px;"> 4. Run the App

```bash
# Run both frontend + backend together (from root)
npm run dev

# Or run separately:
# Backend  → cd server && npm run dev   (http://localhost:5000)
# Frontend → cd client && npm run dev   (http://localhost:5173)
```

Open **http://localhost:5173** <img src="https://img.icons8.com/fluency/20/confetti.png" width="16" height="16" style="vertical-align: middle;">

---

## <img src="https://img.icons8.com/fluency/24/lock.png" width="22" height="22" style="vertical-align: middle; margin-right: 6px;"> How It Works

### <img src="https://img.icons8.com/fluency/20/money.png" width="18" height="18" style="vertical-align: middle; margin-right: 4px;"> 1. Expenses
1. Admin adds expense: `Electricity 300 EGP`
2. Choose split:
   - `Equal` → 100 EGP each (3 people)
   - `Specific` → Only some people
   - `Custom` → Different amounts
3. System saves your share in `splits`.

### <img src="https://img.icons8.com/fluency/20/bank-card-back-side.png" width="18" height="18" style="vertical-align: middle; margin-right: 4px;"> 2. Payments
1. You record: `I paid 150 EGP`
2. Status = <img src="https://img.icons8.com/fluency/16/hourglass.png" width="14" height="14" style="vertical-align: middle;"> `Pending` (waiting for admin)
3. Admin clicks <img src="https://img.icons8.com/fluency/16/checked-checkbox.png" width="14" height="14" style="vertical-align: middle;"> `Approve` or <img src="https://img.icons8.com/fluency/16/cancel.png" width="14" height="14" style="vertical-align: middle;"> `Reject`
4. Only approved payments count in balance.

### <img src="https://img.icons8.com/fluency/20/calculator.png" width="18" height="18" style="vertical-align: middle; margin-right: 4px;"> 3. Balance Formula

```js
balance = totalApprovedPayments - totalShareOfExpenses

// +50  →  You should GET 50 EGP
// -100 →  You should PAY 100 EGP
//  0   →  All clear!
```

---

## <img src="https://img.icons8.com/fluency/24/conference.png" width="22" height="22" style="vertical-align: middle; margin-right: 6px;"> User Roles

| Role | Can Do | Can't Do |
| :--- | :--- | :--- |
| <img src="https://img.icons8.com/fluency/20/crown.png" width="16" height="16" style="vertical-align: middle;"> **Admin** | Add expenses, approve payments, manage members, see all reports, rotate roles, export CSV | — |
| <img src="https://img.icons8.com/fluency/20/user-male-circle.png" width="16" height="16" style="vertical-align: middle;"> **Member** | See expenses, add own payments, edit pending, see own balance | Add expenses, manage members, approve |

---

## <img src="https://img.icons8.com/fluency/24/iphone.png" width="22" height="22" style="vertical-align: middle; margin-right: 6px;"> Pages

| Page | What You See |
| :--- | :--- |
| <img src="https://img.icons8.com/fluency/20/dashboard.png" width="16" height="16" style="vertical-align: middle;"> **Dashboard** | Admin: group stats + who owes. Member: your balance + recent bills |
| <img src="https://img.icons8.com/fluency/20/money.png" width="16" height="16" style="vertical-align: middle;"> **Expenses** | All bills as cards — title, amount, date, who added |
| <img src="https://img.icons8.com/fluency/20/plus-math.png" width="16" height="16" style="vertical-align: middle;"> **Add Expense** | Form to split a new bill |
| <img src="https://img.icons8.com/fluency/20/report-card.png" width="16" height="16" style="vertical-align: middle;"> **Invoices** | Payments list with status |
| <img src="https://img.icons8.com/fluency/20/wallet.png" width="16" height="16" style="vertical-align: middle;"> **My Invoices** | Your payments + how much you still owe |
| <img src="https://img.icons8.com/fluency/20/home.png" width="16" height="16" style="vertical-align: middle;"> **House Details** | Members, settings, rotation tasks |
| <img src="https://img.icons8.com/fluency/20/note.png" width="16" height="16" style="vertical-align: middle;"> **Notes** | Shared notes for the house |
| <img src="https://img.icons8.com/fluency/20/bot.png" width="16" height="16" style="vertical-align: middle;"> **AI Assistant** | Ask about your spending |
| <img src="https://img.icons8.com/fluency/20/user.png" width="16" height="16" style="vertical-align: middle;"> **Profile** | Your info + theme switch |

---

## <img src="https://img.icons8.com/fluency/24/plug.png" width="22" height="22" style="vertical-align: middle; margin-right: 6px;"> API Overview

| Group | Example Routes |
| :--- | :--- |
| <img src="https://img.icons8.com/fluency/20/key.png" width="16" height="16" style="vertical-align: middle;"> **Auth** | `POST /api/auth/login` `GET /api/auth/me` `POST /api/auth/google` |
| <img src="https://img.icons8.com/fluency/20/home.png" width="16" height="16" style="vertical-align: middle;"> **Houses** | `POST /api/houses` `GET /api/houses/:id` `POST /api/houses/join` |
| <img src="https://img.icons8.com/fluency/20/money.png" width="16" height="16" style="vertical-align: middle;"> **Expenses** | `GET /api/expenses` `POST /api/expenses` `DELETE /api/expenses/:id` |
| <img src="https://img.icons8.com/fluency/20/report-card.png" width="16" height="16" style="vertical-align: middle;"> **Invoices** | `GET /api/invoices` `POST /api/invoices` `PATCH /api/invoices/:id/approve` |
| <img src="https://img.icons8.com/fluency/20/combo-chart.png" width="16" height="16" style="vertical-align: middle;"> **Stats** | `GET /api/stats/balance` `GET /api/stats/analytics` |
| <img src="https://img.icons8.com/fluency/20/note.png" width="16" height="16" style="vertical-align: middle;"> **Notes** | `GET /api/notes` `POST /api/notes` |
| <img src="https://img.icons8.com/fluency/20/bot.png" width="16" height="16" style="vertical-align: middle;"> **AI** | `POST /api/ai/chat` |

Full docs → `docs/api/00_OVERVIEW.md`

---

## <img src="https://img.icons8.com/fluency/24/paint-palette.png" width="22" height="22" style="vertical-align: middle; margin-right: 6px;"> Themes

| Theme | Look |
| :--- | :--- |
| <img src="https://img.icons8.com/fluency/20/sun.png" width="16" height="16" style="vertical-align: middle;"> **Light** | Clean white, best for day |
| <img src="https://img.icons8.com/fluency/20/moon.png" width="16" height="16" style="vertical-align: middle;"> **Dark** | Easy on eyes at night |
| <img src="https://img.icons8.com/fluency/20/autumn.png" width="16" height="16" style="vertical-align: middle;"> **Warm** | Soft beige, cozy |
| <img src="https://img.icons8.com/fluency/20/water.png" width="16" height="16" style="vertical-align: middle;"> **Ocean** | Cool blue, calm |

Switch anytime from the top bar — saves automatically.

---

## <img src="https://img.icons8.com/fluency/24/cloud.png" width="22" height="22" style="vertical-align: middle; margin-right: 6px;"> Deployment

- <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vercel/vercel-original.svg" width="16" height="16" style="vertical-align: middle;"> **Frontend:** Vercel / Netlify → `npm run build` in `client/`
- <img src="https://img.icons8.com/fluency/20/server.png" width="16" height="16" style="vertical-align: middle;"> **Backend:** Render / Railway / VPS → `npm start` in `server/`
- <img src="https://img.icons8.com/fluency/20/pwa.png" width="16" height="16" style="vertical-align: middle;"> **PWA:** Works offline after first load, installable on Android via Capacitor

See `DEPLOYMENT.md` for step-by-step guide.

---

## <img src="https://img.icons8.com/fluency/24/map.png" width="22" height="22" style="vertical-align: middle; margin-right: 6px;"> Roadmap

| Status | Feature |
| :--- | :--- |
| <img src="https://img.icons8.com/fluency/16/checked-checkbox.png" width="14" height="14" style="vertical-align: middle;"> Done | Split types, approval flow, 4 themes, PWA, Google login |
| <img src="https://img.icons8.com/fluency/16/hourglass.png" width="14" height="14" style="vertical-align: middle;"> Next | <img src="https://img.icons8.com/fluency/16/pdf.png" width="14" height="14" style="vertical-align: middle;"> Export PDF, <img src="https://img.icons8.com/fluency/16/appointment-reminders.png" width="14" height="14" style="vertical-align: middle;"> Notifications, <img src="https://img.icons8.com/fluency/16/combo-chart.png" width="14" height="14" style="vertical-align: middle;"> Charts |
| <img src="https://img.icons8.com/fluency/16/light-on.png" width="14" height="14" style="vertical-align: middle;"> Ideas | <img src="https://img.icons8.com/fluency/16/bank-card-back-side.png" width="14" height="14" style="vertical-align: middle;"> Payment integration, <img src="https://img.icons8.com/fluency/16/iphone.png" width="14" height="14" style="vertical-align: middle;"> React Native app, <img src="https://img.icons8.com/fluency/16/currency-exchange.png" width="14" height="14" style="vertical-align: middle;"> Multi-currency |

---

## <img src="https://img.icons8.com/fluency/24/handshake.png" width="22" height="22" style="vertical-align: middle; margin-right: 6px;"> Contributing

Want to help? Great!

```bash
1. Fork the repo
2. Create a branch: git checkout -b feat/my-feature
3. Commit: git commit -m "feat: add my feature"
4. Push: git push origin feat/my-feature
5. Open a Pull Request
```

All PRs are welcome — even small fixes! <img src="https://img.icons8.com/fluency/20/confetti.png" width="16" height="16" style="vertical-align: middle;">

---

## <img src="https://img.icons8.com/fluency/24/document.png" width="22" height="22" style="vertical-align: middle; margin-right: 6px;"> License

**MIT** — Free to use, copy, and share.

---

## <img src="https://img.icons8.com/fluency/24/conference-call.png" width="22" height="22" style="vertical-align: middle; margin-right: 6px;"> Team

Built with <img src="https://img.icons8.com/fluency/20/hearts.png" width="16" height="16" style="vertical-align: middle;"> by the **Budgetly Team** in Egypt.

<p align="center">
  <b>Budgetly — Split smart. Live easy. <img src="https://img.icons8.com/fluency/20/hearts.png" width="14" height="14" style="vertical-align: middle;"></b>
</p>

<p align="center">
  <sub>Made for roommates, friends, and anyone who shares money.</sub>
</p>
