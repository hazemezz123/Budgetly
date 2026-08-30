# Server Environment Setup Guide

To enable the password reset functionality, you can use either **Gmail** OR a **Custom SMTP Service** (like ServerSMTP, SMTP2GO, SendGrid, etc.).

## Option 1: Custom SMTP (Recommended for `serversmtp.com`)

If you are using a service like **ServerSMTP**, **SendGrid**, or **Mailgun**, add these lines to your `server/.env` file:

```env
# SMTP Configuration
SMTP_HOST=mail.your-smtp-provider.com  # e.g., mail.serversmtp.com
SMTP_PORT=587                          # Usually 587 or 465 or 2525
SMTP_EMAIL=your-smtp-username          # Username provided by the service
SMTP_PASSWORD=your-smtp-password       # Password provided by the service

# Important: The email address you want to appear as the sender
# (Required if your SMTP username is NOT a valid email address)
SENDER_EMAIL=your-verified-sender@yourdomain.com

CLIENT_URL=http://localhost:5173
```

> **Note:** If you use this method, you do **NOT** need `EMAIL_USERNAME` or `EMAIL_PASSWORD`.

## Option 2: Gmail (Development)

If you prefer to use a personal **Gmail** account:

```env
EMAIL_USERNAME=your-email@gmail.com
EMAIL_PASSWORD=your-app-password       # Generated App Password
CLIENT_URL=http://localhost:5173
```

- **How to generate Gmail App Password:**
  1. Go to **Google Account** > **Security** > **2-Step Verification**.
  2. Search for **App passwords**.
  3. Create one named "Budgetly" and use the 16-character code.

## 3. No Email (Local Testing)

If no variables are set, emails will be logged to the **server console**.

## Google Sign-In (Login with Google)

Add to `server/.env`:

```env
GOOGLE_CLIENT_ID=<your-google-oauth-client-id>
```

And to `client/.env` (same value — client ID is public by design):

```env
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

## Push Notifications (Browser Web Push)

Budgetly uses [VAPID (Voluntary Application Server Identification)](https://datatracker.ietf.org/doc/html/rfc8292) so admins receive push notifications on their device when a member submits a new pending expense for review.

### Option 1: Generate keys with a small Node script (Recommended)

```bash
cd server
node -e "import('web-push').then(w=>{const k=w.generateVAPIDKeys();console.log('VAPID_PUBLIC_KEY='+k.publicKey);console.log('VAPID_PRIVATE_KEY='+k.privateKey);})"
```

Copy the two output lines into `server/.env`:

```env
# Push Notifications (VAPID) — keep keys secret, they identify YOUR server
VAPID_PUBLIC_KEY=<long-base64url-public-key>
VAPID_PRIVATE_KEY=<long-base64url-private-key>

# Optional — required by the Web Push standard (email or HTTPS URL of project owner)
VAPID_SUBJECT=mailto:your-email@example.com
```

### Option 2: Auto-generated (development only)

If you skip these variables, the server generates disposable VAPID keys on every restart. Notifications will work temporarily, but each time you restart the server, every user's device will need to unsubscribe and re-subscribe because the public key changes. **For production, always add explicit VAPID keys to server/.env.**

## Environment variable cheat sheet

```env
# Required core
MONGODB_URI=mongodb://localhost:27017/budgetly
JWT_SECRET=<random-long-string>
PORT=5000

# Auth
GOOGLE_CLIENT_ID=<optional-google-oauth-client-id>

# Email (optional)
EMAIL_USERNAME=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
# — or custom SMTP:
SMTP_HOST=mail.example.com
SMTP_PORT=587
SMTP_EMAIL=user
SMTP_PASSWORD=pass
SENDER_EMAIL=you@example.com

# Push notifications (optional but highly recommended)
VAPID_PUBLIC_KEY=<base64url>
VAPID_PRIVATE_KEY=<base64url>
VAPID_SUBJECT=mailto:you@example.com

CLIENT_URL=http://localhost:5173
```
