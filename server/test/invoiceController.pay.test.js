import test from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";

import { payInvoice, payBulkInvoices } from "../controllers/invoiceController.js";
import Invoice from "../models/Invoice.js";
import Payment from "../models/Payment.js";
import User from "../models/User.js";
import Expense from "../models/Expense.js";

const originalInvoiceFindById = Invoice.findById;
const originalInvoiceFind = Invoice.find;
const originalPaymentCreate = Payment.create;
const originalPaymentFind = Payment.find;
const originalUserFind = User.find;
const originalUserFindById = User.findById;
const originalExpenseFind = Expense.find;

const createRes = () => {
  const res = {
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
  };

  return res;
};

const objectId = () => new mongoose.Types.ObjectId();

test.afterEach(() => {
  Invoice.findById = originalInvoiceFindById;
  Invoice.find = originalInvoiceFind;
  Payment.create = originalPaymentCreate;
  Payment.find = originalPaymentFind;
  User.find = originalUserFind;
  User.findById = originalUserFindById;
  Expense.find = originalExpenseFind;
  delete mongoose.connection.readyState;
});

test("payInvoice returns 403 when user is not the invoice owner", async () => {
  const houseId = objectId();
  const ownerId = objectId();
  const callerId = objectId();

  const mockInvoice = {
    _id: objectId(),
    user: ownerId,
    house: houseId,
    status: "pending",
  };

  Invoice.findById = async () => mockInvoice;

  const req = {
    params: { id: mockInvoice._id.toString() },
    user: { id: callerId, house: houseId, role: "user" },
  };
  const res = createRes();

  await payInvoice(req, res);

  assert.equal(res.statusCode, 403);
  assert.equal(res.body.message, "Not authorized to pay this invoice");
});

test("payInvoice allows owner with ObjectId req.user.id to pay and sets awaiting_approval for regular member", async () => {
  const houseId = objectId();
  const userId = objectId(); // Note: req.user.id is an ObjectId instance in real auth middleware

  const mockInvoice = {
    _id: objectId(),
    user: userId,
    house: houseId,
    amount: 75,
    description: "Dinner",
    status: "pending",
    paymentRequest: null,
    saved: false,
    async save() {
      this.saved = true;
    },
  };

  Invoice.findById = async () => mockInvoice;

  let createdPaymentPayload = null;
  Payment.create = async (payload) => {
    createdPaymentPayload = payload;
    return { _id: objectId(), ...payload };
  };

  const req = {
    params: { id: mockInvoice._id.toString() },
    user: { id: userId, house: houseId, role: "user" },
  };
  const res = createRes();

  await payInvoice(req, res);

  assert.equal(res.statusCode, 200);
  assert.equal(mockInvoice.saved, true);
  assert.equal(mockInvoice.status, "awaiting_approval");
  assert.equal(createdPaymentPayload.status, "pending");
  assert.equal(createdPaymentPayload.amount, 75);
  assert.equal(createdPaymentPayload.approvedBy, undefined);
});

test("payInvoice immediately approves and sets invoice to paid when admin pays", async () => {
  const houseId = objectId();
  const adminId = objectId();

  const mockInvoice = {
    _id: objectId(),
    user: adminId,
    house: houseId,
    amount: 120,
    description: "Water bill",
    status: "pending",
    paymentRequest: null,
    saved: false,
    async save() {
      this.saved = true;
    },
  };

  Invoice.findById = async () => mockInvoice;

  let createdPaymentPayload = null;
  Payment.create = async (payload) => {
    createdPaymentPayload = payload;
    return { _id: objectId(), ...payload };
  };

  const req = {
    params: { id: mockInvoice._id.toString() },
    user: { id: adminId, house: houseId, role: "admin" },
  };
  const res = createRes();

  await payInvoice(req, res);

  assert.equal(res.statusCode, 200);
  assert.equal(mockInvoice.saved, true);
  assert.equal(mockInvoice.status, "paid");
  assert.equal(createdPaymentPayload.status, "approved");
  assert.equal(createdPaymentPayload.approvedBy, adminId);
});

test("payInvoice refuses an invoice fully covered by netting", async () => {
  const houseId = objectId();
  const userId = objectId();

  const mockInvoice = {
    _id: objectId(),
    user: userId,
    house: houseId,
    amount: 50,
    paidAmount: 0,
    offsetAmount: 50,
    description: "Netted invoice",
    status: "pending",
    paymentRequest: null,
  };

  Invoice.findById = async () => mockInvoice;

  const req = {
    params: { id: mockInvoice._id.toString() },
    user: { id: userId, house: houseId, role: "user" },
  };
  const res = createRes();

  await payInvoice(req, res);

  assert.equal(res.statusCode, 400);
  assert.match(res.body.message, /offset|settled/i);
});

