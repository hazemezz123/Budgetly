# AI Assistant & House Notes API

This document details the AI financial assistant (Groq Cloud LLM integration) and the shared household bulletin board system (House Notes & Replies).

---

## Part 1: AI Financial Assistant API (`routes/ai.js`)

Budgetly integrates with Groq's high-speed inference engine (`https://api.groq.com/openai/v1/chat/completions`) using the `openai/gpt-oss-20b` model.

### AI Capabilities & System Persona
- **Role**: Mathematical financial assistant specialized in Egyptian dialect ("العامية المصرية").
- **Core Functionality**:
  - Complex expense calculations, averages, split scenarios, savings suggestions.
  - Expense categorization recommendations and budget health checks.
  - Strict domain boundary enforcement (declines non-financial questions politely).
- **Persistent Storage**: All chat messages and conversations are stored in MongoDB (`ChatHistory` collection) keyed by user ID.

---

### POST `/api/ai/chat`
- **Description**: Sends a message to the Budgetly AI assistant. Persists both the user prompt and AI response to the user's active or specified chat history session.
- **Auth Required**: Yes (Bearer Token / Cookie)
- **Headers**:
  - `Content-Type: application/json`
  - `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "message": "احنا 4 في الشقة، جبنا طلبات ب 1450 جنيه، وفي اتنين ما شربوش العصير اللي ب 150 جنيه. كل واحد يدفع كام؟",
    "chatId": "6540b12a9876543210112233"
  }
  ```
  *(Note: `chatId` is optional; if omitted, active session is loaded or auto-created).*
- **Success Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "response": "بص يا سيدي الحسبة بسيطة:\n1. شيل تمن العصير (150) من الإجمالي (1450) يتبقى 1300 جنيه.\n2. الـ 1300 يتقسموا على الـ 4 بالتساوي: كل واحد 325 جنيه.\n3. الاتنين اللي شربوا العصير: 325 + 75 = 400 جنيه لكل واحد.\n4. الاتنين اللي ما شربوش: 325 جنيه لكل واحد.",
    "chatId": "6540b12a9876543210112233"
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: Message field missing (`"Message is required"`).
  - `401 Unauthorized`: Authentication missing or invalid Groq API key.
  - `500 Internal Server Error`: `GROQ_API_KEY` missing from server environment.
  - `502 Bad Gateway`: Empty or malformed response from Groq.

---

### GET `/api/ai/chats`
- **Description**: Retrieves recent chat history sessions (max 20) belonging to the authenticated user.
- **Auth Required**: Yes (Bearer Token / Cookie)
- **Headers**:
  - `Authorization: Bearer <token>`
- **Request Body / Query Params**: None
- **Success Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "chats": [
      {
        "_id": "6540b12a9876543210112233",
        "title": "حسبة مصاريف السوبرماركت...",
        "createdAt": "2026-08-20T10:00:00.000Z"
      }
    ]
  }
  ```
- **Error Responses**:
  - `401 Unauthorized`: Token missing.

---

### GET `/api/ai/chats/:chatId`
- **Description**: Fetches the full conversational history of a specific chat session.
- **Auth Required**: Yes (Bearer Token / Cookie)
- **Headers**:
  - `Authorization: Bearer <token>`
- **URL Parameters**:
  - `chatId`: MongoDB ObjectId of the chat history.
- **Success Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "chat": {
      "_id": "6540b12a9876543210112233",
      "user": "651f8a8b1234567890abcdef",
      "title": "حسبة مصاريف السوبرماركت...",
      "messages": [
        {
          "role": "user",
          "content": "احنا 4 في الشقة...",
          "timestamp": "2026-08-20T10:00:00.000Z"
        },
        {
          "role": "assistant",
          "content": "بص يا سيدي الحسبة بسيطة...",
          "timestamp": "2026-08-20T10:00:02.000Z"
        }
      ],
      "createdAt": "2026-08-20T10:00:00.000Z",
      "updatedAt": "2026-08-20T10:00:02.000Z"
    }
  }
  ```
- **Error Responses**:
  - `404 Not Found`: Chat session does not exist or does not belong to user.

---

### DELETE `/api/ai/chats/:chatId`
- **Description**: Permanently deletes a specific chat conversation.
- **Auth Required**: Yes (Bearer Token / Cookie)
- **Headers**:
  - `Authorization: Bearer <token>`
- **URL Parameters**:
  - `chatId`: MongoDB ObjectId of the chat.
