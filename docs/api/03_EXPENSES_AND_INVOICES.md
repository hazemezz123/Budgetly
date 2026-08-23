# Expenses & Invoices API

Expenses and Invoices constitute the financial core of Budgetly. When an expense is approved, individual invoices are automatically generated for each participant based on the selected split type (`equal`, `specific`, `custom`). Settling invoices triggers payment requests that require admin confirmation.

---

## Part 1: Expenses API (`routes/expenses.js`)

### Expense Status Lifecycle
- `pending`: Created by regular members; awaiting house admin review. No invoices are generated yet.
- `approved`: Approved by admin (or created directly by admin). Automatically triggers invoice creation for each split share.
- `rejected`: Rejected by admin.

---

### GET `/api/expenses`
- **Description**: Returns paginated expenses for the authenticated user's house, sorted by date descending.
- **Auth Required**: Yes (Bearer Token / Cookie)
- **Headers**:
  - `Authorization: Bearer <token>`
- **Query Parameters**:
  - `page` (optional, default `1`): Current page number.
  - `limit` (optional, default `10`): Items per page.
  - `status` (optional, default `approved`): Filter by `approved`, `pending`, or `rejected`.
  - `createdBy` (optional): Filter by creator's User ID.
- **Success Response (`200 OK`)**:
  ```json
  {
    "expenses": [
      {
        "_id": "6531f8a8b1234567890abcde",
        "title": "Supermarket Groceries",
        "description": "Weekly grocery haul from Carrefour",
        "category": "Food",
        "status": "approved",
        "totalAmount": 1200,
        "splitType": "equal",
        "splits": [
          {
            "user": {
              "_id": "651f8a8b1234567890abcdef",
              "name": "Ahmed Ezzat",
              "username": "ahmed99"
            },
            "amount": 600
          },
          {
            "user": {
              "_id": "6521a00f1122334455667788",
              "name": "Mahmoud Hassan",
              "username": "mahmoud_h"
            },
            "amount": 600
          }
        ],
        "createdBy": {
          "_id": "651f8a8b1234567890abcdef",
          "name": "Ahmed Ezzat",
          "username": "ahmed99"
        },
        "paidBy": {
          "_id": "651f8a8b1234567890abcdef",
          "name": "Ahmed Ezzat",
          "username": "ahmed99"
        },
        "house": "6520b12a9876543210fedcba",
        "date": "2026-08-20T10:00:00.000Z",
        "createdAt": "2026-08-20T10:00:00.000Z"
      }
    ],
    "currentPage": 1,
    "totalPages": 3,
    "totalExpenses": 25
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: User not associated with a house.
  - `401 Unauthorized`: Missing or invalid token.

---

### POST `/api/expenses`
- **Description**: Creates a new expense.
  - If created by an **Admin**: status defaults to `approved` and invoices are instantly created for all splits (the payer's invoice is marked `paid`, others `pending`).
  - If created by a **Regular Member**: status defaults to `pending` (no invoices created until admin approves).
- **Auth Required**: Yes (Bearer Token / Cookie)
- **Headers**:
  - `Content-Type: application/json`
  - `Authorization: Bearer <token>`
- **Validation Rules (Zod)**:
  - `title`: String, min 1 char.
  - `description`: String (optional).
  - `category`: String, min 1 char.
  - `totalAmount`: Positive number (> 0).
  - `splitType`: Enum `["equal", "specific", "custom"]`.
  - `selectedUsers`: Array of User IDs (required for `specific` split).
  - `customSplits`: Array of `{ user: string, amount: number }` (required for `custom` split).
  - `payer`: User ID string (optional, admin only).
- **Request Body (Example: Equal Split)**:
  ```json
  {
    "title": "Internet Bill",
    "description": "Monthly fiber 100Mbps",
    "category": "Bills",
    "totalAmount": 600,
    "splitType": "equal",
    "payer": "651f8a8b1234567890abcdef"
  }
  ```
- **Request Body (Example: Custom Split)**:
  ```json
  {
    "title": "Dinner Order",
    "description": "Pizza Party",
    "category": "Food",
    "totalAmount": 500,
    "splitType": "custom",
    "customSplits": [
      { "user": "651f8a8b1234567890abcdef", "amount": 300 },
      { "user": "6521a00f1122334455667788", "amount": 200 }
    ]
  }
  ```
- **Success Response (`201 Created`)**:
  ```json
  {
    "_id": "6531f8a8b1234567890abcde",
    "title": "Internet Bill",
    "description": "Monthly fiber 100Mbps",
    "category": "Bills",
    "totalAmount": 600,
    "splitType": "equal",
    "status": "approved",
    "splits": [
      {
        "user": {
          "_id": "651f8a8b1234567890abcdef",
          "name": "Ahmed Ezzat",
          "username": "ahmed99"
        },
        "amount": 300
      },
      {
        "user": {
          "_id": "6521a00f1122334455667788",
          "name": "Mahmoud Hassan",
          "username": "mahmoud_h"
        },
        "amount": 300
      }
    ],
    "createdBy": {
      "_id": "651f8a8b1234567890abcdef",
      "name": "Ahmed Ezzat",
      "username": "ahmed99"
    },
    "paidBy": "651f8a8b1234567890abcdef",
    "house": "6520b12a9876543210fedcba",
    "date": "2026-08-20T10:00:00.000Z"
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: Validation failure or splits sum != totalAmount (tolerance 0.01).
  - `401 Unauthorized`: Token missing.

---

### PUT `/api/expenses/:id`
- **Description**: Updates an existing pending expense and recalculates splits. Admin only. (Approved expenses cannot be edited).
- **Auth Required**: Yes (Admin only)
- **Headers**:
  - `Content-Type: application/json`
  - `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "title": "Adjusted Electricity Bill",
    "category": "Bills",
    "totalAmount": 900,
    "splitType": "equal"
  }
  ```
- **Success Response (`200 OK`)**:
  ```json
  {
    "_id": "6531f8a8b1234567890abcde",
    "title": "Adjusted Electricity Bill",
    "totalAmount": 900,
    "status": "pending",
    "splits": [...]
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: Cannot update non-pending expense (`"Only pending expenses can be updated"`).
  - `403 Forbidden`: Admin role required.
  - `404 Not Found`: Expense not found.

---

### PUT `/api/expenses/:id/approve`
- **Description**: Approves a pending expense and automatically generates corresponding `Invoice` records for all split users. Admin only.
- **Auth Required**: Yes (Admin only)
- **Headers**:
  - `Authorization: Bearer <token>`
- **Request Body / Query Params**: None
- **Success Response (`200 OK`)**:
  ```json
  {
    "message": "Expense approved and invoices created",
    "expense": {
      "_id": "6531f8a8b1234567890abcde",
      "status": "approved",
      "title": "Supermarket Groceries"
    }
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: Expense is not in `pending` state.
  - `403 Forbidden`: Admin role required.
  - `404 Not Found`: Expense not found.

---

### PUT `/api/expenses/:id/reject`
- **Description**: Rejects a pending expense request. Admin only.
- **Auth Required**: Yes (Admin only)
- **Headers**:
  - `Authorization: Bearer <token>`
- **Request Body / Query Params**: None
- **Success Response (`200 OK`)**:
  ```json
  {
    "message": "Expense rejected",
    "expense": {
      "_id": "6531f8a8b1234567890abcde",
      "status": "rejected"
    }
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: Expense is not in `pending` state.
  - `403 Forbidden`: Admin role required.
  - `404 Not Found`: Expense not found.

---

### DELETE `/api/expenses/:id/my-request`
- **Description**: Allows a regular member to cancel and delete their own pending expense request before it is reviewed by the admin.
- **Auth Required**: Yes (Bearer Token / Cookie)
- **Headers**:
  - `Authorization: Bearer <token>`
- **Success Response (`200 OK`)**:
  ```json
  {
    "message": "Request deleted successfully"
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: Expense is already approved or rejected.
  - `403 Forbidden`: Not authorized (user is not the creator).
  - `404 Not Found`: Expense request not found.

---

### DELETE `/api/expenses/:id`
- **Description**: Cascade deletes an expense along with all linked invoices and payment requests. Admin only.
- **Auth Required**: Yes (Admin only)
- **Headers**:
  - `Authorization: Bearer <token>`
- **Success Response (`200 OK`)**:
  ```json
  {
    "message": "Expense and related invoices deleted"
  }
  ```
- **Error Responses**:
  - `403 Forbidden`: Admin role required.
  - `404 Not Found`: Expense not found.

---

## Part 2: Invoices API (`routes/invoices.js`)

### Invoice Status Lifecycle
- `pending`: Unpaid invoice owed by user.
- `awaiting_approval`: User submitted a payment request for this invoice.
- `paid`: House admin approved the payment request.

---

### GET `/api/invoices/my-invoices`
- **Description**: Returns all invoices belonging to the authenticated user within their current house.
- **Auth Required**: Yes (Bearer Token / Cookie)
- **Headers**:
  - `Authorization: Bearer <token>`
- **Success Response (`200 OK`)**:
  ```json
  [
    {
      "_id": "653201010101010101010101",
      "user": "6521a00f1122334455667788",
      "expense": {
        "_id": "6531f8a8b1234567890abcde",
        "description": "Supermarket Groceries",
        "category": "Food",
        "date": "2026-08-20T10:00:00.000Z",
        "createdBy": "651f8a8b1234567890abcdef"
      },
      "amount": 600,
      "description": "Supermarket Groceries",
      "status": "pending",
      "paymentRequest": null,
      "house": "6520b12a9876543210fedcba",
      "createdAt": "2026-08-20T10:00:00.000Z"
    }
  ]
  ```
- **Error Responses**:
  - `400 Bad Request`: User not in a house.
  - `401 Unauthorized`: Token missing.

---

### GET `/api/invoices/all`
- **Description**: Returns all invoices across all members of the house, including nested payment request info and recording user details. Admin only.
- **Auth Required**: Yes (Admin only)
- **Headers**:
  - `Authorization: Bearer <token>`
- **Success Response (`200 OK`)**:
  ```json
  [
    {
      "_id": "653201010101010101010101",
      "user": {
        "_id": "6521a00f1122334455667788",
        "name": "Mahmoud Hassan",
        "username": "mahmoud_h"
      },
      "expense": {
        "_id": "6531f8a8b1234567890abcde",
        "description": "Supermarket Groceries",
        "category": "Food",
        "date": "2026-08-20T10:00:00.000Z"
      },
      "amount": 600,
      "description": "Supermarket Groceries",
      "status": "awaiting_approval",
      "paymentRequest": {
        "_id": "653300000000000000000000",
        "amount": 600,
        "status": "pending",
        "recordedBy": {
          "_id": "6521a00f1122334455667788",
          "name": "Mahmoud Hassan"
        }
      },
      "createdAt": "2026-08-20T10:00:00.000Z"
    }
  ]
  ```
- **Error Responses**:
  - `403 Forbidden`: Admin role required.

---

### POST `/api/invoices/:id/pay`
- **Description**: Submits a payment request for a single pending invoice. Creates a pending `Payment` transaction record and updates the invoice status to `awaiting_approval`.
- **Auth Required**: Yes (Bearer Token / Cookie)
- **Headers**:
  - `Authorization: Bearer <token>`
- **Request Body / Query Params**: None
- **Success Response (`200 OK`)**:
  ```json
  {
    "_id": "653201010101010101010101",
    "user": "6521a00f1122334455667788",
    "amount": 600,
    "description": "Supermarket Groceries",
    "status": "awaiting_approval",
    "paymentRequest": "653300000000000000000000"
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: Invoice not pending or payment request already submitted.
  - `403 Forbidden`: User does not own this invoice or belongs to another house.
  - `404 Not Found`: Invoice not found.

---

### POST `/api/invoices/bulk-pay`
- **Description**: Submits payment requests in bulk for all `pending` invoices belonging to the authenticated user. Creates distinct `Payment` records for complete financial traceability.
- **Auth Required**: Yes (Bearer Token / Cookie)
- **Headers**:
  - `Authorization: Bearer <token>`
- **Request Body / Query Params**: None
- **Success Response (`200 OK`)**:
  ```json
  {
    "message": "Successfully submitted payment requests for 3 invoices",
    "count": 3,
    "invoices": [
      {
        "_id": "653201010101010101010101",
        "status": "awaiting_approval",
        "paymentRequest": "653300000000000000000001"
      },
      {
        "_id": "653201010101010101010102",
        "status": "awaiting_approval",
        "paymentRequest": "653300000000000000000002"
      }
    ]
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: No pending invoices found.
  - `401 Unauthorized`: Authentication missing.

---

### PUT `/api/invoices/:id/approve`
- **Description**: Approves an invoice payment. Marks the associated `Payment` record as `approved`, sets `approvedBy` to the admin's ID, and transitions the invoice status to `paid`. Admin only.
- **Auth Required**: Yes (Admin only)
- **Headers**:
  - `Authorization: Bearer <token>`
- **Success Response (`200 OK`)**:
  ```json
  {
    "_id": "653201010101010101010101",
    "status": "paid",
    "amount": 600,
    "paymentRequest": "653300000000000000000000"
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: Invoice is not awaiting approval.
  - `403 Forbidden`: Requester is not admin or from a different house.
  - `404 Not Found`: Invoice or payment record not found.

---

### PUT `/api/invoices/users/:userId/approve-all`
- **Description**: Bulk approves all invoices in `awaiting_approval` status for a specific user in the house. Sets all corresponding `Payment` records to `approved` and invoices to `paid`. Admin only.
- **Auth Required**: Yes (Admin only)
- **Headers**:
  - `Authorization: Bearer <token>`
- **URL Parameters**:
  - `userId`: Target user's MongoDB ObjectId.
- **Success Response (`200 OK`)**:
  ```json
  {
    "message": "Approved 4 invoices successfully",
    "count": 4
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: Invalid user ID format or no eligible invoices found.
  - `403 Forbidden`: Target user does not belong to admin's house.
  - `404 Not Found`: Target user or payment records missing.

---

### PUT `/api/invoices/:id/reject`
- **Description**: Rejects an invoice payment submission. Marks the `Payment` as `rejected` with an optional reason, resets the invoice status back to `pending`, and unlinks `paymentRequest` so the member can resubmit. Admin only.
- **Auth Required**: Yes (Admin only)
- **Headers**:
  - `Content-Type: application/json`
  - `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "reason": "Bank transfer screenshot was blurry"
  }
  ```
- **Success Response (`200 OK`)**:
  ```json
  {
    "_id": "653201010101010101010101",
    "status": "pending",
    "paymentRequest": null
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: Invoice is not awaiting approval.
  - `403 Forbidden`: Admin role required.
  - `404 Not Found`: Invoice not found.
