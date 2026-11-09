import mongoose from "mongoose";
import User from "../models/User.js";
import Expense from "../models/Expense.js";
import Invoice from "../models/Invoice.js";
import Payment from "../models/Payment.js";
import House from "../models/House.js";

const EPSILON = 0.005;
const SETTLEMENT_LOCK_TTL_MS = 60_000;
const SETTLEMENT_LOCK_WAIT_MS = 2_000;
const SETTLEMENT_LOCK_RETRY_MS = 20;

export const roundCurrency = (value) => Math.round((Number(value) || 0) * 100) / 100;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const toIdString = (value) => {
  if (!value) return null;
  if (typeof value === "string") return value;
  if (value._id) return value._id.toString();
  return value.toString();
};

export const withSettlementApprovalLock = async (houseId, work) => {
  const owner = new mongoose.Types.ObjectId().toString();
  const waitUntil = Date.now() + SETTLEMENT_LOCK_WAIT_MS;

  while (Date.now() < waitUntil) {
    const now = new Date();
    const house = await House.findOneAndUpdate(
      {
        _id: houseId,
        $or: [
          { "settlementLock.expiresAt": null },
          { "settlementLock.expiresAt": { $lte: now } },
        ],
      },
      {
        $set: {
          "settlementLock.owner": owner,
          "settlementLock.expiresAt": new Date(
            Date.now() + SETTLEMENT_LOCK_TTL_MS
          ),
        },
      },
      { new: true }
    ).lean();

    if (house) {
      try {
        return await work();
      } finally {
        try {
          await House.updateOne(
            { _id: houseId, "settlementLock.owner": owner },
            { $unset: { settlementLock: "" } }
          );
        } catch (error) {
          console.error("Settlement lock release failed:", error.message);
        }
      }
    }

    await sleep(SETTLEMENT_LOCK_RETRY_MS);
  }

  const error = new Error(
    "Another settlement approval is in progress. Try again."
  );
  error.status = 409;
  throw error;
};

const ensureBalance = (balancesByUserId, userId) => {
  const id = toIdString(userId);
  if (!id) return null;
  if (!balancesByUserId[id]) {
    balancesByUserId[id] = {
      externalPaid: 0,
      internalSent: 0,
      invoicesAssigned: 0,
      internalReceived: 0,
      balance: 0,
    };
  }
  return balancesByUserId[id];
};

const paymentCountsTowardBalance = (payment) =>
  payment.status === "approved" &&
  (!payment.transactionType ||
    payment.transactionType === "payment" ||
    payment.transactionType === "settlement");

const uniqueById = (items = []) => {
  const byId = new Map();
  for (const item of items) {
    const id = toIdString(item._id);
    if (!id) continue;
    byId.set(id, item);
  }
  return [...byId.values()];
};

