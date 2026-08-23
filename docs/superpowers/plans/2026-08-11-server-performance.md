# Server Performance Enhancement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enhance backend throughput, decrease database query response time, and optimize RAM usage by adding targeted MongoDB indexes, native aggregation pipelines, and `.lean()` query optimizations across Budgetly server routes.

**Architecture:** Add missing Mongoose schema indexes for `Note`, `ChatHistory`, `Expense`, and `Invoice`. Refactor `analyticsController.js` to use native MongoDB aggregation pipelines (`$match`, `$unwind`, `$group`). Add `.lean()` to all read endpoints.

**Tech Stack:** Node.js, Express, MongoDB, Mongoose, Native Node Test Runner (`node --test`).

## Global Constraints
- Target Files: `server/models/*.js`, `server/controllers/*.js`
- Preserve existing API response contracts and JSON formats exactly.
- All tests (`npm test` in `server/`) must pass.

---

### Task 1: Add Missing Database Indexes to Models

**Files:**
- Modify: `server/models/Note.js`
- Modify: `server/models/ChatHistory.js`
- Modify: `server/models/Expense.js`
- Modify: `server/models/Invoice.js`

**Interfaces:**
- Consumes: Mongoose schema definitions
- Produces: Indexed Mongoose models

- [ ] **Step 1: Add index to Note.js**

Add compound index on `house` and `createdAt`:
```javascript
noteSchema.index({ house: 1, createdAt: -1 });
```

- [ ] **Step 2: Add index to ChatHistory.js**

Add compound index on `user` and `updatedAt`:
```javascript
chatHistorySchema.index({ user: 1, updatedAt: -1 });
```

- [ ] **Step 3: Add index to Expense.js**

Add compound index on `splits.user`, `status`, and `date`:
```javascript
expenseSchema.index({ "splits.user": 1, status: 1, date: -1 });
```

- [ ] **Step 4: Add index to Invoice.js**

Add compound index on `user`, `status`, and `createdAt`:
```javascript
invoiceSchema.index({ user: 1, status: 1, createdAt: -1 });
```

- [ ] **Step 5: Run server unit tests**

Run: `npm test` in `server/`
Expected: PASS

- [ ] **Step 6: Commit**

Run: `git add server/models/ && git commit -m "perf(db): add missing indexes to Note, ChatHistory, Expense, and Invoice models"`

---

### Task 2: Refactor Analytics Controller to MongoDB Aggregation Pipelines

**Files:**
- Modify: `server/controllers/analyticsController.js`

**Interfaces:**
- Consumes: `Expense`, `Invoice`, `mongoose`
- Produces: Optimized `getMonthlyAnalytics` and `getCategoryTrends` endpoints

- [ ] **Step 1: Update getMonthlyAnalytics with aggregation pipeline**

Replace in-memory `.find()` + `.forEach()` with native aggregation pipeline while maintaining exact response structure:
```javascript
import Invoice from "../models/Invoice.js";
import Expense from "../models/Expense.js";
import mongoose from "mongoose";

export const getMonthlyAnalytics = async (req, res) => {
  try {
    const userObjectId = new mongoose.Types.ObjectId(req.user.id);

    // Aggregate monthly expenses by user split
    const expenseAgg = await Expense.aggregate([
      { $match: { "splits.user": userObjectId } },
      { $unwind: "$splits" },
      { $match: { "splits.user": userObjectId } },
      {
        $group: {
          _id: {
            month: { $dateToString: { format: "%Y-%m", date: "$date" } },
            category: "$category",
          },
          categoryTotal: { $sum: "$splits.amount" },
          count: { $sum: 1 },
        },
      },
    ]);

    // Aggregate monthly paid invoices
    const invoiceAgg = await Invoice.aggregate([
      { $match: { user: userObjectId, status: "paid" } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ]);

    const monthlyExpenses = {};
    const categoryBreakdown = {};
    let totalAllTime = 0;
    let totalTransactions = 0;

    expenseAgg.forEach((item) => {
      const month = item._id.month;
      const category = item._id.category || "General";
      const amount = item.categoryTotal;

      if (!monthlyExpenses[month]) {
        monthlyExpenses[month] = { total: 0, categories: {}, count: 0 };
      }
      monthlyExpenses[month].total += amount;
      monthlyExpenses[month].count += item.count;
      monthlyExpenses[month].categories[category] =
        (monthlyExpenses[month].categories[category] || 0) + amount;

      categoryBreakdown[category] = (categoryBreakdown[category] || 0) + amount;
      totalAllTime += amount;
      totalTransactions += item.count;
    });

    const monthlyPayments = {};
    let totalPaymentsAmount = 0;
    invoiceAgg.forEach((item) => {
      monthlyPayments[item._id] = { total: item.total, count: item.count };
      totalPaymentsAmount += item.total;
    });

    const categoryPercentages = {};
    Object.keys(categoryBreakdown).forEach((category) => {
      categoryPercentages[category] = {
        amount: categoryBreakdown[category],
        percentage:
          totalAllTime > 0
            ? ((categoryBreakdown[category] / totalAllTime) * 100).toFixed(1)
            : 0,
      };
    });

    const monthCount = Object.keys(monthlyExpenses).length;
    const avgMonthlyExpense = monthCount > 0 ? totalAllTime / monthCount : 0;

    res.json({
      monthlyExpenses,
      monthlyPayments,
      categoryBreakdown: categoryPercentages,
      summary: {
        totalExpenses: totalAllTime,
        totalPayments: totalPaymentsAmount,
        avgMonthlyExpense: avgMonthlyExpense.toFixed(2),
        monthsTracked: monthCount,
        totalTransactions,
      },
    });
  } catch (error) {
    console.error("Get monthly analytics error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
```

