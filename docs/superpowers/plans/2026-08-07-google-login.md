# Google Sign-In Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add "Login with Google" to Budgetly's login and register pages using Google Identity Services (client-side ID token, verified server-side), reusing the existing JWT session.

**Architecture:** The client loads Google's GIS script, renders the official Google button, and sends the returned ID token to a new `POST /api/auth/google` endpoint. The server verifies the token with `google-auth-library`, resolves/links/creates the user via a new pure service (`googleAuthService.js`), and issues the same 30-day JWT shape as `login` — so the existing `AuthContext` session flow works unchanged.

**Tech Stack:** Node 20+ / Express 5 (ESM), Mongoose, `node --test` (server), React 19 / Vite 7 (client, no test framework — verified manually + `npm run lint`).

**Spec:** `docs/superpowers/specs/2026-08-07-google-login-design.md`

**Important schema constraint discovered during planning:** `User.username` is `required: true` and `unique` — Google users have no username, so the service derives one from the email local part (with a collision fallback). `User.password` becomes optional for Google-only accounts. `User.name` is required and always present in Google payloads.

---

### Task 1: User model — optional password + googleId

**Files:**
- Modify: `server/models/User.js:19-22`

- [ ] **Step 1: Make `password` optional and add `googleId`**

In `server/models/User.js`, replace lines 19-22:

```javascript
    password: {
      type: String,
      required: false,
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
```

- [ ] **Step 2: Verify existing tests still pass**

Run (from repo root): `cd server; npm test`
Expected: 4 existing test files pass (`statsService`, `roleRotationService`, `roleRotationController`, `invoiceController.bulkApprove`).

- [ ] **Step 3: Commit**

```bash
git add server/models/User.js
git commit -m "feat(auth): allow users without password, add googleId field"
```

---

### Task 2: `googleAuthService` — resolve/link/create Google user (TDD)

**Files:**
- Create: `server/services/googleAuthService.js`
- Test: `server/test/googleAuthService.test.js`

- [ ] **Step 1: Write the failing tests**

Create `server/test/googleAuthService.test.js`:

```javascript
import test from "node:test";
import assert from "node:assert/strict";

import { resolveGoogleUser } from "../services/googleAuthService.js";

const payload = {
  sub: "google-123",
  email: "omar@example.com",
  name: "Omar",
  picture: "https://pic.example/omar.jpg",
};

test("returns the existing user when googleId matches", async () => {
  const existing = { _id: "u1", email: payload.email };
  const User = {
    findOne: async (q) => (q.googleId === payload.sub ? existing : null),
    create: async () => {
      throw new Error("should not create");
    },
  };

  const user = await resolveGoogleUser(payload, User);
  assert.equal(user, existing);
});

test("links googleId to an existing password account by email", async () => {
  const existing = {
    _id: "u1",
    email: payload.email,
    name: "Omar",
    profilePicture: null,
    saveCalls: 0,
    async save() {
      this.saveCalls += 1;
    },
  };
  const User = {
    findOne: async (q) => (q.email === payload.email ? existing : null),
    create: async () => {
      throw new Error("should not create");
    },
  };

  const user = await resolveGoogleUser(payload, User);
  assert.equal(user, existing);
  assert.equal(user.googleId, payload.sub);
  assert.equal(user.profilePicture, payload.picture);
  assert.equal(user.saveCalls, 1);
});

test("keeps existing name when linking (only fills empty fields)", async () => {
  const existing = {
    _id: "u1",
    email: payload.email,
    name: "Name Already Set",
    profilePicture: "https://old-pic",
    async save() {},
  };
  const User = {
    findOne: async (q) => (q.email === payload.email ? existing : null),
    create: async () => {
      throw new Error("should not create");
    },
  };

  const user = await resolveGoogleUser(payload, User);
  assert.equal(user.name, "Name Already Set");
  assert.equal(user.profilePicture, "https://old-pic");
});

test("creates a new user without password when nothing matches", async () => {
  const created = [];
  const User = {
    findOne: async () => null,
    create: async (doc) => {
      created.push(doc);
      return { ...doc, _id: "u-new" };
    },
  };

  const user = await resolveGoogleUser(payload, User);
  assert.equal(user._id, "u-new");
  assert.equal(user.email, payload.email);
  assert.equal(user.name, payload.name);
  assert.equal(user.googleId, payload.sub);
  assert.equal(user.profilePicture, payload.picture);
  assert.equal(user.username, "omar");
  assert.equal(user.password, undefined);
  assert.equal(created.length, 1);
});

test("appends a random suffix when the derived username is taken", async () => {
  const User = {
    findOne: async (q) => (q.username === "omar" ? { username: "omar" } : null),
    create: async (doc) => doc,
  };

  const user = await resolveGoogleUser(payload, User);
  assert.ok(user.username.startsWith("omar"));
  assert.notEqual(user.username, "omar");
});

test("falls back to 'user' when the email local part is empty or invalid", async () => {
  const User = {
    findOne: async () => null,
    create: async (doc) => doc,
  };

  const user = await resolveGoogleUser(
    { ...payload, email: "@example.com" },
    User,
  );
  assert.equal(user.username, "user");
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd server; npm test`
Expected: FAIL — `Cannot find module '../services/googleAuthService.js'`

