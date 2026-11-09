import mongoose from "mongoose";
import Invoice from "../models/Invoice.js";
import Payment from "../models/Payment.js";
import User from "../models/User.js";
import {
  getSettlementSnapshot,
  reconcileHouseInvoices,
  roundCurrency,
} from "../services/settlementService.js";

const reconcileSafely = async (houseId) => {
  try {
    await reconcileHouseInvoices(houseId);
  } catch (error) {
    console.error("Invoice reconciliation failed:", error.message);
  }
};

const getLiveSettlementSnapshot = async (houseId) => {
  if (mongoose.connection.readyState !== 1) return null;
  return getSettlementSnapshot(houseId);
};

const getInvoiceCreditorId = (snapshot, invoice) => {
  if (!snapshot || !invoice.expense) return null;
  return snapshot.approvedExpensePayerById.get(String(invoice.expense)) || null;
};

const getNetPayable = (snapshot, debtorId, creditorId) => {
  if (!snapshot || !debtorId || !creditorId) return 0;
  const transfer = snapshot.transfers.find(
    (entry) =>
      entry.fromUserId === String(debtorId) &&
      entry.toUserId === String(creditorId)
  );
  return transfer ? transfer.amount : 0;
};

const isWithinNetDebt = (snapshot, debtorId, creditorId, amount) => {
  if (!snapshot) return true;
  return (
    Boolean(creditorId) &&
    Number(amount) <= getNetPayable(snapshot, debtorId, creditorId) + 0.005
  );
};

const withRemainingAmount = (invoice) => ({
  ...invoice,
  remainingAmount: Math.max(
    0,
    roundCurrency(
      Number(invoice.amount || 0) -
        Number(invoice.paidAmount || 0) -
        Number(invoice.offsetAmount || 0)
    )
  ),
});