export const buildSettlementSnapshot = ({ users, expenses, invoices, payments }) => {
  const balancesByUserId = Object.create(null);
  const approvedExpenseById = new Map();
  const approvedExpensePayerById = new Map();
  const approvedPaymentAmountById = new Map();
  const invoiceByPaymentRequestId = new Map();
  const expenseShareByUserId = new Map();
  const pendingPaymentIds = new Set();

  for (const user of users) {
    ensureBalance(balancesByUserId, user._id);
  }

  for (const invoice of invoices) {
    const paymentRequestId = toIdString(invoice.paymentRequest);
    if (paymentRequestId) {
      invoiceByPaymentRequestId.set(paymentRequestId, invoice);
    }
  }

  const uniquePayments = uniqueById(payments);
  const approvedPayments = uniquePayments.filter(paymentCountsTowardBalance);

  for (const payment of uniquePayments) {
    if (payment.status === "pending") {
      pendingPaymentIds.add(toIdString(payment._id));
    }
  }

  for (const expense of expenses) {
    if (expense.status !== "approved") continue;
    const payerId = toIdString(expense.paidBy || expense.createdBy);
    approvedExpenseById.set(toIdString(expense._id), expense);
    if (payerId) {
      approvedExpensePayerById.set(toIdString(expense._id), payerId);
      const payerBalance = ensureBalance(balancesByUserId, payerId);
      if (payerBalance) payerBalance.externalPaid += expense.totalAmount;
    }
  }

  const resolvePaymentRecipient = (payment) => {
    const explicitRecipient = toIdString(payment.recipient);
    if (explicitRecipient) return explicitRecipient;

    const linkedInvoice = invoiceByPaymentRequestId.get(toIdString(payment._id));
    const linkedExpense = linkedInvoice
      ? approvedExpenseById.get(toIdString(linkedInvoice.expense))
      : null;
    return linkedExpense
      ? toIdString(linkedExpense.paidBy || linkedExpense.createdBy)
      : null;
  };

  for (const payment of approvedPayments) {
    const senderId = toIdString(payment.user);
    const senderBalance = ensureBalance(balancesByUserId, senderId);
    if (senderBalance) senderBalance.internalSent += payment.amount;

    const recipientId = resolvePaymentRecipient(payment);
    if (recipientId) {
      const recipientBalance = ensureBalance(balancesByUserId, recipientId);
      if (recipientBalance) recipientBalance.internalReceived += payment.amount;
    }

    approvedPaymentAmountById.set(
      toIdString(payment._id),
      payment.amount
    );
  }

  for (const invoice of invoices) {
    const userId = toIdString(invoice.user);
    if (!userId) continue;
    expenseShareByUserId.set(
      userId,
      (expenseShareByUserId.get(userId) || 0) + invoice.amount
    );
    ensureBalance(balancesByUserId, userId);
  }

  for (const [userId, balance] of Object.entries(balancesByUserId)) {
    balance.balance =
      balance.externalPaid +
      balance.internalSent -
      ((expenseShareByUserId.get(userId) || 0) + balance.internalReceived);
  }

  const allocations = invoices.map((invoice) => {
    const debtorId = toIdString(invoice.user);
    const creditorId = approvedExpensePayerById.get(toIdString(invoice.expense));
    const amount = roundCurrency(invoice.amount);
    let paidAmount =
      debtorId && creditorId && debtorId === creditorId ? amount : 0;

    if (
      paidAmount === 0 &&
      invoice.status === "paid" &&
      !invoice.paymentRequest
    ) {
      paidAmount = amount;
    }

    if (paidAmount > amount) paidAmount = amount;

    return {
      invoice,
      debtorId,
      creditorId,
      amount,
      paidAmount,
      offsetAmount: 0,
      remainingAmount: roundCurrency(amount - paidAmount),
    };
  });

  const allocationsByPair = new Map();
  for (const allocation of allocations) {
    if (!allocation.debtorId || !allocation.creditorId) continue;
    if (allocation.debtorId === allocation.creditorId) continue;
    const key = `${allocation.debtorId}|${allocation.creditorId}`;
    const list = allocationsByPair.get(key) || [];
    list.push(allocation);
    allocationsByPair.set(key, list);
  }

  for (const list of allocationsByPair.values()) {
    list.sort((a, b) => {
      const aLinked = Boolean(a.invoice.paymentRequest);
      const bLinked = Boolean(b.invoice.paymentRequest);
      if (aLinked !== bLinked) return aLinked ? -1 : 1;
      return toIdString(a.invoice._id).localeCompare(toIdString(b.invoice._id));
    });
  }

  const approvedPaymentsByRecipient = new Map();
  for (const payment of approvedPayments) {
    const recipientId = resolvePaymentRecipient(payment);
    if (!recipientId) continue;
    const key = `${toIdString(payment.user)}|${recipientId}`;
    const list = approvedPaymentsByRecipient.get(key) || [];
    list.push(payment);
    approvedPaymentsByRecipient.set(key, list);
  }

  for (const [key, list] of approvedPaymentsByRecipient.entries()) {
    const candidates = allocationsByPair.get(key) || [];
    for (const payment of list) {
      let remainingPayment = roundCurrency(payment.amount);
      if (remainingPayment <= 0) continue;

      const ordered = [...candidates].sort((a, b) => {
        const aLinked =
          toIdString(a.invoice.paymentRequest) === toIdString(payment._id);
        const bLinked =
          toIdString(b.invoice.paymentRequest) === toIdString(payment._id);
        if (aLinked !== bLinked) return aLinked ? -1 : 1;
        return toIdString(a.invoice._id).localeCompare(toIdString(b.invoice._id));
      });

      for (const allocation of ordered) {
        if (remainingPayment <= EPSILON) break;
        const open = roundCurrency(
          allocation.amount - allocation.paidAmount - allocation.offsetAmount
        );
        if (open <= 0) continue;
        const allocated = Math.min(open, remainingPayment);
        allocation.paidAmount = roundCurrency(allocation.paidAmount + allocated);
        remainingPayment = roundCurrency(remainingPayment - allocated);
      }
    }
  }

  const allocationsByDebtor = new Map();
  for (const allocation of allocations) {
    if (!allocation.debtorId) continue;
    const list = allocationsByDebtor.get(allocation.debtorId) || [];
    list.push(allocation);
    allocationsByDebtor.set(allocation.debtorId, list);
  }

  for (const [debtorId, debtorAllocations] of allocationsByDebtor.entries()) {
    const debtorBalance = balancesByUserId[debtorId]?.balance || 0;
    let keepBudget = Math.max(0, roundCurrency(-debtorBalance));

    debtorAllocations.sort((a, b) => {
      const aCreditorBalance = a.creditorId
        ? balancesByUserId[a.creditorId]?.balance || 0
        : 0;
      const bCreditorBalance = b.creditorId
        ? balancesByUserId[b.creditorId]?.balance || 0
        : 0;
      if (aCreditorBalance !== bCreditorBalance) {
        return bCreditorBalance - aCreditorBalance;
      }
      return toIdString(a.invoice._id).localeCompare(toIdString(b.invoice._id));
    });

    for (const allocation of debtorAllocations) {
      const open = roundCurrency(
        allocation.amount - allocation.paidAmount - allocation.offsetAmount
      );
      if (open <= EPSILON) continue;

      const creditorBalance = allocation.creditorId
        ? balancesByUserId[allocation.creditorId]?.balance || 0
        : 0;
      const isNetCreditor = creditorBalance > EPSILON;
      const isNetDebtor = debtorBalance < -EPSILON;

      let keep = 0;
      if (isNetDebtor && isNetCreditor) {
        keep = Math.min(open, keepBudget);
      }

      keep = roundCurrency(keep);
      const offset = roundCurrency(open - keep);
      if (offset > 0) {
        allocation.offsetAmount = roundCurrency(
          allocation.offsetAmount + offset
        );
      }
      keepBudget = roundCurrency(Math.max(0, keepBudget - keep));
    }
  }

  const resultInvoices = allocations.map((allocation) => {
    const remainingAmount = roundCurrency(
      allocation.amount - allocation.paidAmount - allocation.offsetAmount
    );
    const paymentRequestId = toIdString(allocation.invoice.paymentRequest);
    const isAwaitingLegacyApproval =
      remainingAmount > EPSILON &&
      allocation.invoice.status === "awaiting_approval" &&
      paymentRequestId &&
      (pendingPaymentIds.size === 0 || pendingPaymentIds.has(paymentRequestId));

    let status;
    if (remainingAmount <= EPSILON) {
      status =
        allocation.offsetAmount > EPSILON && allocation.paidAmount <= EPSILON
          ? "offset"
          : "paid";
    } else if (isAwaitingLegacyApproval) {
      status = "awaiting_approval";
    } else if (
      allocation.paidAmount > EPSILON ||
      allocation.offsetAmount > EPSILON
    ) {
      status = "partially_paid";
    } else {
      status = "pending";
    }

    return {
      ...allocation.invoice,
      paidAmount: allocation.paidAmount,
      offsetAmount: allocation.offsetAmount,
      remainingAmount,
      status,
    };
  });

  const debtors = Object.entries(balancesByUserId)
    .filter(([, balance]) => balance.balance < -EPSILON)
    .map(([userId, balance]) => ({ userId, amount: roundCurrency(-balance.balance) }))
    .sort((a, b) => b.amount - a.amount || a.userId.localeCompare(b.userId));
  const creditors = Object.entries(balancesByUserId)
    .filter(([, balance]) => balance.balance > EPSILON)
    .map(([userId, balance]) => ({ userId, amount: roundCurrency(balance.balance) }))
    .sort((a, b) => b.amount - a.amount || a.userId.localeCompare(b.userId));

  const transfers = [];
  let debtorIndex = 0;
  let creditorIndex = 0;
  while (debtorIndex < debtors.length && creditorIndex < creditors.length) {
    const debtor = debtors[debtorIndex];
    const creditor = creditors[creditorIndex];
    const amount = roundCurrency(Math.min(debtor.amount, creditor.amount));

    if (amount > 0) {
      transfers.push({
        fromUserId: debtor.userId,
        toUserId: creditor.userId,
        amount,
      });
      debtor.amount = roundCurrency(debtor.amount - amount);
      creditor.amount = roundCurrency(creditor.amount - amount);
    }

    if (debtor.amount <= EPSILON) debtorIndex += 1;
    if (creditor.amount <= EPSILON) creditorIndex += 1;
  }

  for (const balance of Object.values(balancesByUserId)) {
    balance.invoicesAssigned = Math.max(0, roundCurrency(-balance.balance));
  }

  return {
    balancesByUserId,
    invoices: resultInvoices,
    transfers,
    approvedExpensePayerById,
    approvedPaymentAmountById,
  };
};

