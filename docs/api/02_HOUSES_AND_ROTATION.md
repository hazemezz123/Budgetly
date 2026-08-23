# Houses & Role Rotation API (`/api/houses`)

Houses represent shared living environments (apartments, villas, dorms) where multiple users manage common expenses and responsibilities. The house admin has elevated privileges over membership, data purging, exports, and rotating chores/roles.

---

## Part 1: House Management (`routes/houses.js`)

### GET `/api/houses`
- **Description**: Returns all public houses with their admin info and member count. Passwords are stripped.
- **Auth Required**: No
- **Headers**:
  - `Content-Type: application/json`
- **Request Body / Query Params**: None
- **Success Response (`200 OK`)**:
  ```json
  [
    {
      "_id": "6520b12a9876543210fedcba",
      "name": "Villa 104",
      "admin": {
        "_id": "651f8a8b1234567890abcdef",
        "name": "Ahmed Ezzat",
        "username": "ahmed99"
      },
      "memberCount": 4,
      "createdAt": "2026-08-20T10:00:00.000Z"
    }
  ]
  ```
- **Error Responses**:
  - `500 Internal Server Error`: Database error.

---

### GET `/api/houses/:id`
- **Description**: Retrieves full details of a specific house, including populated admin and member list with avatar URLs. Excludes the hashed house password.
- **Auth Required**: Yes (Bearer Token / Cookie)
- **Headers**:
  - `Authorization: Bearer <token>`
