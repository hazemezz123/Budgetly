import test from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";

import {
  approveExpense,
  rejectExpense,
  deleteExpense,
  deleteMyRequest,
} from "../controllers/expenseController.js";
import Expense from "../models/Expense.js";
import Invoice from "../models/Invoice.js";
import Payment from "../models/Payment.js";

const objectId = () => new mongoose.Types.ObjectId();

const originalExpenseFindById = Expense.findById;
const originalExpenseFindOneAndUpdate = Expense.findOneAndUpdate;
const originalExpenseFindOneAndDelete = Expense.findOneAndDelete;
const originalExpenseFindByIdAndDelete = Expense.findByIdAndDelete;
const originalExpenseExists = Expense.exists;
const originalInvoiceFind = Invoice.find;
const originalInvoiceCreate = Invoice.create;
const originalInvoiceDeleteMany = Invoice.deleteMany;
const originalPaymentFind = Payment.find;
const originalPaymentDeleteMany = Payment.deleteMany;

const createRes = () => ({
  statusCode: 200,
  body: undefined,
  status(code) {
    this.statusCode = code;
    return this;
  },
  json(payload) {
    this.body = payload;
    return this;
  },
});

const selectChain = (result) => ({
  select: async () => result,
});

const leanChain = (result) => ({
  select: () => ({
    lean: async () => result,
  }),
});

const makeExpenseDocument = (store) => ({
  _id: store.id,
  title: "Dinner",
  status: store.status,
  splits: store.splits,
  paidBy: store.paidBy,
  createdBy: store.createdBy,
  house: store.house,
  async save() {
    store.status = this.status;
    return this;
  },
});

const installAtomicExpenseStore = ({ status = "pending", splits = [] } = {}) => {
  const store = {
    id: objectId(),
    status,
    splits,
    paidBy: objectId(),
    createdBy: objectId(),
    house: objectId(),
  };

  Expense.findById = async () => makeExpenseDocument(store);
  Expense.exists = async () => ({ _id: store.id });
  Expense.findOneAndUpdate = async (filter, update) => {
    if (filter.status && store.status !== filter.status) return null;
    store.status = update.$set.status;
    return makeExpenseDocument(store);
  };

  return store;
};

test.afterEach(() => {
  Expense.findById = originalExpenseFindById;
  Expense.findOneAndUpdate = originalExpenseFindOneAndUpdate;
  Expense.findOneAndDelete = originalExpenseFindOneAndDelete;
  Expense.findByIdAndDelete = originalExpenseFindByIdAndDelete;
  Expense.exists = originalExpenseExists;
  Invoice.find = originalInvoiceFind;
  Invoice.create = originalInvoiceCreate;
  Invoice.deleteMany = originalInvoiceDeleteMany;
  Payment.find = originalPaymentFind;
  Payment.deleteMany = originalPaymentDeleteMany;
});

test("concurrent expense approvals create only one invoice set", async () => {
  const store = installAtomicExpenseStore({
    splits: [{ user: objectId(), amount: 100 }],
  });
  const createdInvoices = [];
  Invoice.create = async (payload) => {
    createdInvoices.push(payload);
    return payload;
  };

  const req = { params: { id: store.id.toString() }, user: { id: store.createdBy } };
  const first = createRes();
  const second = createRes();

  await Promise.all([
    approveExpense(req, first),
    approveExpense(req, second),
  ]);

  assert.deepEqual([first.statusCode, second.statusCode].sort(), [200, 400]);
  assert.equal(store.status, "approved");
  assert.equal(createdInvoices.length, 1);
});

test("concurrent expense rejections have exactly one winner", async () => {
  installAtomicExpenseStore();

  const req = { params: { id: objectId().toString() }, user: { id: objectId() } };
  const first = createRes();
  const second = createRes();

  await Promise.all([
    rejectExpense(req, first),
    rejectExpense(req, second),
  ]);

  assert.deepEqual([first.statusCode, second.statusCode].sort(), [200, 400]);
});

test("deleteExpense rejects an approved expense without touching linked records", async () => {
  const expenseId = objectId();
  let invoiceQueryCalled = false;
  let paymentDeleteCalled = false;
  let invoiceDeleteCalled = false;
  let expenseDeleteCalled = false;

  Expense.findById = async () => ({
    _id: expenseId,
    status: "approved",
    house: objectId(),
  });
  Invoice.find = () => {
    invoiceQueryCalled = true;
    return selectChain([]);
  };
  Payment.deleteMany = async () => {
    paymentDeleteCalled = true;
    return { deletedCount: 1 };
  };
  Invoice.deleteMany = async () => {
    invoiceDeleteCalled = true;
    return { deletedCount: 1 };
  };
  Expense.findOneAndDelete = async () => {
    expenseDeleteCalled = true;
    return { _id: expenseId };
  };
  Expense.findByIdAndDelete = async () => {
    expenseDeleteCalled = true;
    return { _id: expenseId };
  };

  const req = { params: { id: expenseId.toString() }, user: { id: objectId() } };
  const res = createRes();

  await deleteExpense(req, res);

  assert.equal(res.statusCode, 409);
  assert.equal(invoiceQueryCalled, false);
  assert.equal(paymentDeleteCalled, false);
  assert.equal(invoiceDeleteCalled, false);
  assert.equal(expenseDeleteCalled, false);
});

