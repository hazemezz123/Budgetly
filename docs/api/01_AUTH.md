# Authentication API (`/api/auth`)

The Authentication module manages user onboarding, session tokens (via JWT and HTTP cookies), Google OAuth SSO integration, password reset life cycle via transactional email, and active profile verification.

---

### POST `/api/auth/register`
- **Description**: Registers a new user account in Budgetly. Generates a signed JWT valid for 30 days and sets an HTTP-only authentication cookie (`token`).
- **Auth Required**: No
- **Headers**:
  - `Content-Type: application/json`
- **Validation Rules (Zod)**:
  - `username`: String, min 3 characters (unique).
  - `password`: String, min 6 characters.
  - `name`: String, min 2 characters.
  - `email`: Optional valid email string or empty string (unique if provided).
- **Request Body**:
  ```json
  {
    "username": "ahmed99",
    "password": "Password123",
    "name": "Ahmed Ezzat",
    "email": "ahmed@example.com"
  }
  ```
- **Success Response (`201 Created`)**:
  - *Cookies Set*: `token=<jwt>; HttpOnly; SameSite=Lax; Max-Age=604800` (7 days)
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "651f8a8b1234567890abcdef",
      "username": "ahmed99",
      "name": "Ahmed Ezzat",
      "email": "ahmed@example.com",
      "role": "user",
      "house": null,
      "profilePicture": null,
      "createdAt": "2026-08-20T10:00:00.000Z"
    }
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: Validation failure (e.g. username < 3 chars, invalid email) or entity conflict (`"Username already exists"` / `"Email already exists"`).
    ```json
    {
      "message": "Username already exists"
    }
    ```
  - `500 Internal Server Error`: Internal database error.

---

### POST `/api/auth/login`
- **Description**: Authenticates an existing user using username and password. Validates credentials, confirms account active status, sets HTTP-only auth cookie, and populates associated house details.
- **Auth Required**: No
- **Headers**:
  - `Content-Type: application/json`
- **Validation Rules (Zod)**:
  - `username`: String, min 1 character.
  - `password`: String, min 1 character.
- **Request Body**:
  ```json
  {
    "username": "ahmed99",
    "password": "Password123"
  }
  ```
- **Success Response (`200 OK`)**:
  - *Cookies Set*: `token=<jwt>; HttpOnly; SameSite=Lax; Max-Age=604800`
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "651f8a8b1234567890abcdef",
      "username": "ahmed99",
      "name": "Ahmed Ezzat",
      "email": "ahmed@example.com",
      "role": "admin",
      "house": {
        "_id": "6520b12a9876543210fedcba",
        "name": "Villa 104",
        "admin": "651f8a8b1234567890abcdef",
        "members": [
          "651f8a8b1234567890abcdef",
          "6521a00f1122334455667788"
        ]
      },
      "profilePicture": "https://avatar.iran.liara.run/public/1",
      "createdAt": "2026-08-20T10:00:00.000Z"
    }
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: Validation failure.
  - `401 Unauthorized`: Invalid credentials, inactive account, or attempting password login on a Google-only passwordless account (`"Invalid credentials"` or `"Account is inactive"`).
    ```json
    {
      "message": "Invalid credentials"
    }
    ```
  - `500 Internal Server Error`: Server error during authentication.

---

### POST `/api/auth/google`
- **Description**: Authenticates or signs up a user using a Google Identity Services ID token. Verifies ID token signature and audience against `GOOGLE_CLIENT_ID`, links existing Google ID or matching email, or generates an auto-incrementing username for new users.
- **Auth Required**: No
- **Headers**:
  - `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "idToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjEyMyJ9..."
  }
  ```
- **Success Response (`200 OK`)**:
  - *Cookies Set*: `token=<jwt>; HttpOnly; SameSite=Lax; Max-Age=604800`
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "651f8a8b1234567890abcdef",
      "username": "ahmed.ezz",
      "name": "Ahmed Ezzat",
      "email": "ahmed@gmail.com",
      "role": "user",
      "house": null,
      "profilePicture": "https://lh3.googleusercontent.com/a/...",
      "createdAt": "2026-08-20T10:00:00.000Z"
    }
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: Missing ID token (`"معرّف جوجل مطلوب"`).
  - `401 Unauthorized`: Token verification failed, unverified Google email (`"البريد الإلكتروني غير مؤكد"`), or inactive user account (`"الحساب غير نشط"`).
  - `500 Internal Server Error`: Internal Google Auth or Database error.

---

### GET `/api/auth/me`
- **Description**: Returns fresh profile and house information for the currently authenticated user.
- **Auth Required**: Yes (Bearer Token / Cookie)
- **Headers**:
  - `Authorization: Bearer <token>`
- **Request Body / Query Params**: None
- **Success Response (`200 OK`)**:
  ```json
  {
    "id": "651f8a8b1234567890abcdef",
    "username": "ahmed99",
    "name": "Ahmed Ezzat",
    "email": "ahmed@example.com",
    "role": "admin",
    "house": {
      "_id": "6520b12a9876543210fedcba",
      "name": "Villa 104",
      "admin": "651f8a8b1234567890abcdef",
      "members": [
        "651f8a8b1234567890abcdef",
        "6521a00f1122334455667788"
      ]
    },
    "profilePicture": "https://avatar.iran.liara.run/public/1",
    "createdAt": "2026-08-20T10:00:00.000Z"
  }
  ```
- **Error Responses**:
  - `401 Unauthorized`: Missing or invalid token (`"No token provided"` or `"Invalid token"`).
  - `404 Not Found`: User no longer exists.

---

### POST `/api/auth/forgot-password`
- **Description**: Initiates password reset flow. Generates a secure random crypto token hashed with SHA-256 (expires in 10 minutes) and sends an HTML formatted reset email containing the client reset link.
- **Auth Required**: No
- **Headers**:
  - `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "email": "ahmed@example.com"
  }
  ```
- **Success Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "data": "Email sent"
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: Email field missing.
  - `404 Not Found`: Email not found (`"البريد الإلكتروني غير مسجل"`).
  - `500 Internal Server Error`: SMTP delivery failed (`"Email could not be sent"`).

---

### PUT `/api/auth/reset-password/:token`
- **Description**: Validates the SHA-256 hashed password reset token from the URL parameter, checks expiration against `Date.now()`, hashes the new password with bcrypt salt, and clears reset tokens.
- **Auth Required**: No
- **Headers**:
  - `Content-Type: application/json`
- **URL Parameters**:
  - `token`: Unhashed hex reset token received via email link.
- **Request Body**:
  ```json
  {
    "password": "NewSecretPassword123"
  }
  ```
- **Success Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "تم تغيير كلمة المرور بنجاح"
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: Invalid or expired reset token (`"الرابط غير صالح أو انتهت صلاحيته"`).
  - `500 Internal Server Error`: Server error while updating password.

---

### POST `/api/auth/logout`
- **Description**: Clears the authentication HTTP cookie (`token`) and terminates the client web session.
- **Auth Required**: No (Accessible by any client)
- **Headers**:
  - `Content-Type: application/json`
- **Request Body / Query Params**: None
- **Success Response (`200 OK`)**:
  - *Cookies Cleared*: `token`
  ```json
  {
    "message": "Logged out successfully"
  }
  ```
- **Error Responses**:
  - `500 Internal Server Error`: Unexpected error.
