import test from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";

import Invoice from "../models/Invoice.js";
import Payment from "../models/Payment.js";

const objectId = () => new mongoose.Types.ObjectId();

const validInvoice = (overrides = {}) =>
  new Invoice({
    user: objectId(),
    expense: objectId(),
    amount: 50,
    description: "Dinner",
    house: objectId(),
    ...overrides,
  });

test("invoice defaults allocation fields and accepts net-settlement statuses", () => {
  const invoice = validInvoice();
  assert.equal(invoice.paidAmount, 0);
  assert.equal(invoice.offsetAmount, 0);
  assert.equal(invoice.validateSync(), undefined);

  const offsetInvoice = validInvoice({ status: "offset" });
  assert.equal(offsetInvoice.validateSync(), undefined);

  const partialInvoice = validInvoice({
    status: "partially_paid",
    paidAmount: 25,
    offsetAmount: 10,
  });
  assert.equal(partialInvoice.validateSync(), undefined);
});

test("payment accepts a settlement recipient and transaction type", () => {
  const payment = new Payment({
    user: objectId(),
    recipient: objectId(),
    amount: 50,
    status: "pending",
    transactionType: "settlement",
    recordedBy: objectId(),
    house: objectId(),
  });

  assert.equal(payment.validateSync(), undefined);
  assert.ok(payment.recipient);
});
