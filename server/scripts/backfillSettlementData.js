import dotenv from "dotenv";
import mongoose from "mongoose";

import { connectToDatabase } from "../config/db.js";
import House from "../models/House.js";
import Payment from "../models/Payment.js";
import {
  getSettlementSnapshot,
  reconcileHouseInvoices,
} from "../services/settlementService.js";

dotenv.config();

const toIdString = (value) => {
  if (!value) return null;
  return typeof value === "string" ? value : value.toString();
};

const backfillHouse = async (houseId) => {
  const snapshot = await getSettlementSnapshot(houseId);
  const expenseById = new Map(
    snapshot.expenses.map((expense) => [toIdString(expense._id), expense])
  );
  const invoiceByPaymentRequestId = new Map();
  for (const invoice of snapshot.invoices) {
    const paymentRequestId = toIdString(invoice.paymentRequest);
    if (paymentRequestId) {
      invoiceByPaymentRequestId.set(paymentRequestId, invoice);
    }
  }

  const recipientOperations = [];
  for (const payment of snapshot.payments) {
    if (payment.recipient) continue;
    const invoice = invoiceByPaymentRequestId.get(toIdString(payment._id));
    const expense = invoice
      ? expenseById.get(toIdString(invoice.expense))
      : null;
    const recipient = expense
      ? toIdString(expense.paidBy || expense.createdBy)
      : null;
    if (!recipient) continue;

    recipientOperations.push({
      updateOne: {
        filter: { _id: payment._id, house: houseId, recipient: { $exists: false } },
        update: { $set: { recipient } },
      },
    });
  }

  if (recipientOperations.length > 0) {
    await Payment.bulkWrite(recipientOperations, { ordered: false });
  }

  const reconciled = await reconcileHouseInvoices(houseId);
  return {
    paymentsBackfilled: recipientOperations.length,
    invoicesReconciled: reconciled.invoices.length,
  };
};

const run = async () => {
  await connectToDatabase();
  const houses = await House.find({}).select("_id name").lean();
  let totals = { paymentsBackfilled: 0, invoicesReconciled: 0 };

  for (const house of houses) {
    const result = await backfillHouse(house._id);
    totals.paymentsBackfilled += result.paymentsBackfilled;
    totals.invoicesReconciled += result.invoicesReconciled;
    console.log(
      `House ${house.name || house._id}: ${result.paymentsBackfilled} payments, ${result.invoicesReconciled} invoices`
    );
  }

  console.log(
    `Backfill complete: ${totals.paymentsBackfilled} payment recipients, ${totals.invoicesReconciled} invoices reconciled`
  );
  await mongoose.disconnect();
};

run().catch(async (error) => {
  console.error("Backfill failed:", error);
  await mongoose.disconnect();
  process.exitCode = 1;
});