- [ ] **Step 3: Implement the service**

Create `server/services/googleAuthService.js`:

```javascript
export async function resolveGoogleUser(payload, User) {
  const { sub, email, name, picture } = payload;

  const byGoogleId = await User.findOne({ googleId: sub });
  if (byGoogleId) return byGoogleId;

  const byEmail = await User.findOne({ email });
  if (byEmail) {
    byEmail.googleId = sub;
    if (!byEmail.name) byEmail.name = name;
    if (!byEmail.profilePicture) byEmail.profilePicture = picture;
    await byEmail.save();
    return byEmail;
  }

  return User.create({
    email,
    name,
    googleId: sub,
    profilePicture: picture,
    username: await generateUsername(email, User),
  });
}

async function generateUsername(email, User) {
  let base = email.split("@")[0].toLowerCase().replace(/[^a-z0-9_.]/g, "");
  if (!base) base = "user";
  if (!(await User.findOne({ username: base }))) return base;
  for (let i = 0; i < 5; i++) {
    const candidate = `${base}${Math.random().toString(36).slice(2, 6)}`;
    if (!(await User.findOne({ username: candidate }))) return candidate;
  }
  return `${base}${Date.now().toString(36)}`;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd server; npm test`
Expected: all 10 tests pass (6 new + 4 existing).

- [ ] **Step 5: Commit**

```bash
git add server/services/googleAuthService.js server/test/googleAuthService.test.js
git commit -m "feat(auth): google user resolve/link/create service"
```

---

### Task 3: `googleLogin` controller + route (TDD)

**Files:**
- Modify: `server/controllers/authController.js`
- Modify: `server/routes/auth.js`
- Test: `server/test/authController.google.test.js`
- New dependency: `google-auth-library`

- [ ] **Step 1: Install the dependency**

Run: `cd server; npm install google-auth-library`

- [ ] **Step 2: Write the failing tests**

Create `server/test/authController.google.test.js`:

```javascript
process.env.JWT_SECRET = "test-secret";
process.env.GOOGLE_CLIENT_ID = "test-client-id";

import test from "node:test";
import assert from "node:assert/strict";

import { OAuth2Client } from "google-auth-library";
import { googleLogin } from "../controllers/authController.js";
import User from "../models/User.js";

const originalVerify = OAuth2Client.prototype.verifyIdToken;
const originalFindOne = User.findOne;
const originalCreate = User.create;

const createRes = () => {
  const res = {
    statusCode: 200,
    body: undefined,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };
  return res;
};

test.afterEach(() => {
  OAuth2Client.prototype.verifyIdToken = originalVerify;
  User.findOne = originalFindOne;
  User.create = originalCreate;
});

test("returns 401 when the ID token is invalid or expired", async () => {
  OAuth2Client.prototype.verifyIdToken = async () => {
    throw new Error("Invalid token");
  };

  const res = createRes();
  await googleLogin({ body: { idToken: "bad-token" } }, res);

  assert.equal(res.statusCode, 401);
});

test("returns 401 when the Google email is unverified", async () => {
  OAuth2Client.prototype.verifyIdToken = async () => ({
    getPayload: () => ({ email_verified: false }),
  });

  const res = createRes();
  await googleLogin({ body: { idToken: "unverified" } }, res);

  assert.equal(res.statusCode, 401);
  assert.equal(res.body.message, "البريد الإلكتروني غير مؤكد");
});

test("returns 400 when idToken is missing", async () => {
  const res = createRes();
  await googleLogin({ body: {} }, res);

  assert.equal(res.statusCode, 400);
});

test("returns 200 with a token and user on success", async () => {
  OAuth2Client.prototype.verifyIdToken = async () => ({
    getPayload: () => ({
      sub: "g1",
      email: "x@example.com",
      email_verified: true,
      name: "X",
      picture: null,
    }),
  });
  User.findOne = async () => null;
  User.create = async (doc) => ({
    _id: "u1",
    username: doc.username,
    name: doc.name,
    email: doc.email,
    role: "user",
    house: null,
    profilePicture: null,
    isActive: true,
    createdAt: new Date(),
  });

  const res = createRes();
  await googleLogin({ body: { idToken: "valid" } }, res);

  assert.equal(res.statusCode, 200);
  assert.ok(res.body.token);
  assert.equal(res.body.user.email, "x@example.com");
  assert.equal(res.body.user.username, "x");
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `cd server; npm test`
Expected: FAIL — import of `googleLogin` from `authController.js` fails (`SyntaxError: The requested module ... does not provide an export named 'googleLogin'`).

- [ ] **Step 4: Implement the controller and route**

In `server/controllers/authController.js`, add to the imports at the top (after line 5, `import sendEmail from "../utils/sendEmail.js";`):

```javascript
import { OAuth2Client } from "google-auth-library";
import { resolveGoogleUser } from "../services/googleAuthService.js";
```

Append this function at the end of the file (after `updateProfile`, line 319):

```javascript
// Google login (ID token from Google Identity Services)
export const googleLogin = async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ message: "معرّف جوجل مطلوب" });
    }

    const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    if (!payload.email_verified) {
      return res.status(401).json({ message: "البريد الإلكتروني غير مؤكد" });
    }

    const user = await resolveGoogleUser(payload, User);

    if (!user.isActive) {
      return res.status(401).json({ message: "الحساب غير نشط" });
    }

    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "30d" },
    );

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role,
        house: user.house,
        profilePicture: user.profilePicture,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Google login error:", error);
    res.status(401).json({ message: "فشل تسجيل الدخول عبر جوجل" });
  }
};
```

In `server/routes/auth.js`, add `googleLogin` to the import (line 3-9 block):

```javascript
import {
  register,
  login,
  googleLogin,
  getCurrentUser,
  forgotPassword,
  resetPassword,
} from "../controllers/authController.js";
```

And add the route after line 17 (`router.post("/login", login);`):

```javascript
// Google login
router.post("/google", googleLogin);
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `cd server; npm test`
Expected: all 14 tests pass (4 new + 10 previous).

- [ ] **Step 6: Commit**

```bash
git add server/controllers/authController.js server/routes/auth.js server/test/authController.google.test.js server/package.json server/package-lock.json
git commit -m "feat(auth): google login endpoint with ID token verification"
```

---

### Task 4: Server env var + setup docs

**Files:**
- Modify: `server/.env` (add line — gitignored, not committed)
- Modify: `server/ENV_SETUP.md`

- [ ] **Step 1: Add the env var**

Append to `server/.env`:

```
GOOGLE_CLIENT_ID=
```

- [ ] **Step 2: Document it**

Append a section to `server/ENV_SETUP.md`:

```markdown
## Google Sign-In (Login with Google)

Add to `server/.env`:

```
GOOGLE_CLIENT_ID=<your-google-oauth-client-id>
```

And to `client/.env` (same value — client ID is public by design):

```
VITE_GOOGLE_CLIENT_ID=<your-google-oauth-client-id>
```

### Google Cloud Console setup

1. Go to https://console.cloud.google.com and create/select a project.
2. **APIs & Services → OAuth consent screen** → External → add your account as a test user (or publish the app).
3. **APIs & Services → Credentials → Create credentials → OAuth client ID → Web application**.
4. Add **Authorized JavaScript origins** (no redirect URIs needed for this flow):
   - `http://localhost:5173`
   - `https://budgetly-frontend.vercel.app`
