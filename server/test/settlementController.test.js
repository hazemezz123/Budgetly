import test from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";

import {
  getSettlements,
  createSettlementRequest,
  approveSettlement,
} from "../controllers/settlementController.js";
import User from "../models/User.js";
import Expense from "../models/Expense.js";
import Invoice from "../models/Invoice.js";
import Payment from "../models/Payment.js";
import House from "../models/House.js";
import { getSettlementSnapshot } from "../services/settlementService.js";

const houseId = new mongoose.Types.ObjectId();
const debtorId = new mongoose.Types.ObjectId();
const creditorId = new mongoose.Types.ObjectId();
const adminId = new mongoose.Types.ObjectId();

const originalUserFind = User.find;
const originalUserFindOne = User.findOne;
const originalExpenseFind = Expense.find;
const originalInvoiceFind = Invoice.find;
const originalPaymentFind = Payment.find;
const originalPaymentFindOne = Payment.findOne;
const originalPaymentFindOneAndUpdate = Payment.findOneAndUpdate;
const originalPaymentCreate = Payment.create;
const originalHouseFindOneAndUpdate = House.findOneAndUpdate;
const originalHouseUpdateOne = House.updateOne;
const originalStartSession = mongoose.startSession;
const originalInvoiceBulkWrite = Invoice.bulkWrite;

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

const chain = (result) => ({
  select() {
    return { lean: async () => result };
  },
});

const leanResult = (result) => ({
  lean: async () => result,
});

const fullChain = (result) => {
  const chain = {
    populate() {
      return chain;
    },
    sort() {
      return chain;
    },
    limit() {
      return chain;
    },
    select() {
      return chain;
    },
    lean: async () => result,
  };
  return chain;
};

const settlementChain = (getResult, waitFor = null) => {
  const chain = {
    select() {
      return chain;
    },
    session() {
      return chain;
    },
    lean: async () => {
      if (waitFor) await waitFor;
      return getResult();
    },
  };
  return chain;
};

const createDeferred = () => {
  let resolve;
  const promise = new Promise((done) => {
    resolve = done;
  });
  return { promise, resolve };
};

const installSettlementLock = () => {
  let lock = null;

  House.findOneAndUpdate = (filter, update) => {
    const now = Date.now();
    if (lock && lock.expiresAt > now) {
      return { lean: async () => null };
    }

    lock = {
      owner: update.$set["settlementLock.owner"],
      expiresAt: update.$set["settlementLock.expiresAt"].getTime(),
    };
    return { lean: async () => ({ _id: houseId }) };
  };

  House.updateOne = async (filter) => {
    if (lock && lock.owner === filter["settlementLock.owner"]) {
      lock = null;
    }
    return { modifiedCount: 1 };
  };

  return {
    isLocked: () => Boolean(lock),
  };
};

const runCompetingApprovals = async ({ transactional }) => {
  const settlementAId = new mongoose.Types.ObjectId();
  const settlementBId = new mongoose.Types.ObjectId();
  const users = [
    { _id: debtorId, name: "Debtor", username: "debtor" },
    { _id: creditorId, name: "Creditor", username: "creditor" },
    { _id: adminId, name: "Admin", username: "admin" },
  ];
  const expenses = [
    {
      _id: "expense-1",
      house: houseId,
      status: "approved",
      paidBy: creditorId,
      createdBy: creditorId,
      totalAmount: 100,
    },
  ];
  const invoices = [
    {
      _id: "invoice-1",
      house: houseId,
      user: debtorId,
      expense: "expense-1",
      amount: 100,
      status: "pending",
      paidAmount: 0,
      offsetAmount: 0,
    },
  ];
  const payments = new Map(
    [settlementAId, settlementBId].map((id) => [
      id.toString(),
      {
        _id: id,
        house: houseId,
        user: debtorId,
        recipient: creditorId,
        amount: 100,
        status: "pending",
        transactionType: "settlement",
        description: "Settlement to Creditor",
        createdAt: new Date(),
      },
    ])
  );

  const bothValidated = createDeferred();
  let snapshotCalls = 0;
  let initialValidations = 0;

  User.find = () => settlementChain(() => users);
  Expense.find = () => settlementChain(() => expenses);
  Invoice.find = () => settlementChain(() => invoices);
  Payment.find = () => {
    const snapshotCall = snapshotCalls;
    snapshotCalls += 1;

    if (snapshotCall < 2) {
      initialValidations += 1;
      if (initialValidations === 2) {
        bothValidated.resolve();
      }
      return settlementChain(
        () => [...payments.values()],
        bothValidated.promise
      );
    }

    return settlementChain(() => [...payments.values()]);
  };

  Payment.findOne = (query) => ({
    lean: async () => {
      const id = query._id?.toString?.() || query._id;
      return payments.get(id) || null;
    },
  });
  Payment.findOneAndUpdate = async (query, update) => {
    const id = query._id?.toString?.() || query._id;
    const payment = payments.get(id);
    if (!payment || payment.status !== "pending") {
      return null;
    }

    const next = { ...payment, ...update.$set };
    payments.set(id, next);
    return next;
  };
  Invoice.bulkWrite = async () => ({ modifiedCount: 0 });
  installSettlementLock();

  if (transactional) {
    mongoose.startSession = async () => ({
      withTransaction: async (work) => work(),
      endSession: async () => {},
    });
    Object.defineProperty(mongoose.connection, "readyState", {
      value: 1,
      configurable: true,
    });
  } else {
    Object.defineProperty(mongoose.connection, "readyState", {
      value: 0,
      configurable: true,
    });
  }

  const request = (id) => ({
    params: { id: id.toString() },
    user: { id: adminId, house: houseId, role: "admin" },
  });
  const responseA = createRes();
  const responseB = createRes();

  await Promise.all([
    approveSettlement(request(settlementAId), responseA),
    approveSettlement(request(settlementBId), responseB),
  ]);

  const snapshot = await getSettlementSnapshot(houseId);

  return {
    initialValidations,
    responses: [responseA, responseB],
    settlements: [...payments.values()],
    snapshot,
  };
};