- [ ] **Step 2: Update getCategoryTrends with aggregation pipeline**

```javascript
export const getCategoryTrends = async (req, res) => {
  try {
    const userObjectId = new mongoose.Types.ObjectId(req.user.id);
    const months = parseInt(req.query.months) || 6;

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - months);

    const trendsAgg = await Expense.aggregate([
      {
        $match: {
          "splits.user": userObjectId,
          date: { $gte: sixMonthsAgo },
        },
      },
      { $unwind: "$splits" },
      { $match: { "splits.user": userObjectId } },
      {
        $group: {
          _id: {
            month: { $dateToString: { format: "%Y-%m", date: "$date" } },
            category: "$category",
          },
          totalAmount: { $sum: "$splits.amount" },
        },
      },
      { $sort: { "_id.month": 1 } },
    ]);

    const trends = {};
    trendsAgg.forEach((item) => {
      const month = item._id.month;
      const category = item._id.category || "General";
      if (!trends[month]) {
        trends[month] = {};
      }
      trends[month][category] = item.totalAmount;
    });

    res.json({ trends });
  } catch (error) {
    console.error("Get trends error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
```

- [ ] **Step 3: Run server tests**

Run: `npm test` in `server/`
Expected: PASS

- [ ] **Step 4: Commit**

Run: `git add server/controllers/analyticsController.js && git commit -m "perf(api): refactor analytics endpoints to native MongoDB aggregation pipelines"`

---

### Task 3: Audit and Apply .lean() Query Optimizations

**Files:**
- Modify: `server/controllers/noteController.js`
- Modify: `server/controllers/expenseController.js`
- Modify: `server/controllers/invoiceController.js`

**Interfaces:**
- Consumes: Mongoose read queries
- Produces: Lightweight JavaScript plain object query results

- [ ] **Step 1: Update noteController.js read endpoints to use .lean()**

Ensure `getNotes` calls `.lean()`:
```javascript
export const getNotes = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("house").lean();
    if (!user || !user.house) {
      return res.status(400).json({ message: "User not in a house" });
    }
    const notes = await Note.find({ house: user.house })
      .populate("createdBy", "name username profilePicture")
      .populate("replies.createdBy", "name username profilePicture")
      .sort({ createdAt: -1 })
      .lean();
    res.json(notes);
  } catch (error) {
    console.error("Get notes error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
```

- [ ] **Step 2: Update expenseController.js read endpoints to use .lean()**

Ensure `getExpenses` calls `.lean()` on query results.

- [ ] **Step 3: Update invoiceController.js read endpoints to use .lean()**

Ensure `getMyInvoices` and `getAllInvoices` use `.lean()`.

- [ ] **Step 4: Run server tests**

Run: `npm test` in `server/`
Expected: PASS

- [ ] **Step 5: Commit**

Run: `git add server/controllers/ && git commit -m "perf(api): optimize read queries across controllers with Mongoose .lean()"`
