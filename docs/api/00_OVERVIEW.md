# Budgetly API Architecture & Overview

## 1. High-Level Architecture Summary

Budgetly is a shared household budget tracking and expense management backend service.

- **Runtime & Framework**: Node.js (ES Modules, `"type": "module"`) with Express.js 5 (`^5.1.0`).
- **Database**: MongoDB Atlas using Mongoose (`^8.19.2`).
- **Deployment Targets**: 
  - Standalone Node.js server (listening on `PORT`, default `5000`).
  - Vercel Serverless Functions (`server.js` exports default `app` without binding `app.listen()` when `process.env.VERCEL` is present).
- **Database Connection Management**:
  - Global connection caching (`globalThis.__mongooseCache`) prevents connection leaks across serverless function invocations.
  - Non-production SRV DNS resolution workaround using Google (`8.8.8.8`, `8.8.4.4`) and Cloudflare (`1.1.1.1`) DNS servers to resolve local VPN/proxy interception issues.
  - Lazy connection middleware ensures active DB state before route execution (`/api/health` bypasses DB connection enforcement to report actual state).

---

## 2. Global Middlewares

The Express application pipeline enforces the following global middlewares in order:

1. **CORS (`cors`)**:
   - Dynamic origin verification supporting:
     - Configured `process.env.CLIENT_URL`
     - Local web dev: `http://localhost:5173`, `http://localhost:5174`
     - Mobile runtime (Capacitor): `capacitor://localhost`, `http://localhost`
   - `credentials: true` enabled for cross-origin cookie exchange.
   - Fallback permissive callback during development.
2. **Cookie Parser (`cookie-parser`)**:
   - Parses HTTP request cookies (specifically `token`) for web sessions.
3. **Body Parser (`express.json()`)**:
   - Parses incoming JSON payloads into `req.body`.
4. **Global Rate Limiter (`express-rate-limit`)**:
   - Window: 15 minutes (`15 * 60 * 1000` ms).
   - Max requests: 250 requests per IP address per window.
   - Returns HTTP 429 when threshold exceeded:
     ```json
     {
       "message": "لقد تجاوزت الحد المسموح به من الطلبات، يرجى المحاولة مرة أخرى لاحقًا."
     }
     ```
5. **Database Connection Gate**:
   - Checks `connectToDatabase()` before routing any business request.
   - Responds with `503 Service Unavailable` if MongoDB connection fails.
6. **Zod Request Validator Middleware (`middleware/validate.js`)**:
   - Reusable schema validator for `body`, `query`, and `params`.
   - Formats validation errors to `{ message: string, errors: [{ field: string, message: string }] }` with status `400`.

---

## 3. Authentication & Authorization Strategy

### Dual Token Transmission (Web vs Mobile)
Authentication supports both HTTP-only Cookies and Bearer Tokens:
- **Web Clients**: Server sets an HTTP-only cookie `token` upon registration, password login, and Google login.
  - Cookie flags: `httpOnly: true`, `secure: process.env.NODE_ENV === "production"`, `sameSite: "lax"`, `maxAge: 7 days`.
- **Mobile/Capacitor & API Clients**: Server returns JWT in the JSON response body (`{ token, user }`). Mobile clients pass this in the HTTP header:
  ```http
  Authorization: Bearer <token>
  ```

### Authentication Middleware (`middleware/auth.js`)
- Resolves token in priority: `req.cookies?.token` -> `req.header("Authorization")?.replace("Bearer ", "")`.
- Verifies JWT using `process.env.JWT_SECRET`.
- Fetches fresh user record from MongoDB (`User.findById(decoded.id).select("-password")`) to guarantee that role changes, house transfers, or deactivations take effect immediately without waiting for token expiration.
- Inactive users (`isActive === false`) receive `401 Unauthorized`.
- Injects `req.user = { id, username, role, house }` into request lifecycle.

### Role-Based Access Control (RBAC)
- **Roles**:
  - `user`: Standard household member.
  - `admin`: Household admin (creator or designated leader) with authority over house settings, member removal, expense approvals, invoice approvals, and data management.
- **Admin Middleware (`isAdmin`)**: Verifies `req.user.role === "admin"`, returning `403 Forbidden` if unauthorized.

---

## 4. Base URL Configuration & Routing Layout

| Route Prefix | Controller / Module | Description |
| :--- | :--- | :--- |
| `/api/auth` | `routes/auth.js` | User authentication, registration, password recovery, Google SSO |
| `/api/houses` | `routes/houses.js` | House management, membership, data export, house settings |
| `/api/houses` | `routes/rotation.js` | Role and chore rotation engine |
| `/api/users` | `routes/users.js` | User profile management, self-updates, admin user administration |
| `/api/expenses` | `routes/expenses.js` | Expense creation, approval/rejection, split calculations |
| `/api/invoices` | `routes/invoices.js` | Invoices generation, settlement, single/bulk payment requests |
| `/api/stats` | `routes/stats.js` | Balance calculations, admin dashboard metrics, user breakdown |
| `/api/analytics` | `routes/analytics.js` | Monthly spend aggregations, historical category trends |
| `/api/notes` | `routes/notes.js` | Shared house bulletin board and message replies |
| `/api/ai` | `routes/ai.js` | Groq AI LLM financial assistant and persistent chat histories |
| `/api/health` | `server.js` | Database connectivity & service health check |

---

## 5. Environment Variables Inventory

| Variable | Required | Description | Example Value |
| :--- | :--- | :--- | :--- |
| `PORT` | Optional | Port for local Node.js server (defaults to 5000) | `5000` |
| `NODE_ENV` | Optional | Runtime environment | `production` / `development` |
| `MONGODB_URI` | **Required** | MongoDB Atlas connection string | `mongodb+srv://user:pass@cluster.mongodb.net/budgetly` |
| `JWT_SECRET` | **Required** | Secret key for signing and verifying JWT tokens | `super-secret-jwt-key` |
| `CLIENT_URL` | Optional | Frontend application URL for CORS and password reset links | `http://localhost:5173` |
| `GOOGLE_CLIENT_ID` | Optional | Google OAuth 2.0 Client ID for Google SSO ID token verification | `5788...apps.googleusercontent.com` |
| `GROQ_API_KEY` | Optional | API key for Groq Cloud LLM completion API (`openai/gpt-oss-20b`) | `gsk_...` |
| `EMAIL_USERNAME` | Optional | Gmail or SMTP username for transactional emails | `budgetly@gmail.com` |
| `EMAIL_PASSWORD` | Optional | Gmail App Password or SMTP password | `xxxx xxxx xxxx xxxx` |
| `SENDER_EMAIL` | Optional | Verified sender email address | `no-reply@budgetly.app` |
| `SMTP_HOST` | Optional | Custom SMTP Host (Priority 1 if defined) | `smtp.mailgun.org` |
| `SMTP_PORT` | Optional | Custom SMTP Port (e.g. 587 or 465) | `587` |
| `SMTP_EMAIL` | Optional | Custom SMTP Auth Email | `postmaster@domain.com` |
| `SMTP_PASSWORD` | Optional | Custom SMTP Auth Password | `smtp-secret-password` |
