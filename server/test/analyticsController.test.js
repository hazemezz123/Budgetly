import test from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";

import {
  getMonthlyAnalytics,
  getCategoryTrends,
} from "../controllers/analyticsController.js";
import Expense from "../models/Expense.js";
import Invoice from "../models/Invoice.js";

const originalExpenseAggregate = Expense.aggregate;
const originalInvoiceAggregate = Invoice.aggregate;

const createRes = () => ({
  statusCode: 200,
  body: null,
  status(code) {
    this.statusCode = code;
    return this;
  },
  json(payload) {
    this.body = payload;
    return this;
  },
});

test.afterEach(() => {
  Expense.aggregate = originalExpenseAggregate;
  Invoice.aggregate = originalInvoiceAggregate;
});

test("getMonthlyAnalytics aggregates expenses and paid invoices into monthly breakdown, category percentages, and summary", async () => {
  Expense.aggregate = async (pipeline) => {
    assert.ok(pipeline.some((stage) => stage.$match));
    assert.ok(pipeline.some((stage) => stage.$unwind));
    assert.ok(pipeline.some((stage) => stage.$group));
    assert.ok(pipeline.some((stage) => stage.$sort));
    return [
      {
        _id: { month: "2026-08", category: "Groceries" },
        total: 150,
        count: 2,
      },
      {
        _id: { month: "2026-08", category: "Utilities" },
        total: 50,
        count: 1,
      },
      {
        _id: { month: "2026-07", category: "Groceries" },
        total: 100,
        count: 1,
      },
    ];
  };

  Invoice.aggregate = async (pipeline) => {
    assert.ok(pipeline.some((stage) => stage.$match));
    assert.ok(pipeline.some((stage) => stage.$group));
    assert.ok(pipeline.some((stage) => stage.$sort));
    return [
      {
        _id: { month: "2026-08" },
        total: 120,
        count: 2,
      },
      {
        _id: { month: "2026-07" },
        total: 80,
        count: 1,
      },
    ];
  };

  const req = {
    user: { id: new mongoose.Types.ObjectId().toString() },
  };
  const res = createRes();

  await getMonthlyAnalytics(req, res);

  assert.equal(res.statusCode, 200);

  assert.deepEqual(res.body.monthlyExpenses["2026-08"], {
    total: 200,
    categories: { Groceries: 150, Utilities: 50 },
    count: 3,
  });
  assert.deepEqual(res.body.monthlyExpenses["2026-07"], {
    total: 100,
    categories: { Groceries: 100 },
    count: 1,
  });

  assert.deepEqual(res.body.monthlyPayments["2026-08"], {
    total: 120,
    count: 2,
  });
  assert.deepEqual(res.body.monthlyPayments["2026-07"], {
    total: 80,
    count: 1,
  });

  assert.deepEqual(res.body.categoryBreakdown, {
    Groceries: { amount: 250, percentage: "83.3" },
    Utilities: { amount: 50, percentage: "16.7" },
  });

  assert.deepEqual(res.body.summary, {
    totalExpenses: 300,
    totalPayments: 200,
    avgMonthlyExpense: "150.00",
    monthsTracked: 2,
    totalTransactions: 4,
  });
});

test("getMonthlyAnalytics returns empty structures and zeroed summary when no data exists", async () => {
  Expense.aggregate = async () => [];
  Invoice.aggregate = async () => [];

  const req = { user: { id: new mongoose.Types.ObjectId().toString() } };
  const res = createRes();

  await getMonthlyAnalytics(req, res);

  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body.monthlyExpenses, {});
  assert.deepEqual(res.body.monthlyPayments, {});
  assert.deepEqual(res.body.categoryBreakdown, {});
  assert.deepEqual(res.body.summary, {
    totalExpenses: 0,
    totalPayments: 0,
    avgMonthlyExpense: "0.00",
    monthsTracked: 0,
    totalTransactions: 0,
  });
});

test("getMonthlyAnalytics handles internal server error gracefully", async () => {
  Expense.aggregate = async () => {
    throw new Error("Database query failed");
  };

  const req = { user: { id: new mongoose.Types.ObjectId().toString() } };
  const res = createRes();

  await getMonthlyAnalytics(req, res);

  assert.equal(res.statusCode, 500);
  assert.deepEqual(res.body, { message: "Server error" });
});

test("getCategoryTrends aggregates trend data by month and category", async () => {
  Expense.aggregate = async (pipeline) => {
    assert.ok(pipeline.some((stage) => stage.$match));
    assert.ok(pipeline.some((stage) => stage.$unwind));
    assert.ok(pipeline.some((stage) => stage.$group));
    assert.ok(pipeline.some((stage) => stage.$sort));
    return [
      { _id: { month: "2026-06", category: "Food" }, total: 80 },
      { _id: { month: "2026-06", category: "Rent" }, total: 500 },
      { _id: { month: "2026-07", category: "Food" }, total: 95 },
    ];
  };

  const req = {
    user: { id: new mongoose.Types.ObjectId().toString() },
    query: { months: "3" },
  };
  const res = createRes();

  await getCategoryTrends(req, res);

  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body, {
    trends: {
      "2026-06": { Food: 80, Rent: 500 },
      "2026-07": { Food: 95 },
    },
  });
});

test("getCategoryTrends defaults to 6 months when query.months is omitted", async () => {
  let capturedPipeline = null;
  Expense.aggregate = async (pipeline) => {
    capturedPipeline = pipeline;
    return [];
  };

  const req = {
    user: { id: new mongoose.Types.ObjectId().toString() },
    query: {},
  };
  const res = createRes();

  await getCategoryTrends(req, res);

  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body, { trends: {} });
  assert.ok(capturedPipeline);
  assert.ok(capturedPipeline[0].$match.date.$gte);
});

test("getCategoryTrends handles internal server error gracefully", async () => {
  Expense.aggregate = async () => {
    throw new Error("Database error");
  };

  const req = { user: { id: new mongoose.Types.ObjectId().toString() } };
  const res = createRes();

  await getCategoryTrends(req, res);

  assert.equal(res.statusCode, 500);
  assert.deepEqual(res.body, { message: "Server error" });
});