const assertCompetingApprovalsStayConsistent = (result) => {
  const statusCodes = result.responses
    .map((response) => response.statusCode)
    .sort((a, b) => a - b);
  const approved = result.settlements.filter(
    (settlement) => settlement.status === "approved"
  );
  const rejected = result.settlements.filter(
    (settlement) => settlement.status === "rejected"
  );

  assert.equal(result.initialValidations, 2);
  assert.deepEqual(statusCodes, [200, 409]);
  assert.equal(approved.length, 1);
  assert.equal(rejected.length, 1);
  assert.equal(approved[0].amount, 100);
  assert.equal(rejected[0].amount, 100);

  const balances = result.snapshot.balancesByUserId;
  assert.equal(balances[debtorId].balance, 0);
  assert.equal(balances[creditorId].balance, 0);
  assert.equal(balances[debtorId].invoicesAssigned, 0);
  assert.equal(balances[creditorId].invoicesAssigned, 0);
  assert.equal(
    Object.values(balances).reduce((sum, entry) => sum + entry.balance, 0),
    0
  );
};

const buildHouseData = () => {
  const users = [
    { _id: debtorId, name: "Debtor", username: "debtor" },
    { _id: creditorId, name: "Creditor", username: "creditor" },
    { _id: adminId, name: "Admin", username: "admin" },
  ];
  const expenses = [
    {
      _id: "expense-1",
      house: houseId,
      status: "approved",
      paidBy: creditorId,
      createdBy: creditorId,
      totalAmount: 100,
    },
  ];
  const invoices = [
    {
      _id: "invoice-1",
      house: houseId,
      user: debtorId,
      expense: "expense-1",
      amount: 100,
      status: "pending",
    },
  ];

  User.find = () => chain(users);
  Expense.find = () => chain(expenses);
  Invoice.find = () => chain(invoices);
  Payment.find = () => chain([]);
  User.findOne = () => ({
    select: () => ({
      lean: async () => ({
        _id: creditorId,
        name: "Creditor",
        username: "creditor",
      }),
    }),
  });

  return { users, expenses, invoices };
};

const createRequest = (overrides = {}) => ({
  user: { id: debtorId, house: houseId, role: "user" },
  body: { creditorId: creditorId.toString(), amount: 100 },
  ...overrides,
});

test.afterEach(() => {
  User.find = originalUserFind;
  User.findOne = originalUserFindOne;
  Expense.find = originalExpenseFind;
  Invoice.find = originalInvoiceFind;
  Payment.find = originalPaymentFind;
  Payment.findOne = originalPaymentFindOne;
  Payment.findOneAndUpdate = originalPaymentFindOneAndUpdate;
  Payment.create = originalPaymentCreate;
  House.findOneAndUpdate = originalHouseFindOneAndUpdate;
  House.updateOne = originalHouseUpdateOne;
  mongoose.startSession = originalStartSession;
  Invoice.bulkWrite = originalInvoiceBulkWrite;
  delete mongoose.connection.readyState;
});

test("a settlement request cannot exceed the current net payable", async () => {
  buildHouseData();
  Payment.findOne = () => leanResult(null);
  let created = false;
  Payment.create = async () => {
    created = true;
    return {};
  };

  const res = createRes();
  await createSettlementRequest(
    createRequest({ body: { creditorId: creditorId.toString(), amount: 150 } }),
    res
  );

  assert.equal(res.statusCode, 400);
  assert.match(res.body.message, /exceed/i);
  assert.equal(created, false);
});