// Get invoices for the logged in user
export const getMyInvoices = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("house").lean();
    if (!user || !user.house) {
      return res.status(400).json({ message: "User not in a house" });
    }

    const invoices = await Invoice.find({
      user: req.user.id,
      house: user.house,
    })
      .populate({
        path: "expense",
        select: "description category date createdBy paidBy",
        populate: { path: "paidBy", select: "name username" },
      })
      .sort({ createdAt: -1 })
      .lean();

    res.json(invoices.map(withRemainingAmount));
  } catch (error) {
    console.error("Get my invoices error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all invoices (Admin only)
export const getAllInvoices = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("house").lean();
    if (!user || !user.house) {
      return res.status(400).json({ message: "User not in a house" });
    }

    const invoices = await Invoice.find({
      house: user.house,
    })
      .populate("user", "name username")
      .populate({
        path: "expense",
        select: "description category date paidBy",
        populate: { path: "paidBy", select: "name username" },
      })
      .populate({
        path: "paymentRequest",
        populate: { path: "recordedBy", select: "name" },
      })
      .sort({ createdAt: -1 })
      .lean();

    res.json(invoices.map(withRemainingAmount));
  } catch (error) {
    console.error("Get all invoices error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// User pays an invoice (Creates Payment Request)
export const payInvoice = async (req, res) => {
  try {
    const invoiceId = req.params.id;
    const invoice = await Invoice.findById(invoiceId);

    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    if (!req.user.house) {
      return res.status(400).json({ message: "User not in a house" });
    }

    if (invoice.house.toString() !== req.user.house.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to pay this invoice" });
    }

    if (invoice.user.toString() !== req.user.id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to pay this invoice" });
    }

    const remainingAmount = roundCurrency(
      Number(invoice.amount || 0) -
        Number(invoice.paidAmount || 0) -
        Number(invoice.offsetAmount || 0)
    );

    if (remainingAmount <= 0.005) {
      return res.status(400).json({
        message: "Invoice is fully offset or settled and cannot be paid",
      });
    }

    if (!["pending", "partially_paid"].includes(invoice.status)) {
      return res.status(400).json({ message: "Invoice is not pending" });
    }

    if (invoice.paymentRequest) {
      return res
        .status(400)
        .json({ message: "Payment request already exists" });
    }

    const settlementSnapshot = await getLiveSettlementSnapshot(invoice.house);
    if (
      settlementSnapshot &&
      !isWithinNetDebt(
        settlementSnapshot,
        invoice.user,
        getInvoiceCreditorId(settlementSnapshot, invoice),
        remainingAmount
      )
    ) {
      return res.status(409).json({
        message:
          "Outstanding net debt is lower than this invoice amount. Use net settlement instead.",
      });
    }

    const isAdmin = req.user.role === "admin";
    const paymentStatus = isAdmin ? "approved" : "pending";
    const invoiceStatus = isAdmin ? "paid" : "awaiting_approval";

    // Create Payment Record (Approved immediately if Admin, Pending if Member)
    const payment = await Payment.create({
      user: req.user.id,
      amount: remainingAmount,
      description: `Payment for Invoice: ${invoice.description}`,
      status: paymentStatus,
      transactionType: "payment",
      recordedBy: req.user.id,
      ...(isAdmin ? { approvedBy: req.user.id } : {}),
      house: invoice.house,
      // We could add `linkedInvoice` to Payment model if we wanted bidirectionality
    });

    // Update Invoice
    invoice.status = invoiceStatus;
    if (isAdmin) {
      invoice.paidAmount = roundCurrency(
        Number(invoice.paidAmount || 0) + remainingAmount
      );
    }
    invoice.paymentRequest = payment._id;
    await invoice.save();
    await reconcileSafely(invoice.house);

    res.json(invoice);
  } catch (error) {
    console.error("Pay invoice error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Admin approves invoice payment
export const approveInvoicePayment = async (req, res) => {
  try {
    const invoiceId = req.params.id;
    const invoice = await Invoice.findById(invoiceId).populate(
      "paymentRequest"
    );

    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    if (!req.user.house || invoice.house.toString() !== req.user.house.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to approve this invoice" });
    }

    if (invoice.status !== "awaiting_approval" || !invoice.paymentRequest) {
      return res
        .status(400)
        .json({ message: "Invoice is not awaiting approval" });
    }

    const settlementSnapshot = await getLiveSettlementSnapshot(invoice.house);
    if (
      settlementSnapshot &&
      !isWithinNetDebt(
        settlementSnapshot,
        invoice.user,
        getInvoiceCreditorId(settlementSnapshot, invoice),
        invoice.paymentRequest.amount
      )
    ) {
      return res.status(409).json({
        message:
          "Outstanding net debt changed. Ask the member to use net settlement.",
      });
    }

    // Approve the underlying Payment
    const payment = await Payment.findById(invoice.paymentRequest._id);
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }
    if (payment) {
      payment.status = "approved";
      payment.approvedBy = req.user.id;
      await payment.save();
    }

    // Update Invoice
    invoice.status = "paid";
    if (Number.isFinite(Number(invoice.amount))) {
      invoice.paidAmount = Math.min(
        Number(invoice.amount),
        roundCurrency(
          Number(invoice.paidAmount || 0) + Number(payment.amount || 0)
        )
      );
    }
    await invoice.save();
    await reconcileSafely(invoice.house);

    res.json(invoice);
  } catch (error) {
    console.error("Approve invoice error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Admin approves all waiting invoices for a selected user
export const approveAllUserInvoices = async (req, res) => {
  try {
    if (!req.user.house) {
      return res.status(400).json({ message: "User not in a house" });
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.userId)) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    const targetUser = await User.findById(req.params.userId);
    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!targetUser.house || targetUser.house.toString() !== req.user.house.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to approve invoices for this user" });
    }

    const invoices = await Invoice.find({
      user: req.params.userId,
      house: req.user.house,
      status: "awaiting_approval",
      paymentRequest: { $ne: null },
    });

    if (invoices.length === 0) {
      return res.status(400).json({ message: "No eligible invoices found" });
    }

    const payments = await Promise.all(
      invoices.map((invoice) => Payment.findById(invoice.paymentRequest))
    );

    if (payments.some((payment) => !payment)) {
      return res.status(404).json({ message: "Payment not found" });
    }

    const settlementSnapshot = await getLiveSettlementSnapshot(req.user.house);
    if (settlementSnapshot) {
      const requestedByPair = new Map();
      for (const [index, invoice] of invoices.entries()) {
        const creditorId = getInvoiceCreditorId(settlementSnapshot, invoice);
        if (!creditorId) {
          return res.status(409).json({
            message:
              "Outstanding net debt changed. Ask the member to use net settlement.",
          });
        }
        const key = `${invoice.user}|${creditorId}`;
        requestedByPair.set(
          key,
          (requestedByPair.get(key) || 0) + Number(payments[index].amount || 0)
        );
      }

      for (const [key, requestedAmount] of requestedByPair.entries()) {
        const [debtorId, creditorId] = key.split("|");
        if (
          !isWithinNetDebt(
            settlementSnapshot,
            debtorId,
            creditorId,
            requestedAmount
          )
        ) {
          return res.status(409).json({
            message:
              "Outstanding net debt changed. Ask the member to use net settlement.",
          });
        }
      }
    }

    for (const [index, invoice] of invoices.entries()) {
      const payment = payments[index];
      payment.status = "approved";
      payment.approvedBy = req.user.id;
      await payment.save();

      invoice.status = "paid";
      if (Number.isFinite(Number(invoice.amount))) {
        invoice.paidAmount = Math.min(
          Number(invoice.amount),
          roundCurrency(
            Number(invoice.paidAmount || 0) + Number(payment.amount || 0)
          )
        );
      }
      await invoice.save();
    }

    await reconcileSafely(req.user.house);

    res.json({
      message: `Approved ${invoices.length} invoices successfully`,
      count: invoices.length,
    });
  } catch (error) {
    console.error("Approve all user invoices error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Admin rejects invoice payment
export const rejectInvoicePayment = async (req, res) => {
  try {
    const invoiceId = req.params.id;
    const { reason } = req.body;
    const invoice = await Invoice.findById(invoiceId).populate(
      "paymentRequest"
    );

    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    if (!req.user.house || invoice.house.toString() !== req.user.house.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to reject this invoice" });
    }

    if (invoice.status !== "awaiting_approval") {
      return res
        .status(400)
        .json({ message: "Invoice is not awaiting approval" });
    }

    if (!invoice.paymentRequest) {
      return res
        .status(400)
        .json({ message: "Invoice has no payment request" });
    }

    // Reject Payment
    const payment = await Payment.findById(invoice.paymentRequest._id);
    if (payment) {
      payment.status = "rejected";
      payment.description += ` (Rejected: ${reason || "No reason"})`;
      await payment.save();
    }

    // Reset Invoice to Pending
    invoice.status = "pending";
    invoice.paymentRequest = null; // Clear the failed request so they can try again
    await invoice.save();
    await reconcileSafely(invoice.house);

    res.json(invoice);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// User pays ALL pending invoices
export const payBulkInvoices = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || !user.house) {
      return res.status(400).json({ message: "User not in a house" });
    }

    // Find all invoices with an outstanding balance for this user
    const pendingInvoices = await Invoice.find({
      user: req.user.id,
      house: user.house,
      status: { $in: ["pending", "partially_paid"] },
    });

    const payableInvoices = pendingInvoices
      .map((invoice) => ({
        invoice,
        remainingAmount: roundCurrency(
          Number(invoice.amount || 0) -
            Number(invoice.paidAmount || 0) -
            Number(invoice.offsetAmount || 0)
        ),
      }))
      .filter((entry) => entry.remainingAmount > 0.005);

    if (payableInvoices.length === 0) {
      return res.status(400).json({ message: "No pending invoices found" });
    }

    const settlementSnapshot = await getLiveSettlementSnapshot(user.house);
    if (settlementSnapshot) {
      const requestedByPair = new Map();
      for (const { invoice, remainingAmount } of payableInvoices) {
        const creditorId = getInvoiceCreditorId(settlementSnapshot, invoice);
        if (!creditorId) {
          return res.status(409).json({
            message:
              "Outstanding net debt changed. Use net settlement instead.",
          });
        }
        const key = `${invoice.user}|${creditorId}`;
        requestedByPair.set(
          key,
          (requestedByPair.get(key) || 0) + remainingAmount
        );
      }

      for (const [key, requestedAmount] of requestedByPair.entries()) {
        const [debtorId, creditorId] = key.split("|");
        if (
          !isWithinNetDebt(
            settlementSnapshot,
            debtorId,
            creditorId,
            requestedAmount
          )
        ) {
          return res.status(409).json({
            message:
              "Outstanding net debt changed. Use net settlement instead.",
          });
        }
      }
    }

    const updatedInvoices = [];
    const isAdmin = req.user.role === "admin";
    const paymentStatus = isAdmin ? "approved" : "pending";
    const invoiceStatus = isAdmin ? "paid" : "awaiting_approval";

    // Process each invoice
    // We use a loop to create individual payment requests for better tracking
    for (const { invoice, remainingAmount } of payableInvoices) {
      // Create Payment Record (Approved immediately if Admin, Pending if Member)
      const payment = await Payment.create({
        user: req.user.id,
        amount: remainingAmount,
        description: `Bulk Payment for Invoice: ${invoice.description}`,
        status: paymentStatus,
        transactionType: "payment",
        recordedBy: req.user.id,
        ...(isAdmin ? { approvedBy: req.user.id } : {}),
        house: invoice.house,
      });

      // Update Invoice
      invoice.status = invoiceStatus;
      if (isAdmin) {
        invoice.paidAmount = Math.min(
          Number(invoice.amount || 0),
          roundCurrency(
            Number(invoice.paidAmount || 0) + Number(remainingAmount)
          )
        );
      }
      invoice.paymentRequest = payment._id;
      await invoice.save();
      updatedInvoices.push(invoice);
    }

    await reconcileSafely(user.house);

    res.json({
      message: `Successfully submitted payment requests for ${updatedInvoices.length} invoices`,
      count: updatedInvoices.length,
      invoices: updatedInvoices,
    });
  } catch (error) {
    console.error("Bulk pay error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