5. Copy the Client ID into both env files above, then restart both dev servers.
```

- [ ] **Step 3: Commit**

```bash
git add server/ENV_SETUP.md
git commit -m "docs: google sign-in env vars and console setup"
```

---

### Task 5: Client — `loginWithGoogle` in AuthContext

**Files:**
- Modify: `client/src/shared/context/AuthContext.jsx`

- [ ] **Step 1: Add `loginWithGoogle`**

In `client/src/shared/context/AuthContext.jsx`, add after the `login` function (line 47):

```jsx
  const loginWithGoogle = async (idToken) => {
    const { data } = await api.post("/auth/google", { idToken });
    localStorage.setItem("token", data.token);
    setUser(data.user);
    return data.user;
  };
```

Add `loginWithGoogle,` to the context value object (line 96-107 block, after `login,`).

- [ ] **Step 2: Verify**

Run: `cd client; npm run lint`
Expected: no errors.

Manual (requires server running): not yet exerciseable — the button is added in Task 6/7. Skip manual check here.

- [ ] **Step 3: Commit**

```bash
git add client/src/shared/context/AuthContext.jsx
git commit -m "feat(auth): loginWithGoogle session handler in AuthContext"
```

---

### Task 6: Client — `useGoogleSignIn` hook + `GoogleSignInButton` component

**Files:**
- Create: `client/src/modules/auth/hooks/useGoogleSignIn.js`
- Create: `client/src/modules/auth/components/GoogleSignInButton.jsx`
- Modify: `client/src/modules/auth/hooks/index.js`
- Modify: `client/src/modules/auth/components/index.js`

- [ ] **Step 1: Write the hook**

Create `client/src/modules/auth/hooks/useGoogleSignIn.js`:

```jsx
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../shared/context/AuthContext";
import { useToast } from "../../../shared/context/ToastContext";

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const SCRIPT_URL = "https://accounts.google.com/gsi/client";

export function useGoogleSignIn() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const buttonRef = useRef(null);
  const handlerRef = useRef();
  const { loginWithGoogle } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  handlerRef.current = async (response) => {
    if (!response?.credential) return;
    setLoading(true);
    setError("");
    try {
      await loginWithGoogle(response.credential);
      toast.success("أهلاً بيك!");
      navigate("/");
    } catch (err) {
      const message =
        err.response?.data?.message || "فشل تسجيل الدخول عبر جوجل";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!CLIENT_ID) return;

    const render = () => {
      if (
        !window.google?.accounts?.id ||
        !buttonRef.current ||
        buttonRef.current.dataset.gsiRendered
      ) {
        return;
      }
      buttonRef.current.dataset.gsiRendered = "true";
      google.accounts.id.initialize({
        client_id: CLIENT_ID,
        callback: (resp) => handlerRef.current(resp),
      });
      google.accounts.id.renderButton(buttonRef.current, {
        theme: "outline",
        size: "large",
        shape: "pill",
        locale: "ar",
        width: 320,
      });
    };

    if (window.google?.accounts?.id) {
      render();
      return;
    }

    const script = document.createElement("script");
    script.src = SCRIPT_URL;
    script.async = true;
    script.defer = true;
    script.onload = render;
    document.head.appendChild(script);
  }, []);

  return { buttonRef, error, loading };
}
```

- [ ] **Step 2: Write the component**

Create `client/src/modules/auth/components/GoogleSignInButton.jsx`:

```jsx
import { useGoogleSignIn } from "../hooks";

export default function GoogleSignInButton() {
  const { buttonRef, error, loading } = useGoogleSignIn();

  if (!import.meta.env.VITE_GOOGLE_CLIENT_ID) return null;

  return (
    <>
      <div className="flex items-center gap-3 my-4" aria-hidden="true">
        <div className="flex-1 h-px bg-ios-border" />
        <span className="text-sm text-ios-secondary">أو</span>
        <div className="flex-1 h-px bg-ios-border" />
      </div>

      {error && (
        <p className="text-sm text-ios-error text-center mb-3" role="alert">
          {error}
        </p>
      )}

      <div
        ref={buttonRef}
        className={`flex justify-center ${
          loading ? "opacity-60 pointer-events-none" : ""
        }`}
        aria-label="تسجيل الدخول عبر جوجل"
      />
    </>
  );
}
```

- [ ] **Step 3: Export from barrels**

`client/src/modules/auth/components/index.js` — add:

```javascript
export { default as GoogleSignInButton } from "./GoogleSignInButton";
```

`client/src/modules/auth/hooks/index.js` — add:

```javascript
export { useGoogleSignIn } from "./useGoogleSignIn";
```

- [ ] **Step 4: Verify**

Run: `cd client; npm run lint`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add client/src/modules/auth/hooks/useGoogleSignIn.js client/src/modules/auth/components/GoogleSignInButton.jsx client/src/modules/auth/hooks/index.js client/src/modules/auth/components/index.js
git commit -m "feat(auth): google sign-in hook and button component"
```

