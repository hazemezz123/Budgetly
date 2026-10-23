import test from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";

import { payInvoice, payBulkInvoices } from "../controllers/invoiceController.js";
import Invoice from "../models/Invoice.js";
import Payment from "../models/Payment.js";
import User from "../models/User.js";

const originalInvoiceFindById = Invoice.findById;
const originalInvoiceFind = Invoice.find;
const originalPaymentCreate = Payment.create;
const originalUserFindById = User.findById;

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
  User.findById = originalUserFindById;
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
