# Analytics & Stats API

The Analytics and Stats modules compute financial metrics, member balance snapshots, category trends, and admin overview dashboards using MongoDB aggregation pipelines and dedicated memory calculation services.

---

## Balance Calculation Formula

The balance service (`services/statsService.js`) calculates net balances using:
$$\text{Balance} = (\text{ExternalPaid} + \text{InternalSent}) - (\text{InvoicesAssigned} + \text{InternalReceived})$$

- **`externalPaid`**: Total amount of approved expenses paid upfront by this user (`paidBy` / `createdBy`).
- **`internalSent`**: Total amount of approved payment transactions sent by this user to settle invoices.
- **`invoicesAssigned`**: Total unpaid invoice amounts assigned to this user (`status !== "paid"`).
- **`internalReceived`**: Total approved repayments received by this user from housemates for expenses they paid upfront.
- **Interpretation**:
  - `Balance > 0`: House owes user money (user paid extra).
  - `Balance < 0`: User owes money to the house/payer.
  - `Balance == 0`: Fully settled.

---

## Part 1: Stats API (`routes/stats.js`)

### GET `/api/stats/balances`
- **Description**: Returns the real-time balance summary and lifetime paid/owed figures for every active member in the authenticated user's house.
- **Auth Required**: Yes (Bearer Token / Cookie)
- **Headers**:
  - `Authorization: Bearer <token>`
- **Request Body / Query Params**: None
- **Success Response (`200 OK`)**:
  ```json
  [
    {
      "userId": "651f8a8b1234567890abcdef",
      "username": "ahmed99",
      "name": "Ahmed Ezzat",
      "balance": 450,
      "totalPaid": 1200,
      "totalOwed": 0
    },
    {
      "userId": "6521a00f1122334455667788",
      "username": "mahmoud_h",
      "name": "Mahmoud Hassan",
      "balance": -450,
      "totalPaid": 0,
      "totalOwed": 450
    }
  ]
  ```
- **Error Responses**:
  - `400 Bad Request`: User is not in a house.
  - `401 Unauthorized`: Token missing or invalid.

---

### GET `/api/stats/user/:userId`
- **Description**: Returns detailed financial profile for a specific user in the house, including category spending breakdown, invoice count, and recent 5 expenses with the user's specific share.
- **Auth Required**: Yes (Bearer Token / Cookie)
- **Headers**:
  - `Authorization: Bearer <token>`
- **URL Parameters**:
  - `userId`: Target user's MongoDB ObjectId.