export const getSettlementSnapshot = async (houseId, { session } = {}) => {
  // Allows lightweight controller tests to replace Mongoose queries with
  // plain promise-returning mocks.
  const lean = (query) => {
    const scoped = session && typeof query.session === "function"
      ? query.session(session)
      : query;
    return typeof scoped.lean === "function" ? scoped.lean() : scoped;
  };
  const [users, expenses, invoices, payments] = await Promise.all([
    lean(
      User.find({ isActive: true, house: houseId }).select(
        "name username house"
      )
    ),
    lean(
      Expense.find({ house: houseId }).select(
        "totalAmount status paidBy createdBy category house"
      )
    ),
    lean(
      Invoice.find({ house: houseId }).select(
        "user expense amount status paymentRequest paidAmount offsetAmount createdAt"
      )
    ),
    lean(
      Payment.find({ house: houseId }).select(
        "user recipient amount status transactionType approvedBy createdAt"
      )
    ),
  ]);

  return {
    users,
    expenses,
    invoices,
    payments,
    ...buildSettlementSnapshot({ users, expenses, invoices, payments }),
  };
};

export const reconcileHouseInvoices = async (houseId, { session } = {}) => {
  // No-op outside a live connection (unit tests and standalone scripts that
  // deliberately avoid touching the database).
  if (mongoose.connection.readyState !== 1) {
    return null;
  }

  const snapshot = await getSettlementSnapshot(houseId, { session });
  const existingById = new Map(
    snapshot.invoices.map((invoice) => [toIdString(invoice._id), invoice])
  );
  const storedQuery = Invoice.find({ house: houseId }).select(
    "status paidAmount offsetAmount"
  );
  if (session) storedQuery.session(session);
  const storedInvoices = await storedQuery.lean();

  const operations = storedInvoices
    .map((stored) => {
      const invoice = existingById.get(toIdString(stored._id));
      if (!invoice) return null;

      const paidAmount = roundCurrency(invoice.paidAmount);
      const offsetAmount = roundCurrency(invoice.offsetAmount);
      const currentPaid = roundCurrency(stored.paidAmount);
      const currentOffset = roundCurrency(stored.offsetAmount);

      if (
        currentPaid === paidAmount &&
        currentOffset === offsetAmount &&
        stored.status === invoice.status
      ) {
        return null;
      }

      return {
        updateOne: {
          filter: { _id: stored._id, house: houseId },
          update: { $set: { paidAmount, offsetAmount, status: invoice.status } },
        },
      };
    })
    .filter(Boolean);

  if (operations.length > 0) {
    await Invoice.bulkWrite(
      operations,
      session ? { session, ordered: false } : { ordered: false }
    );
  }

  return snapshot;
};

export const approveSettlementPayment = async ({
  paymentId,
  houseId,
  adminId,
  session,
  paymentModel = Payment,
}) => {
  return paymentModel.findOneAndUpdate(
    {
      _id: paymentId,
      house: houseId,
      transactionType: "settlement",
      status: "pending",
    },
    { $set: { status: "approved", approvedBy: adminId } },
    { new: true, ...(session ? { session } : {}) }
  );
};