test("deleteExpense refuses to delete a pending expense with an approved payment", async () => {
  const expenseId = objectId();
  const paymentId = objectId();
  let expenseDeleteCalled = false;
  let paymentDeleteCalled = false;
  let invoiceDeleteCalled = false;

  Expense.findById = async () => ({
    _id: expenseId,
    status: "pending",
    house: objectId(),
  });
  Invoice.find = () => selectChain([{ paymentRequest: paymentId }]);
  Payment.find = () => leanChain([{ _id: paymentId, status: "approved" }]);
  Payment.deleteMany = async () => {
    paymentDeleteCalled = true;
    return { deletedCount: 1 };
  };
  Invoice.deleteMany = async () => {
    invoiceDeleteCalled = true;
    return { deletedCount: 1 };
  };
  Expense.findOneAndDelete = async () => {
    expenseDeleteCalled = true;
    return { _id: expenseId };
  };
  Expense.findByIdAndDelete = async () => {
    expenseDeleteCalled = true;
    return { _id: expenseId };
  };

  const req = { params: { id: expenseId.toString() }, user: { id: objectId() } };
  const res = createRes();

  await deleteExpense(req, res);

  assert.equal(res.statusCode, 409);
  assert.equal(expenseDeleteCalled, false);
  assert.equal(paymentDeleteCalled, false);
  assert.equal(invoiceDeleteCalled, false);
});

test("deleteExpense only deletes non-approved linked payments", async () => {
  const expenseId = objectId();
  const paymentId = objectId();
  let paymentDeleteFilter = null;
  let invoiceDeleteFilter = null;
  let atomicDeleteFilter = null;
  let expenseFindByIdAndDeleteCalled = false;

  Expense.findById = async () => ({
    _id: expenseId,
    status: "pending",
    house: objectId(),
  });
  Invoice.find = () => selectChain([{ paymentRequest: paymentId }]);
  Payment.find = () => leanChain([]);
  Expense.findOneAndDelete = async (filter) => {
    atomicDeleteFilter = filter;
    return { _id: expenseId };
  };
  Expense.findByIdAndDelete = async () => {
    expenseFindByIdAndDeleteCalled = true;
    return { _id: expenseId };
  };
  Payment.deleteMany = async (filter) => {
    paymentDeleteFilter = filter;
    return { deletedCount: 1 };
  };
  Invoice.deleteMany = async (filter) => {
    invoiceDeleteFilter = filter;
    return { deletedCount: 1 };
  };

  const req = { params: { id: expenseId.toString() }, user: { id: objectId() } };
  const res = createRes();

  await deleteExpense(req, res);

  assert.equal(res.statusCode, 200);
  assert.equal(expenseFindByIdAndDeleteCalled, false);
  assert.deepEqual(atomicDeleteFilter, {
    _id: expenseId,
    status: { $in: ["pending", "rejected"] },
  });
  assert.deepEqual(paymentDeleteFilter, {
    _id: { $in: [paymentId] },
    status: { $in: ["pending", "rejected"] },
  });
  assert.deepEqual(invoiceDeleteFilter, { expense: expenseId });
});

test("deleteExpense aborts if the expense leaves the deletable state", async () => {
  const expenseId = objectId();
  let invoiceDeleteCalled = false;

  Expense.findById = async () => ({
    _id: expenseId,
    status: "pending",
    house: objectId(),
  });
  Invoice.find = () => selectChain([]);
  Expense.findOneAndDelete = async () => null;
  Expense.findByIdAndDelete = async () => ({ _id: expenseId });
  Invoice.deleteMany = async () => {
    invoiceDeleteCalled = true;
    return { deletedCount: 1 };
  };

  const req = { params: { id: expenseId.toString() }, user: { id: objectId() } };
  const res = createRes();

  await deleteExpense(req, res);

  assert.equal(res.statusCode, 409);
  assert.equal(invoiceDeleteCalled, false);
});

test("deleteMyRequest refuses to hard-delete an approved payment", async () => {
  const expenseId = objectId();
  const paymentId = objectId();
  const userId = objectId();
  let paymentDeleteCalled = false;

  Expense.findById = async () => ({
    _id: expenseId,
    status: "pending",
    createdBy: userId,
    house: objectId(),
  });
  Invoice.find = () => selectChain([{ paymentRequest: paymentId }]);
  Payment.find = () => leanChain([{ _id: paymentId, status: "approved" }]);
  Payment.deleteMany = async () => {
    paymentDeleteCalled = true;
    return { deletedCount: 1 };
  };
  Invoice.deleteMany = async () => ({ deletedCount: 1 });
  Expense.findByIdAndDelete = async () => ({ _id: expenseId });
  Expense.findOneAndDelete = async () => ({ _id: expenseId });

  const req = { params: { id: expenseId.toString() }, user: { id: userId } };
  const res = createRes();

  await deleteMyRequest(req, res);

  assert.equal(res.statusCode, 409);
  assert.equal(paymentDeleteCalled, false);
});