- **Request Body / Query Params**: None
- **Success Response (`200 OK`)**:
  ```json
  {
    "_id": "6520b12a9876543210fedcba",
    "name": "Villa 104",
    "houseId": "VILLA-104-CAI",
    "admin": {
      "_id": "651f8a8b1234567890abcdef",
      "name": "Ahmed Ezzat",
      "username": "ahmed99",
      "profilePicture": "https://avatar.iran.liara.run/public/1"
    },
    "members": [
      {
        "_id": "651f8a8b1234567890abcdef",
        "name": "Ahmed Ezzat",
        "username": "ahmed99",
        "profilePicture": "https://avatar.iran.liara.run/public/1"
      },
      {
        "_id": "6521a00f1122334455667788",
        "name": "Mahmoud Hassan",
        "username": "mahmoud_h",
        "profilePicture": null
      }
    ],
    "roleRotation": {
      "enabled": true,
      "participants": ["651f8a8b1234567890abcdef", "6521a00f1122334455667788"],
      "roles": [{ "name": "Dishes", "count": 1 }, { "name": "Groceries", "count": 1 }],
      "cycleIndex": 1,
      "currentCycle": {
        "cycleNumber": 1,
        "startedAt": "2026-08-20",
        "assignments": [
          { "slotIndex": 0, "roleName": "Dishes", "participant": "651f8a8b1234567890abcdef" },
          { "slotIndex": 1, "roleName": "Groceries", "participant": "6521a00f1122334455667788" }
        ]
      },
      "history": []
    },
    "createdAt": "2026-08-20T10:00:00.000Z",
    "updatedAt": "2026-08-20T12:00:00.000Z"
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: Invalid MongoDB ObjectId format.
  - `401 Unauthorized`: Missing or invalid token.
  - `404 Not Found`: House not found.

---

### POST `/api/houses`
- **Description**: Creates a new shared house. The creator automatically becomes the house `admin`. If the creator previously belonged to another house, they are removed from it. Generates an updated JWT reflecting the `admin` role.
- **Auth Required**: Yes (Bearer Token / Cookie)
- **Headers**:
  - `Content-Type: application/json`
  - `Authorization: Bearer <token>`
- **Validation Rules (Zod)**:
  - `name`: String, min 3 characters.
  - `password`: String, min 4 characters.
- **Request Body**:
  ```json
  {
    "name": "Villa 104",
    "password": "HouseSecret123"
  }
  ```
- **Success Response (`201 Created`)**:
  ```json
  {
    "house": {
      "_id": "6520b12a9876543210fedcba",
      "name": "Villa 104",
      "admin": {
        "_id": "651f8a8b1234567890abcdef",
        "name": "Ahmed Ezzat",
        "username": "ahmed99",
        "profilePicture": null
      },
      "members": [
        {
          "_id": "651f8a8b1234567890abcdef",
          "name": "Ahmed Ezzat",
          "username": "ahmed99",
          "profilePicture": null
        }
      ],
      "roleRotation": {
        "enabled": false,
        "participants": [],
        "roles": [],
        "cycleIndex": 0,
        "currentCycle": null,
        "history": []
      },
      "createdAt": "2026-08-20T10:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: Validation failure or house name already taken (`"House name already exists"`).
  - `401 Unauthorized`: Token missing or invalid.

---

### POST `/api/houses/:id/join`
- **Description**: Joins an existing house by verifying the house password against its bcrypt hash. Automatically removes the user from their prior house if any, adds them to `members`, and assigns role `"user"`.
- **Auth Required**: Yes (Bearer Token / Cookie)
- **Headers**:
  - `Content-Type: application/json`
  - `Authorization: Bearer <token>`
- **Validation Rules (Zod)**:
  - `password`: String, min 1 character.
- **Request Body**:
  ```json
  {
    "password": "HouseSecret123"
  }
  ```
- **Success Response (`200 OK`)**:
  ```json
  {
    "_id": "6520b12a9876543210fedcba",
    "name": "Villa 104",
    "admin": {
      "_id": "651f8a8b1234567890abcdef",
      "name": "Ahmed Ezzat",
      "username": "ahmed99",
      "profilePicture": null
    },
    "members": [
      {
        "_id": "651f8a8b1234567890abcdef",
        "name": "Ahmed Ezzat",
        "username": "ahmed99"
      },
      {
        "_id": "6521a00f1122334455667788",
        "name": "Mahmoud Hassan",
        "username": "mahmoud_h"
      }
    ]
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: Invalid house ID or missing password.
  - `401 Unauthorized`: Authentication required.
  - `403 Forbidden`: Incorrect house password (`"Incorrect password"`).
  - `404 Not Found`: House or user not found.

---

### PATCH `/api/houses/:id/name`
- **Description**: Updates the house display name. Admin only.
- **Auth Required**: Yes (Bearer Token / Cookie)
- **Headers**:
  - `Content-Type: application/json`
  - `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "name": "Palm Hills Villa 22"
  }
  ```
- **Success Response (`200 OK`)**:
  ```json
  {
    "_id": "6520b12a9876543210fedcba",
    "name": "Palm Hills Villa 22",
    "admin": {
      "_id": "651f8a8b1234567890abcdef",
      "name": "Ahmed Ezzat",
      "username": "ahmed99"
    },
    "members": [...]
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: Name missing or name already exists in another house.
  - `403 Forbidden`: Requester is not the admin of this house.
  - `404 Not Found`: House not found.

---

### PATCH `/api/houses/:id/houseId`
- **Description**: Updates the unique custom identifier (`houseId`) of the house. Admin only.
- **Auth Required**: Yes (Bearer Token / Cookie)
- **Headers**:
  - `Content-Type: application/json`
  - `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "houseId": "PALM-HILLS-22"
  }
  ```
- **Success Response (`200 OK`)**:
  ```json
  {
    "_id": "6520b12a9876543210fedcba",
    "name": "Palm Hills Villa 22",
    "houseId": "PALM-HILLS-22",
    "admin": { ... },
    "members": [ ... ]
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: `houseId` missing or already exists.
  - `403 Forbidden`: Not the house admin.
  - `404 Not Found`: House not found.

---

### PATCH `/api/houses/:id/password`
- **Description**: Modifies the join password of the house. Re-hashes the password using bcrypt. Admin only.
- **Auth Required**: Yes (Bearer Token / Cookie)
- **Headers**:
  - `Content-Type: application/json`
  - `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "password": "NewHousePassword456"
  }
  ```
- **Success Response (`200 OK`)**:
  ```json
  {
    "message": "Password updated successfully"
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: Password shorter than 4 characters.
  - `403 Forbidden`: Requester is not the house admin.

---

### POST `/api/houses/:id/leave`
- **Description**: Allows a user to leave their current house. If the house admin leaves:
  - If other members remain, admin role transfers automatically to the first remaining member.
  - If the leaving admin was the last member, the house is permanently deleted.
- **Auth Required**: Yes (Bearer Token / Cookie)
- **Headers**:
  - `Authorization: Bearer <token>`
- **Request Body / Query Params**: None
- **Success Response (`200 OK`)**:
  ```json
  {
    "message": "Successfully left the house"
  }
  ```
  *(Or if last member)*:
  ```json
  {
    "message": "House deleted (you were the last member)"
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: User is not a member of this house.
  - `404 Not Found`: House not found.

---

### DELETE `/api/houses/:id/members/:memberId`
- **Description**: Removes a member from the house. Resets user's `house` to `null` and `role` to `"user"`. Cannot remove the house admin. Admin only.
- **Auth Required**: Yes (Bearer Token / Cookie)
- **Headers**:
  - `Authorization: Bearer <token>`
- **Success Response (`200 OK`)**:
  ```json
  {
    "message": "Member removed successfully"
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: Attempting to remove the house admin (`"Cannot remove house admin"`).
  - `403 Forbidden`: Requester is not the house admin.
  - `404 Not Found`: House or member not found in house.

---

### DELETE `/api/houses/:id/clear-data`
- **Description**: Performs a hard purge of all transaction records (expenses, invoices, payment requests) scoped to this house. Admin only.
- **Auth Required**: Yes (Bearer Token / Cookie)
- **Headers**:
  - `Authorization: Bearer <token>`
- **Request Body / Query Params**: None
- **Success Response (`200 OK`)**:
  ```json
  {
    "message": "All house data cleared successfully",
    "deleted": {
      "expenses": 18,
      "invoices": 42,
      "payments": 12
    }
  }
  ```
- **Error Responses**:
  - `403 Forbidden`: Requester is not the house admin.
  - `404 Not Found`: House not found.

---

### GET `/api/houses/:id/export/:type`
- **Description**: Exports house financial data formatted as a downloadable UTF-8 CSV with BOM (compatible with Excel Arabic encoding). Admin only.
- **Auth Required**: Yes (Bearer Token / Cookie)
- **Headers**:
  - `Authorization: Bearer <token>`
- **URL Parameters**:
  - `type`: `expenses` | `invoices`
- **Success Response (`200 OK`)**:
  - **Headers**:
    - `Content-Type: text/csv; charset=utf-8`
    - `Content-Disposition: attachment; filename=expenses_<houseId>_<timestamp>.csv`
  - **Body Content (CSV format)**:
    ```csv
    التاريخ,الوصف,الفئة,المبلغ الإجمالي,نوع التقسيم,الحالة,أُنشئ بواسطة,دُفع بواسطة,التقسيمات
    "2026-08-19","Groceries Carrefour","Food",1200,"equal","approved","Ahmed Ezzat","Ahmed Ezzat","Ahmed Ezzat: 600 | Mahmoud Hassan: 600"
    ```
- **Error Responses**:
  - `400 Bad Request`: Invalid export type.
  - `403 Forbidden`: Not house admin.
  - `404 Not Found`: House not found or no data to export.

---

### DELETE `/api/houses/:id`
- **Description**: Permanently deletes a house, removing the house reference from all member user documents. Admin only.
- **Auth Required**: Yes (Bearer Token / Cookie)
- **Headers**:
  - `Authorization: Bearer <token>`
- **Success Response (`200 OK`)**:
  ```json
  {
    "message": "House deleted successfully"
  }
  ```
- **Error Responses**:
  - `403 Forbidden`: Requester is not the house admin.
  - `404 Not Found`: House not found.

---

## Part 2: Role & Chores Rotation Engine (`routes/rotation.js`)

Mounted under `/api/houses/:id/rotation`. Provides flexible round-robin rotation for chores (dishes, cleaning, trash, grocery runs) among house members.

### GET `/api/houses/:id/rotation`
- **Description**: Fetches current rotation configuration, active cycle assignments, and past cycle history for the house.
- **Auth Required**: Yes (Bearer Token / Cookie)
- **Headers**:
  - `Authorization: Bearer <token>`
- **Success Response (`200 OK`)**:
  ```json
  {
    "enabled": true,
    "participants": [
      {
        "_id": "651f8a8b1234567890abcdef",
        "name": "Ahmed Ezzat",
        "username": "ahmed99",
        "profilePicture": "https://avatar.iran.liara.run/public/1"
      },
      {
        "_id": "6521a00f1122334455667788",
        "name": "Mahmoud Hassan",
        "username": "mahmoud_h",
        "profilePicture": null
      }
    ],
    "roles": [
      { "name": "Dishes", "count": 1 },
      { "name": "Cleaning", "count": 1 }
    ],
    "cycleIndex": 1,
    "currentCycle": {
      "cycleNumber": 1,
      "startedAt": "2026-08-20",
      "assignments": [
        {
          "slotIndex": 0,
          "roleName": "Dishes",
          "participant": {
            "_id": "651f8a8b1234567890abcdef",
            "name": "Ahmed Ezzat",
            "username": "ahmed99"
          }
        },
        {
          "slotIndex": 1,
          "roleName": "Cleaning",
          "participant": {
            "_id": "6521a00f1122334455667788",
            "name": "Mahmoud Hassan",
            "username": "mahmoud_h"
          }
        }
      ]
    },
    "history": []
  }
  ```
- **Error Responses**:
  - `403 Forbidden`: Requester is not a member of this house.
  - `404 Not Found`: House not found.

---

### PUT `/api/houses/:id/rotation`
- **Description**: Configures rotation settings, participant member IDs, and role definitions with slot counts. Validates that participant count strictly matches total role slot counts (`sum(roles.count)`). Admin only.
- **Auth Required**: Yes (Bearer Token / Cookie)
- **Headers**:
  - `Content-Type: application/json`
  - `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "enabled": true,
    "participants": [
      "651f8a8b1234567890abcdef",
      "6521a00f1122334455667788"
    ],
    "roles": [
      { "name": "Dishes", "count": 1 },
      { "name": "Trash & Hallway", "count": 1 }
    ]
  }
  ```
- **Success Response (`200 OK`)**:
  ```json
  {
    "enabled": true,
    "participants": [
      "651f8a8b1234567890abcdef",
      "6521a00f1122334455667788"
    ],
    "roles": [
      { "name": "Dishes", "count": 1 },
      { "name": "Trash & Hallway", "count": 1 }
    ],
    "cycleIndex": 0,
    "currentCycle": null,
    "history": []
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: Payload validation failed (`"Participant count must match total role slots"`, `"Role names must be unique"`, or `"All participants must be house members"`).
  - `403 Forbidden`: Requester is not the house admin.
  - `404 Not Found`: House not found.

---

### POST `/api/houses/:id/rotation/cycles`
- **Description**: Advances the rotation cycle. Offsets participants using round-robin logic `(cycleIndex % participants.length)`, archives the previous cycle into `history`, increments `cycleIndex`, and updates `currentCycle`. Admin only.
- **Auth Required**: Yes (Bearer Token / Cookie)
- **Headers**:
  - `Authorization: Bearer <token>`
- **Request Body / Query Params**: None
- **Success Response (`200 OK`)**:
  ```json
  {
    "enabled": true,
    "participants": [
      "651f8a8b1234567890abcdef",
      "6521a00f1122334455667788"
    ],
    "roles": [
      { "name": "Dishes", "count": 1 },
      { "name": "Trash & Hallway", "count": 1 }
    ],
    "cycleIndex": 2,
    "currentCycle": {
      "cycleNumber": 2,
      "startedAt": "2026-08-20",
      "assignments": [
        {
          "slotIndex": 0,
          "roleName": "Dishes",
          "participant": "6521a00f1122334455667788"
        },
        {
          "slotIndex": 1,
          "roleName": "Trash & Hallway",
          "participant": "651f8a8b1234567890abcdef"
        }
      ]
    },
    "history": [
      {
        "cycleNumber": 1,
        "startedAt": "2026-08-13",
        "assignments": [...]
      }
    ]
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: Slot/participant count mismatch or missing rotation configuration.
  - `403 Forbidden`: Not house admin.

---

### POST `/api/houses/:id/rotation/reset` & DELETE `/api/houses/:id/rotation`
- **Description**: Resets the entire rotation configuration to empty defaults (`enabled: false`, empty roles, participants, and history). Admin only.
- **Auth Required**: Yes (Bearer Token / Cookie)
- **Headers**:
  - `Authorization: Bearer <token>`
- **Success Response (`200 OK`)**:
  ```json
  {
    "message": "Rotation reset successfully"
  }
  ```
- **Error Responses**:
  - `403 Forbidden`: Requester is not the house admin.
  - `404 Not Found`: House not found.