- **Success Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Chat deleted successfully"
  }
  ```
- **Error Responses**:
  - `404 Not Found`: Chat not found.

---

## Part 2: House Notes & Shared Announcements API (`routes/notes.js`)

All notes endpoints enforce house scoping: users can only read, post, and reply to notes created within their own house.

### GET `/api/notes`
- **Description**: Returns all notes and threaded replies for the authenticated user's house, sorted by date descending.
- **Auth Required**: Yes (Bearer Token / Cookie)
- **Headers**:
  - `Authorization: Bearer <token>`
- **Request Body / Query Params**: None
- **Success Response (`200 OK`)**:
  ```json
  [
    {
      "_id": "6550a1234567890123456789",
      "content": "يا شباب حد يجيب معاه أكياس زبالة ومنظف أطباق وهو راجع",
      "createdBy": {
        "_id": "651f8a8b1234567890abcdef",
        "name": "Ahmed Ezzat",
        "username": "ahmed99"
      },
      "house": "6520b12a9876543210fedcba",
      "date": "2026-08-20T11:00:00.000Z",
      "replies": [
        {
          "_id": "6550a9994567890123456789",
          "content": "تمام هعدي على الهايبر وأجيبهم",
          "createdBy": {
            "_id": "6521a00f1122334455667788",
            "name": "Mahmoud Hassan",
            "username": "mahmoud_h"
          },
          "createdAt": "2026-08-20T11:15:00.000Z"
        }
      ]
    }
  ]
  ```
- **Error Responses**:
  - `400 Bad Request`: User not in a house (`"You must be in a house to view notes"`).
  - `401 Unauthorized`: Token missing.

---

### POST `/api/notes`
- **Description**: Posts a new note/announcement on the house bulletin board.
- **Auth Required**: Yes (Bearer Token / Cookie)
- **Headers**:
  - `Content-Type: application/json`
  - `Authorization: Bearer <token>`
- **Validation Rules (Zod)**:
  - `content`: String, min 1 character.
- **Request Body**:
  ```json
  {
    "content": "تذكير: معاد دفع فاتورة الغاز بكرة"
  }
  ```
- **Success Response (`201 Created`)**:
  ```json
  {
    "_id": "6550a1234567890123456789",
    "content": "تذكير: معاد دفع فاتورة الغاز بكرة",
    "createdBy": {
      "_id": "651f8a8b1234567890abcdef",
      "name": "Ahmed Ezzat",
      "username": "ahmed99"
    },
    "house": "6520b12a9876543210fedcba",
    "date": "2026-08-20T12:00:00.000Z",
    "replies": []
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: Validation failure or user not in a house.
  - `401 Unauthorized`: Token missing.

---

### POST `/api/notes/:id/reply`
- **Description**: Appends a reply comment to an existing note thread.
- **Auth Required**: Yes (Bearer Token / Cookie)
- **Headers**:
  - `Content-Type: application/json`
  - `Authorization: Bearer <token>`
- **URL Parameters**:
  - `id`: Target Note MongoDB ObjectId.
- **Request Body**:
  ```json
  {
    "content": "دفعناها أونلاين خلاص يا شباب"
  }
  ```
- **Success Response (`200 OK`)**:
  ```json
  {
    "_id": "6550a1234567890123456789",
    "content": "تذكير: معاد دفع فاتورة الغاز بكرة",
    "createdBy": {
      "_id": "651f8a8b1234567890abcdef",
      "name": "Ahmed Ezzat",
      "username": "ahmed99"
    },
    "replies": [
      {
        "_id": "6550b0000000000000000000",
        "content": "دفعناها أونلاين خلاص يا شباب",
        "createdBy": {
          "_id": "6521a00f1122334455667788",
          "name": "Mahmoud Hassan",
          "username": "mahmoud_h"
        },
        "createdAt": "2026-08-20T12:05:00.000Z"
      }
    ]
  }
  ```
- **Error Responses**:
  - `404 Not Found`: Note not found.

---

### DELETE `/api/notes/:id`
- **Description**: Deletes a note and its reply thread. Can be performed by the note creator or the house admin.
- **Auth Required**: Yes (Bearer Token / Cookie)
- **Headers**:
  - `Authorization: Bearer <token>`
- **URL Parameters**:
  - `id`: Note ID.
- **Success Response (`200 OK`)**:
  ```json
  {
    "message": "Note deleted"
  }
  ```
- **Error Responses**:
  - `403 Forbidden`: User is neither note creator nor house admin (`"Not authorized"`).
  - `404 Not Found`: Note not found.
