# Users & System Health API

This document covers user profile administration, self-service profile mutations, and serverless/database operational health endpoints.

---

## Part 1: Users API (`routes/users.js`)

### GET `/api/users`
- **Description**: Returns all active users who belong to the same house as the authenticated requester. Passwords excluded.
- **Auth Required**: Yes (Bearer Token / Cookie)
- **Headers**:
  - `Authorization: Bearer <token>`
- **Request Body / Query Params**: None
- **Success Response (`200 OK`)**:
  ```json
  [
    {
      "_id": "651f8a8b1234567890abcdef",
      "username": "ahmed99",
      "name": "Ahmed Ezzat",
      "email": "ahmed@example.com",
      "role": "admin",
      "isActive": true,
      "profilePicture": "https://avatar.iran.liara.run/public/1",
      "house": "6520b12a9876543210fedcba",
      "createdAt": "2026-08-20T10:00:00.000Z"
    },
    {
      "_id": "6521a00f1122334455667788",
      "username": "mahmoud_h",
      "name": "Mahmoud Hassan",
      "email": "mahmoud@example.com",
      "role": "user",
      "isActive": true,
      "profilePicture": null,
      "house": "6520b12a9876543210fedcba",
      "createdAt": "2026-08-20T10:30:00.000Z"
    }
  ]
  ```
- **Error Responses**:
  - `400 Bad Request`: User not in a house.
  - `401 Unauthorized`: Token missing or invalid.

---

### GET `/api/users/:id`
- **Description**: Retrieves a single user's public profile by their ID.
- **Auth Required**: Yes (Bearer Token / Cookie)
- **Headers**:
  - `Authorization: Bearer <token>`
- **URL Parameters**:
  - `id`: Target User ID.
- **Success Response (`200 OK`)**:
  ```json
  {
    "_id": "6521a00f1122334455667788",
    "username": "mahmoud_h",
    "name": "Mahmoud Hassan",
    "email": "mahmoud@example.com",
    "role": "user",
    "isActive": true,
    "profilePicture": null,
    "house": "6520b12a9876543210fedcba",
    "createdAt": "2026-08-20T10:30:00.000Z"
  }
  ```
- **Error Responses**:
  - `401 Unauthorized`: Token missing.
  - `404 Not Found`: User not found.

---

### POST `/api/users`
- **Description**: Creates a new user record directly. Admin only.
- **Auth Required**: Yes (Admin only)
- **Headers**:
  - `Content-Type: application/json`
  - `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "username": "karim_s",
    "password": "TemporaryPassword123",
    "name": "Karim Saeed"
  }
  ```
