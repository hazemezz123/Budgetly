# Security & Input Validation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement strict Zod schema validation across all Budgetly server API routes and transition JWT authentication to HTTP-only SameSite cookies with a Bearer header fallback mechanism.

**Architecture:** Install `zod` and `cookie-parser`. Create generic `validate` middleware and validators for auth, expenses, houses, and notes. Update `auth.js` middleware, `authController.js`, `server.js`, and `api.js` for cookie-based authentication.

**Tech Stack:** Node.js, Express, Zod, Cookie-Parser, JWT, Axios, Native Node Test Runner (`node --test`).

## Global Constraints
- Target Files: `server/package.json`, `server/server.js`, `server/middleware/*.js`, `server/validators/*.js`, `server/routes/*.js`, `client/src/utils/api.js`
- Preserve existing API response contracts and JSON formats.
- All tests (`npm test` in `server/`) must pass.

---

### Task 1: Install Dependencies and Set Up Validation Middleware & Schemas

**Files:**
- Modify: `server/package.json`
- Create: `server/middleware/validate.js`
- Create: `server/validators/authValidators.js`
- Create: `server/validators/expenseValidators.js`
- Create: `server/validators/houseValidators.js`
- Create: `server/validators/noteValidators.js`
- Create: `server/test/validation.test.js`

**Interfaces:**
- Consumes: Zod schema definitions
- Produces: `validate({ body, query, params })` middleware

- [ ] **Step 1: Install zod and cookie-parser in server**

Run: `npm install zod cookie-parser` in `server/`

- [ ] **Step 2: Create validate middleware**

Create `server/middleware/validate.js`:
```javascript
export const validate = (schemas) => (req, res, next) => {
  try {
    if (schemas.body) {
      req.body = schemas.body.parse(req.body);
    }
    if (schemas.query) {
      req.query = schemas.query.parse(req.query);
    }
    if (schemas.params) {
      req.params = schemas.params.parse(req.params);
    }
    next();
  } catch (error) {
    if (error.name === "ZodError") {
      const formattedErrors = error.errors.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      }));
      return res.status(400).json({
        message: formattedErrors[0]?.message || "Validation error",
        errors: formattedErrors,
      });
    }
    next(error);
  }
};
```

- [ ] **Step 3: Create Zod Validators**

Create `server/validators/authValidators.js`:
```javascript
import { z } from "zod";

export const registerSchema = z.object({
  username: z.string().min(3, "اسم المستخدم يجب أن يكون 3 حروف على الأقل"),
  password: z.string().min(6, "كلمة السر يجب أن تكون 6 حروف على الأقل"),
  name: z.string().min(2, "الاسم يجب أن يكون حرفين على الأقل"),
  email: z.string().email("البريد الإلكتروني غير صحيح").optional().or(z.literal("")),
});

export const loginSchema = z.object({
  username: z.string().min(1, "اسم المستخدم مطلوب"),
  password: z.string().min(1, "كلمة السر مطلوبة"),
});
```

Create `server/validators/expenseValidators.js`:
```javascript
import { z } from "zod";

export const createExpenseSchema = z.object({
  title: z.string().min(1, "عنوان المصروف مطلوب"),
  description: z.string().optional(),
  category: z.string().min(1, "القسم مطلوب"),
  totalAmount: z.number().positive("المبلغ يجب أن يكون أكبر من 0"),
  splitType: z.enum(["equal", "specific", "custom"]),
  splits: z
    .array(
      z.object({
        user: z.string(),
        amount: z.number().min(0),
      })
    )
    .optional(),
  selectedUsers: z.array(z.string()).optional(),
  customSplits: z
    .array(
      z.object({
        user: z.string(),
        amount: z.number().min(0),
      })
    )
    .optional(),
  payer: z.string().optional(),
});
```

