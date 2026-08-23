# 💰 Budgetly

<p align="center">
  <img src="client/public/assets/logo.png" alt="Budgetly Logo" width="140" />
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

## 🌟 What is Budgetly?

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

## ✨ Features

### 👤 For Everyone
| Icon | Feature | Simple Explanation |
| :--- | :--- | :--- |
| 💸 | **Add Expenses** | Add a bill and choose how to split it |
| 💳 | **Record Payments** | Say "I paid 200 EGP" in 2 clicks |
| 📊 | **See Your Balance** | Know instantly if you owe or are owed |
| ✏️ | **Edit Payments** | Fix or delete your pending payments |
| 📈 | **Dashboard** | Clean stats and recent activity |

### 👑 For Admins
| Icon | Feature | Simple Explanation |
| :--- | :--- | :--- |
| 👥 | **Manage Members** | Add or disable people |
| ✅ | **Approve Payments** | One click to approve or reject |
| 🧾 | **All Reports** | See totals for every member |
| 🔄 | **Role Rotation** | Auto-rotate house chores |
| 📤 | **Export Data** | Download expenses as CSV |

### 🎨 Design
- 📱 **Mobile First** — Bottom nav, works great on phones
- 🌓 **4 Themes** — `Light` / `Dark` / `Warm` / `Ocean`
- 🇪🇬 **Egyptian Arabic** — Simple, friendly words (عامية)
- ♿ **WCAG AAA** — High contrast, easy to read for everyone
- ✨ **Modern UI** — iOS-inspired, clean and fast

---

## 🧱 Tech Stack

| Part | Tools | Why |
| :--- | :--- | :--- |
| 🎨 **Frontend** | `React 19` + `Vite 7` + `Tailwind CSS v4` + `Framer Motion` | Fast, modern, beautiful |
| 🧩 **UI** | `shadcn/ui` + `Radix UI` + `Lucide Icons` + `Sonner` | Clean components |
| 🔄 **State** | `TanStack Query` + `React Router 7` | Simple data flow |
| ⚙️ **Backend** | `Node.js` + `Express 5` + `Mongoose 8` | Stable and fast |
| 🗄️ **Database** | `MongoDB` | Flexible for expenses |
| 🔐 **Auth** | `JWT` + `Google OAuth` + `bcryptjs` | Safe login |
| 📱 **PWA** | `vite-plugin-pwa` + `Capacitor` | Install like a native app |

---

## 📂 Project Structure

```bash
Budgetly/
├── client/                 # 🎨 React Frontend
│   ├── src/
│   │   ├── app/            #   → Router + AppShell
│   │   ├── modules/        #   → house, expense, invoice, analytics
│   │   ├── shared/         #   → Navbar, Sidebar, Context
│   │   └── components/ui/  #   → shadcn components
│   └── public/assets/      #   → Logo & PWA icons
│
├── server/                 # ⚙️ Express Backend
│   ├── models/             #   → User, House, Expense, Invoice, Note
│   ├── routes/             #   → auth, houses, expenses, invoices
│   ├── middleware/         #   → auth, validation
│   └── server.js           #   → Entry point
│
└── docs/                   # 📚 Docs & Plans
```

---

## 🚀 Quick Start

### 1️⃣ Requirements

| Need | Version |
| :--- | :--- |
| 🟢 Node.js | `v18+` (v20 best) |
| 🍃 MongoDB | Local or Atlas |
| 📦 npm | `v9+` |

### 2️⃣ Clone & Install

```bash
# Clone the project
git clone https://github.com/your-username/Budgetly.git
cd Budgetly

# Install everything at once
npm run install-all
# Or manually:
# npm install && cd server && npm install && cd ../client && npm install
```

### 3️⃣ Setup Environment

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

> 💡 Tip: Check `server/ENV_SETUP.md` and `client/.env.development.example` for full list.

### 4️⃣ Run the App

```bash
# Run both frontend + backend together (from root)
npm run dev

# Or run separately:
# Backend  → cd server && npm run dev   (http://localhost:5000)
# Frontend → cd client && npm run dev   (http://localhost:5173)
```

Open **http://localhost:5173** 🎉

---

## 🔐 How It Works

