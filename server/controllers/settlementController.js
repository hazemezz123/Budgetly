import mongoose from "mongoose";
import Payment from "../models/Payment.js";
import User from "../models/User.js";
import {
  getSettlementSnapshot,
  reconcileHouseInvoices,
  approveSettlementPayment,
  withSettlementApprovalLock,
  roundCurrency,
} from "../services/settlementService.js";
import { runWithTransaction } from "../utils/transaction.js";

const EPSILON = 0.005;

const toIdString = (value) => {
  if (!value) return null;
  if (typeof value === "string") return value;
  if (value._id) return value._id.toString();
  return value.toString();
};

const publicUser = (user) => {
  if (!user) return null;
  if (typeof user === "string") return { userId: user, name: "", username: "" };
  return {
    userId: user._id || user.userId,
    name: user.name || "",
    username: user.username || "",
  };
};

const findTransfer = (transfers, fromUserId, toUserId) =>
  transfers.find(
    (transfer) =>
      transfer.fromUserId === fromUserId && transfer.toUserId === toUserId
  );

const conflictError = (message) => {
  const error = new Error(message);
  error.status = 409;
  return error;
};

const rejectStaleSettlement = ({ paymentId, houseId, adminId }) =>
  Payment.findOneAndUpdate(
    {
      _id: paymentId,
      house: houseId,
      transactionType: "settlement",
      status: "pending",
    },
    {
      $set: {
        status: "rejected",
        approvedBy: adminId,
        description: "Rejected: outstanding net debt changed",
      },
    },
    { new: true }
  );

const serializeSettlement = (payment, currentUserId) => {
  const senderId = toIdString(payment.user);
  return {
    _id: payment._id,
    amount: payment.amount,
    status: payment.status,
    description: payment.description,
    createdAt: payment.createdAt,
    direction: senderId === currentUserId ? "outgoing" : "incoming",
    user: publicUser(payment.user),
    recipient: publicUser(payment.recipient),
  };
};