- **Success Response (`201 Created`)**:
  ```json
  {
    "id": "6522bbbb0000111122223333",
    "username": "karim_s",
    "name": "Karim Saeed",
    "role": "user"
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: Username already taken.
  - `403 Forbidden`: Admin role required.

---

### PUT `/api/users/:id`
- **Description**: Updates user details (e.g. name or password). Admin only.
- **Auth Required**: Yes (Admin only)
- **Headers**:
  - `Content-Type: application/json`
  - `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "name": "Karim S. Mahmoud",
    "password": "UpdatedPassword456"
  }
  ```
- **Success Response (`200 OK`)**:
  ```json
  {
    "_id": "6522bbbb0000111122223333",
    "username": "karim_s",
    "name": "Karim S. Mahmoud",
    "role": "user",
    "isActive": true
  }
  ```
- **Error Responses**:
  - `403 Forbidden`: Admin role required.
  - `404 Not Found`: User not found.

---

### DELETE `/api/users/:id`
- **Description**: Soft-deactivates a user (`isActive: false`), preventing them from logging in or generating new expenses. Admin only.
- **Auth Required**: Yes (Admin only)
- **Headers**:
  - `Authorization: Bearer <token>`
- **Success Response (`200 OK`)**:
  ```json
  {
    "message": "User deactivated",
    "user": {
      "_id": "6522bbbb0000111122223333",
      "username": "karim_s",
      "isActive": false
    }
  }
  ```
- **Error Responses**:
  - `403 Forbidden`: Admin role required.
  - `404 Not Found`: User not found.

---

### PATCH `/api/users/me/profile-picture`
- **Description**: Updates the avatar picture URL for the authenticated user.
- **Auth Required**: Yes (Bearer Token / Cookie)
- **Headers**:
  - `Content-Type: application/json`
  - `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "profilePicture": "https://avatar.iran.liara.run/public/boy?username=ahmed"
  }
  ```
- **Success Response (`200 OK`)**:
  ```json
  {
    "_id": "651f8a8b1234567890abcdef",
    "username": "ahmed99",
    "name": "Ahmed Ezzat",
    "profilePicture": "https://avatar.iran.liara.run/public/boy?username=ahmed"
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: `profilePicture` field missing.
  - `401 Unauthorized`: Token missing.

---

### PATCH `/api/users/me/username`
- **Description**: Updates the username for the authenticated user. Enforces uniqueness across the entire system.
- **Auth Required**: Yes (Bearer Token / Cookie)
- **Headers**:
  - `Content-Type: application/json`
  - `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "username": "ahmed_ezz_2026"
  }
  ```
- **Success Response (`200 OK`)**:
  ```json
  {
    "_id": "651f8a8b1234567890abcdef",
    "username": "ahmed_ezz_2026",
    "name": "Ahmed Ezzat"
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: Username empty or already registered (`"اليوزرنيم ده موجود عند حد تاني"`).
  - `401 Unauthorized`: Token missing.

---

### PATCH `/api/users/me/name`
- **Description**: Updates the full display name for the authenticated user.
- **Auth Required**: Yes (Bearer Token / Cookie)
- **Headers**:
  - `Content-Type: application/json`
  - `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "name": "Eng. Ahmed Ezzat"
  }
  ```
- **Success Response (`200 OK`)**:
  ```json
  {
    "_id": "651f8a8b1234567890abcdef",
    "username": "ahmed_ezz_2026",
    "name": "Eng. Ahmed Ezzat"
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: Name cannot be blank (`"الاسم مينفعش يكون فاضي"`).
  - `401 Unauthorized`: Token missing.

---

### PATCH `/api/users/me/profile`
- **Description**: Updates the email and/or name for the authenticated user. Validates uniqueness of email.
- **Auth Required**: Yes (Bearer Token / Cookie)
- **Headers**:
  - `Content-Type: application/json`
  - `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "name": "Eng. Ahmed Ezzat",
    "email": "ahmed.new@example.com"
  }
  ```
- **Success Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "user": {
      "id": "651f8a8b1234567890abcdef",
      "username": "ahmed_ezz_2026",
      "name": "Eng. Ahmed Ezzat",
      "email": "ahmed.new@example.com",
      "role": "admin",
      "house": "6520b12a9876543210fedcba",
      "profilePicture": "https://avatar.iran.liara.run/public/boy?username=ahmed"
    },
    "message": "تم تحديث البيانات بنجاح"
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: Email already in use by another user (`"البريد الإلكتروني مستخدم بالفعل"`).
  - `401 Unauthorized`: Token missing.

---

## Part 2: System Health & Root Endpoints

### GET `/api/health`
- **Description**: Real-time service health check. Checks MongoDB connection state (`0: disconnected`, `1: connected`, `2: connecting`, `3: disconnecting`) and presence of `MONGODB_URI`. Does not trigger or block on database connection initialization.
- **Auth Required**: No
- **Headers**: None
- **Request Body / Query Params**: None
- **Success Response (`200 OK`)**:
  ```json
  {
    "ok": true,
    "service": "budgetly-api",
    "db": {
      "state": "connected",
      "stateCode": 1,
      "hasMongoUri": true
    },
    "timestamp": "2026-08-20T12:00:00.000Z"
  }
  ```
- **Unhealthy Response (`503 Service Unavailable`)**:
  ```json
  {
    "ok": false,
    "service": "budgetly-api",
    "db": {
      "state": "disconnected",
      "stateCode": 0,
      "hasMongoUri": true
    },
    "timestamp": "2026-08-20T12:00:00.000Z"
  }
  ```

---

### GET `/`
- **Description**: Root server health check and welcome message.
- **Auth Required**: No
- **Headers**: None
- **Request Body / Query Params**: None
- **Success Response (`200 OK`)**:
  ```json
  {
    "message": "Expense Tracker API is running! 🚀"
  }
  ```