Create `server/validators/houseValidators.js`:
```javascript
import { z } from "zod";

export const createHouseSchema = z.object({
  name: z.string().min(3, "اسم البيت يجب أن يكون 3 حروف على الأقل"),
  password: z.string().min(4, "كلمة سر البيت يجب أن تكون 4 حروف على الأقل"),
});

export const joinHouseSchema = z.object({
  password: z.string().min(1, "كلمة السر مطلوبة"),
});
```

Create `server/validators/noteValidators.js`:
```javascript
import { z } from "zod";

export const createNoteSchema = z.object({
  content: z.string().min(1, "محتوى الملاحظة مطلوب"),
});
```

- [ ] **Step 4: Create validation unit tests**

Create `server/test/validation.test.js` to test validation middleware behavior.

- [ ] **Step 5: Run tests**

Run: `npm test` in `server/`
Expected: PASS

- [ ] **Step 6: Commit**

Run: `git add server/ && git commit -m "feat(security): add Zod validation middleware and schemas"`

---

### Task 2: Attach Validation Middleware to API Routes

**Files:**
- Modify: `server/routes/auth.js`
- Modify: `server/routes/expenses.js`
- Modify: `server/routes/houses.js`
- Modify: `server/routes/notes.js`

**Interfaces:**
- Consumes: `validate` middleware & schemas
- Produces: Validated Express routes

- [ ] **Step 1: Mount validation on auth routes**

Update `server/routes/auth.js` to use `validate({ body: registerSchema })` and `validate({ body: loginSchema })`.

- [ ] **Step 2: Mount validation on expense routes**

Update `server/routes/expenses.js` to use `validate({ body: createExpenseSchema })`.

- [ ] **Step 3: Mount validation on house routes**

Update `server/routes/houses.js` to use `validate({ body: createHouseSchema })` and `joinHouseSchema`.

- [ ] **Step 4: Mount validation on note routes**

Update `server/routes/notes.js` to use `validate({ body: createNoteSchema })`.

- [ ] **Step 5: Run tests**

Run: `npm test` in `server/`
Expected: PASS

- [ ] **Step 6: Commit**

Run: `git add server/routes/ && git commit -m "feat(security): mount Zod validation middleware on auth, expense, house, and note routes"`

---

### Task 3: Implement HTTP-Only Cookie Authentication with Bearer Fallback

**Files:**
- Modify: `server/server.js`
- Modify: `server/middleware/auth.js`
- Modify: `server/controllers/authController.js`
- Modify: `server/routes/auth.js`
- Modify: `client/src/utils/api.js`

**Interfaces:**
- Consumes: `cookie-parser`, `res.cookie`
- Produces: Dual HTTP-only Cookie & Bearer JWT authentication

- [ ] **Step 1: Add cookie-parser and credentials to server.js**

Update `server/server.js`:
```javascript
import cookieParser from "cookie-parser";
// ...
app.use(cookieParser());
```

- [ ] **Step 2: Update auth.js to read cookie or bearer header**

Update `server/middleware/auth.js`:
```javascript
const token =
  req.cookies?.token ||
  req.header("Authorization")?.replace("Bearer ", "");
```

- [ ] **Step 3: Update authController.js to set auth cookies and add logout endpoint**

Add `setAuthCookie` helper in `authController.js`:
```javascript
export const setAuthCookie = (res, token) => {
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

export const logoutUser = async (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out successfully" });
};
```
Call `setAuthCookie(res, token)` on register, login, and google-auth.

- [ ] **Step 4: Add POST /api/auth/logout route**

Add `router.post("/logout", logoutUser)` to `server/routes/auth.js`.

- [ ] **Step 5: Update client API utility to send credentials**

Update `client/src/utils/api.js`:
```javascript
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});
```

- [ ] **Step 6: Run tests**

Run: `npm test` in `server/`
Expected: PASS

- [ ] **Step 7: Commit**

Run: `git add server/ client/src/utils/api.js && git commit -m "feat(security): implement HTTP-only cookie authentication with Bearer header fallback"`