- **Success Response (`200 OK`)**:
  ```json
  {
    "balance": -450,
    "totalPaid": 300,
    "totalOwed": 450,
    "invoiceCount": 6,
    "categoryBreakdown": {
      "Food": 300,
      "Bills": 150,
      "Cleaning": 50
    },
    "recentExpenses": [
      {
        "_id": "6531f8a8b1234567890abcde",
        "title": "Supermarket Groceries",
        "category": "Food",
        "totalAmount": 1200,
        "splitType": "equal",
        "userShare": 600,
        "date": "2026-08-20T10:00:00.000Z"
      }
    ]
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: User not in a house.
  - `401 Unauthorized`: Authentication required.

---

### GET `/api/stats/admin/dashboard`
- **Description**: Compiles high-level house management metrics for the admin dashboard: total members, total expenses, outstanding unpaid invoices, total approved payments, admin's personal balance, lists of users owing vs. paid extra, and recent 10 invoices and payments.
- **Auth Required**: Yes (Bearer Token / Cookie)
- **Headers**:
  - `Authorization: Bearer <token>`
- **Success Response (`200 OK`)**:
  ```json
  {
    "overview": {
      "totalUsers": 4,
      "totalInvoices": 28,
      "totalPayments": 14,
      "totalInvoicesAmount": 14500,
      "totalPaymentsAmount": 12200,
      "totalExpenseAmount": 15000,
      "totalOwed": 2300,
      "adminBalance": 750
    },
    "categoryBreakdown": {
      "Food": 8200,
      "Bills": 4500,
      "Maintenance": 1800
    },
    "usersOwing": [
      {
        "userId": "6521a00f1122334455667788",
        "username": "mahmoud_h",
        "name": "Mahmoud Hassan",
        "balance": -450,
        "owes": 450
      }
    ],
    "usersPaidExtra": [
      {
        "userId": "651f8a8b1234567890abcdef",
        "username": "ahmed99",
        "name": "Ahmed Ezzat",
        "balance": 750,
        "extra": 750
      }
    ],
    "recentInvoices": [
      {
        "_id": "653201010101010101010101",
        "user": "6521a00f1122334455667788",
        "amount": 450,
        "status": "pending",
        "createdAt": "2026-08-20T10:00:00.000Z"
      }
    ],
    "recentPayments": [
      {
        "_id": "653300000000000000000000",
        "user": "6521a00f1122334455667788",
        "amount": 300,
        "status": "approved",
        "createdAt": "2026-08-19T15:30:00.000Z"
      }
    ]
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: User not in a house.
  - `401 Unauthorized`: Token invalid.

---

## Part 2: Analytics API (`routes/analytics.js`)

### GET `/api/analytics/monthly`
- **Description**: Aggregates personal monthly spending and payments across all time using MongoDB aggregation pipelines (`$unwind` on splits and `$dateToString` month grouping).
- **Auth Required**: Yes (Bearer Token / Cookie)
- **Headers**:
  - `Authorization: Bearer <token>`
- **Request Body / Query Params**: None
- **Success Response (`200 OK`)**:
  ```json
  {
    "monthlyExpenses": {
      "2026-08": {
        "total": 1250,
        "categories": {
          "Food": 850,
          "Bills": 400
        },
        "count": 5
      },
      "2026-07": {
        "total": 1600,
        "categories": {
          "Food": 1100,
          "Maintenance": 500
        },
        "count": 7
      }
    },
    "monthlyPayments": {
      "2026-08": {
        "total": 1250,
        "count": 4
      },
      "2026-07": {
        "total": 1600,
        "count": 7
      }
    },
    "categoryBreakdown": {
      "Food": {
        "amount": 1950,
        "percentage": "68.4"
      },
      "Bills": {
        "amount": 400,
        "percentage": "14.0"
      },
      "Maintenance": {
        "amount": 500,
        "percentage": "17.5"
      }
    },
    "summary": {
      "totalExpenses": 2850,
      "totalPayments": 2850,
      "avgMonthlyExpense": "1425.00",
      "monthsTracked": 2,
      "totalTransactions": 12
    }
  }
  ```
- **Error Responses**:
  - `401 Unauthorized`: Token missing.
  - `500 Internal Server Error`: Aggregation error.

---

### GET `/api/analytics/trends`
- **Description**: Returns category-by-category monthly expenditure trends over a trailing window (defaults to last 6 months) for chart visualization.
- **Auth Required**: Yes (Bearer Token / Cookie)
- **Headers**:
  - `Authorization: Bearer <token>`
- **Query Parameters**:
  - `months` (optional, default `6`): Number of historical months to include.
- **Success Response (`200 OK`)**:
  ```json
  {
    "trends": {
      "2026-03": {
        "Food": 750,
        "Bills": 300
      },
      "2026-04": {
        "Food": 820,
        "Bills": 300,
        "Entertainment": 150
      },
      "2026-05": {
        "Food": 900,
        "Bills": 350
      },
      "2026-06": {
        "Food": 680,
        "Bills": 300
      },
      "2026-07": {
        "Food": 1100,
        "Maintenance": 500
      },
      "2026-08": {
        "Food": 850,
        "Bills": 400
      }
    }
  }
  ```
- **Error Responses**:
  - `401 Unauthorized`: Authentication required.
  - `500 Internal Server Error`: Aggregation error.
