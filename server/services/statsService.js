import Expense from "../models/Expense.js";
import Payment from "../models/Payment.js";
import Invoice from "../models/Invoice.js";
import User from "../models/User.js";
import { buildSettlementSnapshot } from "./settlementService.js";

export const buildHouseBalanceSnapshot = ({
  users,
  expenses,
  invoices,
  payments,
}) => {
  const snapshot = buildSettlementSnapshot({
    users,
    expenses,
    invoices,
    payments,
  });

  return {
    balancesByUserId: snapshot.balancesByUserId,
    approvedExpensePayerById: snapshot.approvedExpensePayerById,
    approvedPaymentAmountById: snapshot.approvedPaymentAmountById,
  };
};

export const getHouseStatsSnapshot = async (
  houseId,
  { recentExpenseUserId, recentActivity } = {}
) => {
  // All queries are independent - run them in a single concurrent batch
  const queries = [
    User.find({ isActive: true, house: houseId })
      .select("name username house")
      .lean(),
    Expense.find({ house: houseId })
      .select("totalAmount status paidBy createdBy category house")
      .lean(),
    Invoice.find({ house: houseId })
      .select(
        "user expense amount status paymentRequest paidAmount offsetAmount createdAt"
      )
      .lean(),
    Payment.find({ house: houseId })
      .select(
        "user recipient amount status transactionType approvedBy createdAt"
      )
      .lean(),
  ];

  let recentExpenses = null;
  if (recentExpenseUserId) {
    queries.push(
      Expense.find({
        house: houseId,
        "splits.user": recentExpenseUserId,
      })
        .sort({ createdAt: -1 })
        .limit(5)
        .lean()
    );
  }

  let recentInvoices = null;
  let recentPayments = null;
  if (recentActivity) {
    queries.push(
      Invoice.find({ house: houseId }).sort({ createdAt: -1 }).limit(10).lean()
    );
    queries.push(
      Payment.find({ house: houseId }).sort({ createdAt: -1 }).limit(10).lean()
    );
  }

  const results = await Promise.all(queries);
  let idx = 4;
  if (recentExpenseUserId) {
    recentExpenses = results[idx++];
  }
  if (recentActivity) {
    recentInvoices = results[idx++];
    recentPayments = results[idx++];
  }

  return {
    users: results[0],
    expenses: results[1],
    invoices: results[2],
    payments: results[3],
    ...(recentExpenseUserId ? { recentExpenses } : {}),
    ...(recentActivity ? { recentInvoices, recentPayments } : {}),
    ...buildHouseBalanceSnapshot({
      users: results[0],
      expenses: results[1],
      invoices: results[2],
      payments: results[3],
    }),
  };
};
