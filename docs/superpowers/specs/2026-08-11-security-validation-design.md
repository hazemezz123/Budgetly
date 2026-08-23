# Security & Validation Suite Design Spec

## Overview
Implement strict Zod schema validation across all Budgetly server API routes and transition JWT authentication to HTTP-only SameSite cookies with a Bearer header fallback mechanism.

## Architecture & Scope
- **Target Backend Components**:
  - Packages: `zod`, `cookie-parser`
  - Middleware: `server/middleware/validate.js`, `server/middleware/auth.js`
  - Validators: `server/validators/authValidators.js`, `server/validators/expenseValidators.js`, `server/validators/houseValidators.js`, `server/validators/noteValidators.js`
  - Controllers: `server/controllers/authController.js`, `server/controllers/houseController.js`
  - Server: `server/server.js`
- **Target Frontend Components**:
  - API Utility: `client/src/utils/api.js`
  - Context: `client/src/shared/context/AuthContext.jsx`

## Detailed Changes

### 1. Dependencies & Server Config
- Install `zod` and `cookie-parser` in `server/package.json`.
- In `server/server.js`:
  - Mount `cookieParser()`.
  - Enable `credentials: true` in CORS options.

### 2. Input Validation (`server/middleware/validate.js` & `server/validators/`)
- **Validation Middleware (`validate(schemas)`)**:
  - Parses `req.body`, `req.query`, and `req.params`.
  - On failure, returns `400 Bad Request` with `{ message: "Validation error", errors: [...] }`.
- **Schemas**:
  - `authValidators`:
    - `registerSchema`: `username` (min 3), `password` (min 6), `name` (min 2), `email` (optional email).
    - `loginSchema`: `username` (required), `password` (required).
  - `expenseValidators`:
    - `createExpenseSchema`: `title` (non-empty), `totalAmount` (> 0), `category` (non-empty), `splitType` (`equal` | `specific` | `custom`), `splits` (array of `{ user, amount }`), `payer` (optional ObjectId).
  - `houseValidators`:
    - `createHouseSchema`: `name` (min 3), `password` (min 4).
    - `joinHouseSchema`: `password` (required).
  - `noteValidators`:
    - `createNoteSchema`: `content` (non-empty).

### 3. Authentication Cookie Strategy (`server/middleware/auth.js` & `authController.js`)
- **`auth.js`**:
  - Check `req.cookies?.token` first, fallback to `req.header("Authorization")?.replace("Bearer ", "")`.
- **Cookie helper**:
  - Set `res.cookie("token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", maxAge: 7 * 24 * 60 * 60 * 1000 })` on register, login, google-auth, and create-house endpoints.
- **Logout Endpoint (`POST /api/auth/logout`)**:
  - Invokes `res.clearCookie("token")` and returns `{ message: "Logged out successfully" }`.
- **Client (`client/src/utils/api.js`)**:
  - Set `withCredentials: true` on Axios instance.

## Verification Strategy
- Run `npm test` in `server/` to verify all unit/integration tests pass.
- Verify node server starts cleanly with Zod validation and cookie middleware active.