---

### Task 7: Client — wire the button into Login and Register pages

**Files:**
- Modify: `client/src/modules/auth/pages/LoginPage.jsx`
- Modify: `client/src/modules/auth/pages/RegisterPage.jsx`

- [ ] **Step 1: LoginPage**

In `client/src/modules/auth/pages/LoginPage.jsx`:
- Change line 4 (`import { AuthCard } from "../components";`) to:

```jsx
import { AuthCard, GoogleSignInButton } from "../components";
```

- Insert `<GoogleSignInButton />` after the closing `</form>` (line 80), before `</AuthCard>`:

```jsx
      </form>
      <GoogleSignInButton />
    </AuthCard>
```

- [ ] **Step 2: RegisterPage**

In `client/src/modules/auth/pages/RegisterPage.jsx`:
- Change line 4 (`import { AuthCard } from "../components";`) to:

```jsx
import { AuthCard, GoogleSignInButton } from "../components";
```

- Insert `<GoogleSignInButton />` after the closing `</form>` (line 118), before `</AuthCard>`:

```jsx
      </form>
      <GoogleSignInButton />
    </AuthCard>
```

- [ ] **Step 3: Verify**

Run: `cd client; npm run lint`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add client/src/modules/auth/pages/LoginPage.jsx client/src/modules/auth/pages/RegisterPage.jsx
git commit -m "feat(auth): show google sign-in button on login and register pages"
```

---

### Task 8: Client env var + final verification

**Files:**
- Modify: `client/.env` (add line — gitignored, not committed)

- [ ] **Step 1: Add the env var**

Append to `client/.env`:

```
VITE_GOOGLE_CLIENT_ID=
```

Until a real Client ID is pasted here, `GoogleSignInButton` renders nothing (both hook and component guard on the env var) — safe default.

- [ ] **Step 2: Full test + lint + manual smoke**

Run: `cd server; npm test`
Expected: all 14 tests pass.

Run: `cd client; npm run lint`
Expected: no errors.

Manual smoke (requires the user to have pasted a real Client ID into both `.env` files per Task 4/8):
1. `npm run dev` from repo root.
2. Open `http://localhost:5173/login` → Google button visible with "أو" divider.
3. Sign in with a test Google account → toast "أهلاً بيك!" → redirected to `/` (then `/house-selection` if no house).
4. Log out, sign in again with the same Google account → links to existing googleId, no duplicate.
5. On `/register` → button visible, works the same.
6. Cancel the Google popup → no state change, no error.
7. Sign in with a Google account whose email already has a password account → logs into that account (verify by logging out and using the old password login — same account).

- [ ] **Step 3: Commit (if any tracked changes)**

```bash
git add -u
git commit -m "chore: finalize google sign-in wiring"
```

(If nothing is tracked — `.env` files are gitignored — skip this commit.)

---

## Self-Review Notes

- **Spec coverage:** env vars + console docs (Task 4, 8) ✓ · button on both pages (Task 7) ✓ · link-or-create logic (Task 2) ✓ · token verification + same JWT shape (Task 3) ✓ · AuthContext untouched flow (Task 5) ✓ · verification (Task 8) ✓.
- **Deliberate simplifications:** username derivation (schema requires it, Google doesn't provide one) — `ponytail:` random-suffix fallback; last-resort `Date.now` collision branch is effectively unreachable. Controller test patches `OAuth2Client.prototype.verifyIdToken` (same monkey-patch style as existing controller tests, avoids ESM import-hoisting issues with module-scope env reads).