export const getSettlements = async (req, res) => {
  try {
    if (!req.user.house) {
      return res.status(400).json({ message: "User not in a house" });
    }

    // Read endpoints repair allocations written by an older flow.
    let snapshot = null;
    try {
      snapshot = await reconcileHouseInvoices(req.user.house);
    } catch (error) {
      console.error("Settlement reconciliation failed:", error.message);
    }
    if (!snapshot) {
      snapshot = await getSettlementSnapshot(req.user.house);
    }
    const currentUserId = toIdString(req.user.id);
    const currentBalance = snapshot.balancesByUserId[currentUserId] || {
      balance: 0,
    };
    const usersById = new Map(
      snapshot.users.map((user) => [toIdString(user._id), user])
    );

    const attachUser = (transfer, key) => ({
      ...transfer,
      ...publicUser(usersById.get(transfer[key])),
      userId: transfer[key],
    });

    const payables = snapshot.transfers
      .filter((transfer) => transfer.fromUserId === currentUserId)
      .map((transfer) => attachUser(transfer, "toUserId"));
    const receivables = snapshot.transfers
      .filter((transfer) => transfer.toUserId === currentUserId)
      .map((transfer) => attachUser(transfer, "fromUserId"));

    const settlementQuery = {
      house: req.user.house,
      transactionType: "settlement",
    };
    if (req.user.role !== "admin") {
      settlementQuery.$or = [
        { user: req.user.id },
        { recipient: req.user.id },
      ];
    }

    const populateSettlement = (query) =>
      query
        .populate("user", "name username")
        .populate("recipient", "name username")
        .sort({ createdAt: -1 })
        .lean();

    const [pendingSettlements, historySettlements] = await Promise.all([
      populateSettlement(
        Payment.find({ ...settlementQuery, status: "pending" })
      ),
      populateSettlement(
        Payment.find({ ...settlementQuery, status: { $ne: "pending" } }).limit(
          50
        )
      ),
    ]);

    const serialized = [...pendingSettlements, ...historySettlements].map(
      (payment) => serializeSettlement(payment, currentUserId)
    );

    res.json({
      netBalance: roundCurrency(currentBalance.balance),
      payables,
      receivables,
      pendingRequests: serialized.filter(
        (payment) => payment.status === "pending"
      ),
      history: serialized.filter(
        (payment) => payment.status !== "pending"
      ),
      ...(req.user.role === "admin"
        ? { plan: snapshot.transfers }
        : {}),
    });
  } catch (error) {
    console.error("Get settlements error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const createSettlementRequest = async (req, res) => {
  try {
    if (!req.user.house) {
      return res.status(400).json({ message: "User not in a house" });
    }

    const creditorId = toIdString(req.body.creditorId);
    if (!creditorId || !mongoose.Types.ObjectId.isValid(creditorId)) {
      return res.status(400).json({ message: "Invalid creditor id" });
    }

    if (creditorId === toIdString(req.user.id)) {
      return res.status(400).json({ message: "Cannot settle with yourself" });
    }

    const creditor = await User.findOne({
      _id: creditorId,
      house: req.user.house,
      isActive: true,
    })
      .select("name username")
      .lean();

    if (!creditor) {
      return res.status(404).json({ message: "Creditor not found" });
    }

    const snapshot = await getSettlementSnapshot(req.user.house);
    const payable = findTransfer(
      snapshot.transfers,
      toIdString(req.user.id),
      creditorId
    );

    if (!payable || payable.amount <= EPSILON) {
      return res
        .status(400)
        .json({ message: "No outstanding net debt to this member" });
    }

    const requestedAmount =
      req.body.amount == null
        ? payable.amount
        : roundCurrency(Number(req.body.amount));

    if (!Number.isFinite(requestedAmount) || requestedAmount <= 0) {
      return res.status(400).json({ message: "Invalid settlement amount" });
    }

    if (requestedAmount > payable.amount + EPSILON) {
      return res
        .status(400)
        .json({ message: "Settlement exceeds the outstanding net debt" });
    }

    const existingPending = await Payment.findOne({
      house: req.user.house,
      user: req.user.id,
      recipient: creditorId,
      transactionType: "settlement",
      status: "pending",
    }).lean();

    if (existingPending) {
      return res
        .status(409)
        .json({ message: "A settlement request is already pending" });
    }

    const isAdmin = req.user.role === "admin";
    const payment = await Payment.create({
      user: req.user.id,
      recipient: creditorId,
      amount: requestedAmount,
      description: `Settlement to ${creditor.name || creditor.username || "member"}`,
      status: isAdmin ? "approved" : "pending",
      transactionType: "settlement",
      recordedBy: req.user.id,
      ...(isAdmin ? { approvedBy: req.user.id } : {}),
      house: req.user.house,
    });

    if (isAdmin) {
      await reconcileHouseInvoices(req.user.house);
    }

    res.status(201).json({
      message: isAdmin
        ? "Settlement recorded successfully"
        : "Settlement request sent for approval",
      settlement: payment,
    });
  } catch (error) {
    console.error("Create settlement error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const approveSettlement = async (req, res) => {
  try {
    if (!req.user.house) {
      return res.status(400).json({ message: "User not in a house" });
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid settlement id" });
    }

    const payment = await Payment.findOne({
      _id: req.params.id,
      house: req.user.house,
      transactionType: "settlement",
    }).lean();

    if (!payment) {
      return res.status(404).json({ message: "Settlement not found" });
    }

    if (payment.status !== "pending") {
      return res
        .status(409)
        .json({ message: "Settlement is not awaiting approval" });
    }

    const snapshot = await getSettlementSnapshot(req.user.house);
    const payable = findTransfer(
      snapshot.transfers,
      toIdString(payment.user),
      toIdString(payment.recipient)
    );

    if (!payable || payment.amount > payable.amount + 0.01) {
      return res.status(409).json({
        message:
          "Outstanding net debt changed. Ask the member to submit a new request.",
      });
    }

    const approved = await withSettlementApprovalLock(
      req.user.house,
      async () => {
        // Re-read after acquiring the lock: another approval may have
        // committed while this request was waiting for its turn.
        const lockedPayment = await Payment.findOne({
          _id: req.params.id,
          house: req.user.house,
          transactionType: "settlement",
        }).lean();

        if (!lockedPayment || lockedPayment.status !== "pending") {
          throw conflictError("Settlement already processed");
        }

        const lockedSnapshot = await getSettlementSnapshot(req.user.house);
        const lockedPayable = findTransfer(
          lockedSnapshot.transfers,
          toIdString(lockedPayment.user),
          toIdString(lockedPayment.recipient)
        );

        if (
          !lockedPayable ||
          lockedPayment.amount > lockedPayable.amount + 0.01
        ) {
          await rejectStaleSettlement({
            paymentId: req.params.id,
            houseId: req.user.house,
            adminId: req.user.id,
          });
          throw conflictError(
            "Outstanding net debt changed. The request was rejected."
          );
        }

        return runWithTransaction(async (session) => {
          const result = await approveSettlementPayment({
            paymentId: req.params.id,
            houseId: req.user.house,
            adminId: req.user.id,
            session,
          });

          if (!result) {
            throw conflictError("Settlement already processed");
          }

          await reconcileHouseInvoices(req.user.house, { session });
          return result;
        });
      }
    );

    res.json({
      message: "Settlement approved successfully",
      settlement: approved,
    });
  } catch (error) {
    if (error.status === 409) {
      return res.status(409).json({ message: error.message });
    }
    console.error("Approve settlement error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const rejectSettlement = async (req, res) => {
  try {
    if (!req.user.house) {
      return res.status(400).json({ message: "User not in a house" });
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid settlement id" });
    }

    const reason = req.body.reason;
    const payment = await Payment.findOneAndUpdate(
      {
        _id: req.params.id,
        house: req.user.house,
        transactionType: "settlement",
        status: "pending",
      },
      {
        $set: {
          status: "rejected",
          approvedBy: req.user.id,
          ...(reason
            ? { description: `Rejected: ${reason}` }
            : {}),
        },
      },
      { new: true }
    );

    if (!payment) {
      return res
        .status(409)
        .json({ message: "Settlement is not awaiting approval" });
    }

    res.json({
      message: "Settlement rejected",
      settlement: payment,
    });
  } catch (error) {
    console.error("Reject settlement error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
