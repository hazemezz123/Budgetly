# Google Sign-In Design

## Goal

Add "Login with Google" to the Budgetly web app as an alternative to password login/registration, using Google Identity Services (client-side ID token, verified server-side).

## Scope

### In Scope

- Google button on the `/login` and `/register` pages
- Google users can log in (auto-register on first login)
- Linking: a Google login with an email that already has a password account logs into that account and adds Google as an alternate sign-in method
- Same JWT session shape as password login, so the existing `AuthContext` works unchanged
- Document the Google Cloud Console setup steps and new env vars

### Out of Scope

- One-tap / automatic sign-in
- Unlinking Google from an account
- Multi-provider OAuth (GitHub, Facebook, etc.)
- Password reset for Google-only accounts (they have no password; not needed)

## Approach

Google Identity Services (GIS): the client loads Google's `gsi/client` script, the user signs in via Google's popup, and the client receives a JWT ID token. The client sends the token to `POST /api/auth/google`; the server verifies it with `google-auth-library` (`OAuth2Client.verifyIdToken` with `audience: GOOGLE_CLIENT_ID`) and issues the app's own JWT.

Chosen over server-side OAuth redirect because: no client secret on the server, no redirect URI registration, no CSRF state handling, and it reuses the existing token flow. Security is equivalent — the ID token is still verified server-side against Google's public keys.

## Data Model

`server/models/User.js`:

- `password`: `required` becomes optional (`required: false`) — Google-only accounts have no password
- New field `googleId`: `String`, `unique: true`, `sparse: true`
- Reuse existing `email` (unique + sparse), `name`, `profilePicture` fields

## Server

### Endpoint

`POST /api/auth/google` in `server/routes/auth.js` (public, like `/login`).

### Controller

New `googleLogin` in `server/controllers/authController.js`:

1. Extract `idToken` from request body
2. `OAuth2Client.verifyIdToken({ idToken, audience: process.env.GOOGLE_CLIENT_ID })` → `{ sub, email, email_verified, name, picture }`
3. Reject (401) if `email_verified` is false
4. Link logic:
   - User found by `googleId` → log in
   - Else user found by `email` (password account) → set `googleId`, fill `name`/`profilePicture` if empty → log in
   - Else create new user (`email`, `name`, `googleId`, `profilePicture`, no password) → log in
5. Issue the same 30-day JWT as `login`; return `{ token, user }`

Errors in Arabic, matching existing API message language.

### Env

- `GOOGLE_CLIENT_ID` in `server/.env`, documented in `server/ENV_SETUP.md`
- Public by design; the client ID is not a secret

## Client

### Component

New `GoogleSignInButton` in `client/src/modules/auth/components/`:

- Dynamically injects `<script src="https://accounts.google.com/gsi/client">` on mount
- `google.accounts.id.initialize({ client_id, callback })` + `renderButton`
- On credential: `POST /api/auth/google` with the ID token, then route through the existing `useAuth().login(token, user)` path and navigate to `/` — same as password login
- Loading and error states matching existing UI patterns; errors in Arabic

### Placement

Under the form, inside `AuthCard` children on both `LoginPage.jsx` and `RegisterPage.jsx`.

### Env

`VITE_GOOGLE_CLIENT_ID` in `client/.env` (same value as server's).

## Edge Cases

- Email already registered with password → linked, no duplicate account
- Invalid/expired/forged token → 401 (verification fails)
- Unverified Google email → 401
- Google-only user later tries password reset → no password set; out of scope
- Google user's email used for new password registration → unique-email constraint rejects it

## Verification

- One small test for the link-or-create logic (existing user by googleId / by email / new user)
- Manual smoke test with a test Google account: new user, existing-email linking, and wrong-account scenarios

## Google Cloud Console Setup (documented for the user)

1. Create/select a project in Google Cloud Console
2. OAuth consent screen: add the domain (localhost + Vercel domains)
3. Credentials → OAuth client ID → Web application
4. Copy Client ID into `server/.env` (`GOOGLE_CLIENT_ID`) and `client/.env` (`VITE_GOOGLE_CLIENT_ID`)