test("payInvoice only charges the remaining amount on a partially paid invoice", async () => {
  const houseId = objectId();
  const userId = objectId();

  const mockInvoice = {
    _id: objectId(),
    user: userId,
    house: houseId,
    amount: 50,
    paidAmount: 20,
    offsetAmount: 10,
    description: "Partially settled invoice",
    status: "partially_paid",
    paymentRequest: null,
    saved: false,
    async save() {
      this.saved = true;
    },
  };

  Invoice.findById = async () => mockInvoice;

  let createdPaymentPayload = null;
  Payment.create = async (payload) => {
    createdPaymentPayload = payload;
    return { _id: objectId(), ...payload };
  };

  const req = {
    params: { id: mockInvoice._id.toString() },
    user: { id: userId, house: houseId, role: "user" },
  };
  const res = createRes();

  await payInvoice(req, res);

  assert.equal(res.statusCode, 200);
  assert.equal(createdPaymentPayload.amount, 20);
});

test("payInvoice rejects a legacy invoice payment above current net debt", async () => {
  const houseId = objectId();
  const debtorId = objectId();
  const creditorId = objectId();
  const dinnerExpenseId = objectId();
  const taxiExpenseId = objectId();

  const dinnerInvoice = {
    _id: objectId(),
    user: debtorId,
    house: houseId,
    expense: dinnerExpenseId,
    amount: 100,
    paidAmount: 0,
    offsetAmount: 0,
    description: "Dinner",
    status: "pending",
    paymentRequest: null,
    saveCalls: 0,
    async save() {
      this.saveCalls += 1;
    },
  };
  const taxiInvoice = {
    _id: objectId(),
    user: creditorId,
    house: houseId,
    expense: taxiExpenseId,
    amount: 50,
    paidAmount: 0,
    offsetAmount: 0,
    description: "Taxi",
    status: "pending",
    paymentRequest: null,
  };

  Invoice.findById = async () => dinnerInvoice;
  Invoice.find = () => ({
    select: () => ({ lean: async () => [dinnerInvoice, taxiInvoice] }),
  });
  User.find = () => ({
    select: () => ({
      lean: async () => [
        { _id: debtorId, name: "Debtor", username: "debtor" },
        { _id: creditorId, name: "Creditor", username: "creditor" },
      ],
    }),
  });
  Expense.find = () => ({
    select: () => ({
      lean: async () => [
        {
          _id: dinnerExpenseId,
          house: houseId,
          status: "approved",
          paidBy: creditorId,
          createdBy: creditorId,
          totalAmount: 100,
        },
        {
          _id: taxiExpenseId,
          house: houseId,
          status: "approved",
          paidBy: debtorId,
          createdBy: debtorId,
          totalAmount: 50,
        },
      ],
    }),
  });
  Payment.find = () => ({
    select: () => ({ lean: async () => [] }),
  });

  let created = false;
  Payment.create = async () => {
    created = true;
    return {};
  };

  Object.defineProperty(mongoose.connection, "readyState", {
    value: 1,
    configurable: true,
  });

  const req = {
    params: { id: dinnerInvoice._id.toString() },
    user: { id: debtorId, house: houseId, role: "user" },
  };
  const res = createRes();

  await payInvoice(req, res);

  assert.equal(res.statusCode, 409);
  assert.match(res.body.message, /net debt|settlement/i);
  assert.equal(created, false);
  assert.equal(dinnerInvoice.saveCalls, 0);
});

test("payBulkInvoices immediately approves all invoices when admin pays", async () => {
  const houseId = objectId();
  const adminId = objectId();

  User.findById = async () => ({
    _id: adminId,
    house: houseId,
  });

  const invoice1 = {
    _id: objectId(),
    user: adminId,
    house: houseId,
    amount: 50,
    description: "Bill 1",
    status: "pending",
    async save() {
      this.saved = true;
    },
  };
  const invoice2 = {
    _id: objectId(),
    user: adminId,
    house: houseId,
    amount: 80,
    description: "Bill 2",
    status: "pending",
    async save() {
      this.saved = true;
    },
  };

  Invoice.find = async () => [invoice1, invoice2];

  const createdPayments = [];
  Payment.create = async (payload) => {
    createdPayments.push(payload);
    return { _id: objectId(), ...payload };
  };

  const req = {
    user: { id: adminId, house: houseId, role: "admin" },
  };
  const res = createRes();

  await payBulkInvoices(req, res);

  assert.equal(res.statusCode, 200);
  assert.equal(invoice1.status, "paid");
  assert.equal(invoice2.status, "paid");
  assert.equal(createdPayments.length, 2);
  assert.equal(createdPayments[0].status, "approved");
  assert.equal(createdPayments[1].status, "approved");
  assert.equal(createdPayments[0].approvedBy, adminId);
});