### 💸 1. Expenses
1. Admin adds expense: `Electricity 300 EGP`
2. Choose split:
   - `Equal` → 100 EGP each (3 people)
   - `Specific` → Only some people
   - `Custom` → Different amounts
3. System saves your share in `splits`.

### 💳 2. Payments
1. You record: `I paid 150 EGP`
2. Status = `⏳ Pending` (waiting for admin)
3. Admin clicks `✅ Approve` or `❌ Reject`
4. Only approved payments count in balance.

### 🧮 3. Balance Formula

```js
balance = totalApprovedPayments - totalShareOfExpenses

// +50  →  You should GET 50 EGP
// -100 →  You should PAY 100 EGP
//  0   →  All clear!
```

---

## 👥 User Roles

| Role | Can Do | Can't Do |
| :--- | :--- | :--- |
| **👑 Admin** | Add expenses, approve payments, manage members, see all reports, rotate roles, export CSV | — |
| **👤 Member** | See expenses, add own payments, edit pending, see own balance | Add expenses, manage members, approve |

---

## 📱 Pages

| Page | What You See |
| :--- | :--- |
| 🏠 **Dashboard** | Admin: group stats + who owes. Member: your balance + recent bills |
| 💸 **Expenses** | All bills as cards — title, amount, date, who added |
| ➕ **Add Expense** | Form to split a new bill |
| 🧾 **Invoices** | Payments list with status |
| 💰 **My Invoices** | Your payments + how much you still owe |
| 🏡 **House Details** | Members, settings, rotation tasks |
| 📝 **Notes** | Shared notes for the house |
| 🤖 **AI Assistant** | Ask about your spending |
| 👤 **Profile** | Your info + theme switch |

---

## 🔌 API Overview

| Group | Example Routes |
| :--- | :--- |
| 🔑 **Auth** | `POST /api/auth/login` `GET /api/auth/me` `POST /api/auth/google` |
| 🏠 **Houses** | `POST /api/houses` `GET /api/houses/:id` `POST /api/houses/join` |
| 💸 **Expenses** | `GET /api/expenses` `POST /api/expenses` `DELETE /api/expenses/:id` |
| 🧾 **Invoices** | `GET /api/invoices` `POST /api/invoices` `PATCH /api/invoices/:id/approve` |
| 📊 **Stats** | `GET /api/stats/balance` `GET /api/stats/analytics` |
| 📝 **Notes** | `GET /api/notes` `POST /api/notes` |
| 🤖 **AI** | `POST /api/ai/chat` |

Full docs → `docs/api/00_OVERVIEW.md`

---

## 🎨 Themes

| Theme | Look |
| :--- | :--- |
| ☀️ **Light** | Clean white, best for day |
| 🌙 **Dark** | Easy on eyes at night |
| 🍂 **Warm** | Soft beige, cozy |
| 🌊 **Ocean** | Cool blue, calm |

Switch anytime from the top bar — saves automatically.

---

## 📦 Deployment

- **Frontend:** Vercel / Netlify → `npm run build` in `client/`
- **Backend:** Render / Railway / VPS → `npm start` in `server/`
- **PWA:** Works offline after first load, installable on Android via Capacitor

See `DEPLOYMENT.md` for step-by-step guide.

---

## 🛣️ Roadmap

| Status | Feature |
| :--- | :--- |
| ✅ Done | Split types, approval flow, 4 themes, PWA, Google login |
| 🔜 Next | 📄 Export PDF, 🔔 Notifications, 📊 Charts |
| 💭 Ideas | 💳 Payment integration, 📱 React Native app, 💱 Multi-currency |

---

## 🤝 Contributing

Want to help? Great!

```bash
1. Fork the repo
2. Create a branch: git checkout -b feat/my-feature
3. Commit: git commit -m "feat: add my feature"
4. Push: git push origin feat/my-feature
5. Open a Pull Request
```

All PRs are welcome — even small fixes!

---

## 📄 License

**MIT** — Free to use, copy, and share.

---

## 👨‍💻 Team

Built with ❤️ by the **Budgetly Team** in Egypt.

<p align="center">
  <b>Budgetly — Split smart. Live easy. 💚</b>
</p>

<p align="center">
  <sub>Made for roommates, friends, and anyone who shares money.</sub>
</p>