test("a valid partial settlement request is stored as pending", async () => {
  buildHouseData();
  Payment.findOne = () => leanResult(null);
  let createdPayload = null;
  Payment.create = async (payload) => {
    createdPayload = payload;
    return { _id: new mongoose.Types.ObjectId(), ...payload };
  };

  const res = createRes();
  await createSettlementRequest(
    createRequest({ body: { creditorId: creditorId.toString(), amount: 40 } }),
    res
  );

  assert.equal(res.statusCode, 201);
  assert.equal(createdPayload.user, debtorId);
  assert.equal(createdPayload.recipient, creditorId.toString());
  assert.equal(createdPayload.amount, 40);
  assert.equal(createdPayload.status, "pending");
  assert.equal(createdPayload.transactionType, "settlement");
});

test("a second pending settlement for the same pair is rejected", async () => {
  buildHouseData();
  Payment.findOne = () =>
    leanResult({
      _id: "existing",
      status: "pending",
      user: debtorId,
      recipient: creditorId,
    });
  let created = false;
  Payment.create = async () => {
    created = true;
    return {};
  };

  const res = createRes();
  await createSettlementRequest(createRequest(), res);

  assert.equal(res.statusCode, 409);
  assert.match(res.body.message, /already pending/i);
  assert.equal(created, false);
});

test("getSettlements returns payables and pending requests for the current member", async () => {
  const users = [
    { _id: debtorId, name: "Debtor", username: "debtor" },
    { _id: creditorId, name: "Creditor", username: "creditor" },
  ];
  const pendingSettlement = {
    _id: new mongoose.Types.ObjectId(),
    house: houseId,
    user: { _id: debtorId, name: "Debtor", username: "debtor" },
    recipient: { _id: creditorId, name: "Creditor", username: "creditor" },
    amount: 100,
    status: "pending",
    transactionType: "settlement",
    description: "Settlement to Creditor",
    createdAt: new Date(),
  };

  User.find = () => fullChain(users);
  Expense.find = () =>
    fullChain([
      {
        _id: "expense-1",
        house: houseId,
        status: "approved",
        paidBy: creditorId,
        createdBy: creditorId,
        totalAmount: 100,
      },
    ]);
  Invoice.find = () =>
    fullChain([
      {
        _id: "invoice-1",
        house: houseId,
        user: debtorId,
        expense: "expense-1",
        amount: 100,
        status: "pending",
      },
    ]);
  Payment.find = (query) => {
    if (query.status === "pending") return fullChain([pendingSettlement]);
    if (query.status?.$ne === "pending") return fullChain([]);
    return fullChain([pendingSettlement]);
  };

  const res = createRes();
  await getSettlements(
    {
      user: { id: debtorId, house: houseId, role: "user" },
    },
    res
  );

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.netBalance, -100);
  assert.equal(res.body.payables.length, 1);
  assert.equal(res.body.payables[0].userId, creditorId.toString());
  assert.equal(res.body.payables[0].name, "Creditor");
  assert.equal(res.body.pendingRequests.length, 1);
  assert.equal(res.body.pendingRequests[0].direction, "outgoing");
  assert.equal(res.body.pendingRequests[0].recipient.name, "Creditor");
  assert.equal(res.body.history.length, 0);
  assert.equal(res.body.plan, undefined);
});

test(
  "two distinct settlement approvals competing for one debt cannot overcharge on the standalone fallback",
  { timeout: 5000 },
  async () => {
    const result = await runCompetingApprovals({ transactional: false });
    assertCompetingApprovalsStayConsistent(result);
  }
);

test(
  "two distinct settlement approvals competing for one debt cannot overcharge in the transaction path",
  { timeout: 5000 },
  async () => {
    const result = await runCompetingApprovals({ transactional: true });
    assertCompetingApprovalsStayConsistent(result);
  }
);

test("approving the same settlement twice is rejected atomically", async () => {
  buildHouseData();
  installSettlementLock();
  const settlementId = new mongoose.Types.ObjectId();
  const pendingPayment = {
    _id: settlementId,
    house: houseId,
    user: debtorId,
    recipient: creditorId,
    amount: 100,
    status: "pending",
    transactionType: "settlement",
  };

  Payment.findOne = () => leanResult(pendingPayment);
  let approvalCalls = 0;
  Payment.findOneAndUpdate = async (query) => {
    approvalCalls += 1;
    assert.equal(query.status, "pending");
    return approvalCalls === 1
      ? { ...pendingPayment, status: "approved", approvedBy: adminId }
      : null;
  };

  const adminReq = {
    params: { id: settlementId.toString() },
    user: { id: adminId, house: houseId, role: "admin" },
  };

  const firstRes = createRes();
  await approveSettlement(adminReq, firstRes);
  assert.equal(firstRes.statusCode, 200);
  assert.equal(firstRes.body.settlement.status, "approved");

  const secondRes = createRes();
  await approveSettlement(adminReq, secondRes);
  assert.equal(secondRes.statusCode, 409);
  assert.equal(approvalCalls, 2);
});
