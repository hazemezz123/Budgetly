import test from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";

const objectId = () => new mongoose.Types.ObjectId();

import * as expenseControllerModule from "../controllers/expenseController.js";
import Expense from "../models/Expense.js";
import User from "../models/User.js";
import House from "../models/House.js";
import Invoice from "../models/Invoice.js";
import Notification from "../models/Notification.js";
import PushSubscription from "../models/PushSubscription.js";

const originalExpenseCreate = Expense.create;
const originalUserFind = User.find;
const originalHouseFindById = House.findById;
const originalInvoiceCreate = Invoice.create;
const originalNotificationCreate = Notification.create;
const originalPushFind = PushSubscription.find;

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

const mockChain = (result) => ({
  select() { return { lean: async () => result }; },
});

const mockUserFindChain = (result) => ({
  select: () => Promise.resolve(result),
});

const mockUserFindChainWithLean = (result) => ({
  select: () => {
    const chain = {
      lean: async () => result,
      then: (resolve, reject) => Promise.resolve(result).then(resolve, reject),
    };
    return chain;
  },
});

test.afterEach(() => {
  Expense.create = originalExpenseCreate;
  User.find = originalUserFind;
  House.findById = originalHouseFindById;
  Invoice.create = originalInvoiceCreate;
  Notification.create = originalNotificationCreate;
  PushSubscription.find = originalPushFind;
});

test("Member creates pending expense -> Notification created for House.admin", async () => {
  const memberId = objectId();
  const adminId = objectId();
  const houseId = objectId();
  const expenseId = objectId();

  const fakeExpense = {
    _id: expenseId,
    title: "كهربا",
    totalAmount: 300,
    category: "Utilities",
    status: "pending",
    splits: [{ user: memberId, amount: 100 }],
    createdBy: memberId,
    paidBy: memberId,
    house: houseId,
    toObject() {
      return { _id: this._id, title: this.title, splits: this.splits, status: this.status };
    },
  };

  const notifCalls = [];
  Notification.create = async (doc) => {
    notifCalls.push(doc);
    return { _id: objectId(), ...doc };
  };

  Expense.create = async (doc) => {
    assert.equal(doc.status, "pending");
    return fakeExpense;
  };

  House.findById = () => mockChain({ admin: adminId });
  // PushSubscriptions - return empty so push is no-op but doesn't fail
  PushSubscription.find = () => ({ lean: async () => [] });
  Invoice.create = async () => ({});
  User.find = () => mockUserFindChainWithLean([{ _id: memberId, name: "أحمد", username: "ahmed" }]);

  const req = {
    user: { id: memberId.toString(), name: "أحمد", username: "ahmed", role: "user", house: houseId },
    body: {
      title: "كهربا",
      category: "Utilities",
      totalAmount: 300,
      splitType: "specific",
      selectedUsers: [memberId.toString()],
    },
  };
  const res = createRes();

  await expenseControllerModule.createExpense(req, res);

  assert.equal(res.statusCode, 201);
  assert.equal(notifCalls.length, 1);
  assert.equal(String(notifCalls[0].recipient), String(adminId));
  assert.equal(String(notifCalls[0].sender), String(memberId));
  assert.equal(String(notifCalls[0].house), String(houseId));
  assert.equal(String(notifCalls[0].expense), String(expenseId));
  assert.equal(notifCalls[0].type, "pending-expense");
  assert.equal(notifCalls[0].title, "مصروف جديد بانتظار المراجعة");
  assert.match(notifCalls[0].body, /أحمد/);
  assert.match(notifCalls[0].body, /كهربا/);
  assert.equal(notifCalls[0].url, `/all-invoices?requestId=${expenseId}#pending-requests`);
  assert.equal(notifCalls[0].data.expenseId, expenseId.toString());
});

test("Admin creates approved expense -> no Notification", async () => {
  const adminId = objectId();
  const houseId = objectId();
  const fakeExpense = {
    _id: objectId(),
    status: "approved",
    splits: [{ user: adminId, amount: 300 }],
    createdBy: adminId,
    paidBy: adminId,
    house: houseId,
    toObject() { return { _id: this._id, status: this.status, splits: this.splits }; },
  };

  let called = false;
  Notification.create = async () => { called = true; return {}; };

  Expense.create = async (doc) => {
    assert.equal(doc.status, "approved");
    return fakeExpense;
  };
  PushSubscription.find = () => ({ lean: async () => [] });
  User.find = () => mockUserFindChain([{ _id: adminId, name: "Admin", username: "admin" }]);
  Invoice.create = async () => ({});

  const req = {
    user: { id: adminId.toString(), name: "Admin", username: "admin", role: "admin", house: houseId },
    body: { title: "إيجار", category: "Housing", totalAmount: 300, splitType: "equal" },
  };
  const res = createRes();
  await expenseControllerModule.createExpense(req, res);
  assert.equal(res.statusCode, 201);
  assert.equal(called, false);
});

test("Member is House.admin themselves -> no self notification", async () => {
  const sameId = objectId();
  const houseId = objectId();
  const fakeExpense = {
    _id: objectId(),
    status: "pending",
    splits: [{ user: sameId, amount: 100 }],
    createdBy: sameId,
    house: houseId,
    toObject() { return { _id: this._id, splits: this.splits, status: this.status }; },
  };

  Expense.create = async () => fakeExpense;
  House.findById = () => mockChain({ admin: sameId });
  let called = false;
  Notification.create = async () => { called = true; return {}; };
  PushSubscription.find = () => ({ lean: async () => [] });
  User.find = () => mockUserFindChainWithLean([{ _id: sameId, name: "AdminMember", username: "x" }]);
  Invoice.create = async () => ({});

  const req = {
    user: { id: sameId.toString(), name: "AdminMember", username: "x", role: "user", house: houseId },
    body: { title: "مياه", category: "Utilities", totalAmount: 100, splitType: "specific", selectedUsers: [sameId.toString()] },
  };
  const res = createRes();
  await expenseControllerModule.createExpense(req, res);
  assert.equal(res.statusCode, 201);
  assert.equal(called, false);
});

test("Push/Inbox failure does not fail expense creation", async () => {
  const memberId = objectId();
  const adminId = objectId();
  const houseId = objectId();
  const fakeExpense = {
    _id: objectId(),
    status: "pending",
    splits: [{ user: memberId, amount: 100 }],
    createdBy: memberId,
    house: houseId,
    toObject() { return { _id: this._id, splits: this.splits, status: this.status }; },
  };
  Expense.create = async () => fakeExpense;
  House.findById = () => mockChain({ admin: adminId });
  Notification.create = async () => { throw new Error("db boom"); };
  PushSubscription.find = () => ({ lean: async () => { throw new Error("push boom"); } });
  User.find = () => mockUserFindChainWithLean([{ _id: memberId, name: "أحمد", username: "ahmed" }]);
  Invoice.create = async () => ({});

  const req = {
    user: { id: memberId.toString(), name: "أحمد", username: "ahmed", role: "user", house: houseId },
    body: { title: "نت", category: "Utilities", totalAmount: 100, splitType: "specific", selectedUsers: [memberId.toString()] },
  };
  const res = createRes();
  await expenseControllerModule.createExpense(req, res);
  assert.equal(res.statusCode, 201);
});
