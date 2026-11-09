import test from "node:test";
import assert from "node:assert/strict";

import {
  buildSettlementSnapshot,
  approveSettlementPayment,
} from "../services/settlementService.js";

const houseId = "house-1";
const userA = "user-a";
const userB = "user-b";
const userC = "user-c";
const userD = "user-d";
const userE = "user-e";

const buildUsers = (...ids) =>
  ids.map((id) => ({ _id: id, name: id, username: id }));

const expense = (id, paidBy, totalAmount) => ({
  _id: id,
  house: houseId,
  status: "approved",
  paidBy,
  createdBy: paidBy,
  totalAmount,
  category: "General",
});

const invoice = ({
  id,
  user,
  expenseId,
  amount,
  status = "pending",
  paymentRequest,
}) => ({
  _id: id,
  house: houseId,
  user,
  expense: expenseId,
  amount,
  status,
  ...(paymentRequest ? { paymentRequest } : {}),
});

const allocationFor = (snapshot, invoiceId) =>
  snapshot.invoices.find((item) => item._id === invoiceId);

const transferTotalFrom = (snapshot, userId) =>
  snapshot.transfers
    .filter((transfer) => transfer.fromUserId === userId)
    .reduce((sum, transfer) => sum + transfer.amount, 0);

const transferTotalTo = (snapshot, userId) =>
  snapshot.transfers
    .filter((transfer) => transfer.toUserId === userId)
    .reduce((sum, transfer) => sum + transfer.amount, 0);

test("mutual 100/100 expenses net to zero and offset all invoices", () => {
  const snapshot = buildSettlementSnapshot({
    users: buildUsers(userA, userB),
    expenses: [
      expense("expense-a", userA, 100),
      expense("expense-b", userB, 100),
    ],
    invoices: [
      invoice({
        id: "a-own",
        user: userA,
        expenseId: "expense-a",
        amount: 50,
        status: "paid",
      }),
      invoice({
        id: "b-owes-a",
        user: userB,
        expenseId: "expense-a",
        amount: 50,
      }),
      invoice({
        id: "b-own",
        user: userB,
        expenseId: "expense-b",
        amount: 50,
        status: "paid",
      }),
      invoice({
        id: "a-owes-b",
        user: userA,
        expenseId: "expense-b",
        amount: 50,
      }),
    ],
    payments: [],
  });

  assert.equal(snapshot.balancesByUserId[userA].balance, 0);
  assert.equal(snapshot.balancesByUserId[userB].balance, 0);
  assert.equal(snapshot.balancesByUserId[userA].invoicesAssigned, 0);
  assert.equal(snapshot.balancesByUserId[userB].invoicesAssigned, 0);
  assert.deepEqual(snapshot.transfers, []);

  assert.equal(allocationFor(snapshot, "b-owes-a").status, "offset");
  assert.equal(allocationFor(snapshot, "b-owes-a").offsetAmount, 50);
  assert.equal(allocationFor(snapshot, "a-owes-b").status, "offset");
  assert.equal(allocationFor(snapshot, "a-owes-b").offsetAmount, 50);
});

test("one-sided 100 expense leaves the non-payer with a 50 debt", () => {
  const snapshot = buildSettlementSnapshot({
    users: buildUsers(userA, userB),
    expenses: [expense("expense-a", userA, 100)],
    invoices: [
      invoice({
        id: "a-own",
        user: userA,
        expenseId: "expense-a",
        amount: 50,
        status: "paid",
      }),
      invoice({
        id: "b-owes-a",
        user: userB,
        expenseId: "expense-a",
        amount: 50,
      }),
    ],
    payments: [],
  });

  assert.equal(snapshot.balancesByUserId[userA].balance, 50);
  assert.equal(snapshot.balancesByUserId[userB].balance, -50);
  assert.equal(snapshot.balancesByUserId[userB].invoicesAssigned, 50);
  assert.deepEqual(snapshot.transfers, [
    { fromUserId: userB, toUserId: userA, amount: 50 },
  ]);

  const invoiceAllocation = allocationFor(snapshot, "b-owes-a");
  assert.equal(invoiceAllocation.status, "pending");
  assert.equal(invoiceAllocation.remainingAmount, 50);
  assert.equal(invoiceAllocation.offsetAmount, 0);
});

test("three-member circular debt is fully offset with no settlement", () => {
  const snapshot = buildSettlementSnapshot({
    users: buildUsers(userA, userB, userC),
    expenses: [
      expense("expense-a", userA, 30),
      expense("expense-b", userB, 30),
      expense("expense-c", userC, 30),
    ],
    invoices: [
      invoice({
        id: "b-owes-a",
        user: userB,
        expenseId: "expense-a",
        amount: 30,
      }),
      invoice({
        id: "c-owes-b",
        user: userC,
        expenseId: "expense-b",
        amount: 30,
      }),
      invoice({
        id: "a-owes-c",
        user: userA,
        expenseId: "expense-c",
        amount: 30,
      }),
    ],
    payments: [],
  });

  for (const userId of [userA, userB, userC]) {
    assert.equal(snapshot.balancesByUserId[userId].balance, 0);
    assert.equal(snapshot.balancesByUserId[userId].invoicesAssigned, 0);
  }
  assert.deepEqual(snapshot.transfers, []);

  for (const invoiceId of ["b-owes-a", "c-owes-b", "a-owes-c"]) {
    assert.equal(allocationFor(snapshot, invoiceId).status, "offset");
    assert.equal(allocationFor(snapshot, invoiceId).offsetAmount, 30);
  }
});

test("five members with multiple debtors and creditors get a complete plan", () => {
  const snapshot = buildSettlementSnapshot({
    users: buildUsers(userA, userB, userC, userD, userE),
    expenses: [
      expense("expense-e", userE, 200),
      expense("expense-a", userA, 100),
      expense("expense-b", userB, 100),
      expense("expense-c", userC, 50),
      expense("expense-d", userD, 50),
    ],
    invoices: [
      invoice({
        id: "a-owes-e",
        user: userA,
        expenseId: "expense-e",
        amount: 50,
      }),
      invoice({
        id: "b-owes-e",
        user: userB,
        expenseId: "expense-e",
        amount: 50,
      }),
      invoice({
        id: "c-owes-e",
        user: userC,
        expenseId: "expense-e",
        amount: 50,
      }),
      invoice({
        id: "d-owes-e",
        user: userD,
        expenseId: "expense-e",
        amount: 50,
      }),
      invoice({
        id: "c-owes-a",
        user: userC,
        expenseId: "expense-a",
        amount: 100,
      }),
      invoice({
        id: "d-owes-b",
        user: userD,
        expenseId: "expense-b",
        amount: 100,
      }),
      invoice({
        id: "e-owes-c",
        user: userE,
        expenseId: "expense-c",
        amount: 50,
      }),
      invoice({
        id: "a-owes-d",
        user: userA,
        expenseId: "expense-d",
        amount: 50,
      }),
    ],
    payments: [],
  });

  assert.equal(snapshot.balancesByUserId[userA].balance, 0);
  assert.equal(snapshot.balancesByUserId[userB].balance, 50);
  assert.equal(snapshot.balancesByUserId[userC].balance, -100);
  assert.equal(snapshot.balancesByUserId[userD].balance, -100);
  assert.equal(snapshot.balancesByUserId[userE].balance, 150);

  assert.equal(transferTotalFrom(snapshot, userC), 100);
  assert.equal(transferTotalFrom(snapshot, userD), 100);
  assert.equal(transferTotalTo(snapshot, userE), 150);
  assert.equal(transferTotalTo(snapshot, userB), 50);

  const totalTransferred = snapshot.transfers.reduce(
    (sum, transfer) => sum + transfer.amount,
    0
  );
  assert.equal(totalTransferred, 200);

  for (const transfer of snapshot.transfers) {
    assert.ok(transfer.amount > 0);
    assert.ok(snapshot.balancesByUserId[transfer.fromUserId].balance < 0);
    assert.ok(snapshot.balancesByUserId[transfer.toUserId].balance > 0);
  }

  const partiallyOffset = allocationFor(snapshot, "d-owes-b");
  assert.equal(partiallyOffset.status, "partially_paid");
  assert.equal(partiallyOffset.offsetAmount, 50);
  assert.equal(partiallyOffset.remainingAmount, 50);

  const invoiceToNonCreditor = allocationFor(snapshot, "c-owes-a");
  assert.equal(invoiceToNonCreditor.status, "offset");
  assert.equal(invoiceToNonCreditor.offsetAmount, 100);
});

test("mixed paid, pending, offset, and partially paid invoices stay distinct", () => {
  const snapshot = buildSettlementSnapshot({
    users: buildUsers(userA, userB),
    expenses: [
      expense("expense-a-1", userA, 140),
      expense("expense-b-1", userB, 40),
    ],
    invoices: [
      invoice({
        id: "a-own",
        user: userA,
        expenseId: "expense-a-1",
        amount: 20,
        status: "paid",
      }),
      invoice({
        id: "b-owes-a-1",
        user: userB,
        expenseId: "expense-a-1",
        amount: 60,
      }),
      invoice({
        id: "b-owes-a-2",
        user: userB,
        expenseId: "expense-a-1",
        amount: 60,
      }),
      invoice({
        id: "b-own",
        user: userB,
        expenseId: "expense-b-1",
        amount: 20,
        status: "paid",
      }),
      invoice({
        id: "a-owes-b",
        user: userA,
        expenseId: "expense-b-1",
        amount: 20,
      }),
    ],
    payments: [],
  });

  assert.equal(snapshot.balancesByUserId[userA].balance, 100);
  assert.equal(snapshot.balancesByUserId[userB].balance, -100);

  const aOwn = allocationFor(snapshot, "a-own");
  assert.equal(aOwn.status, "paid");
  assert.equal(aOwn.remainingAmount, 0);

  const bOwn = allocationFor(snapshot, "b-own");
  assert.equal(bOwn.status, "paid");
  assert.equal(bOwn.remainingAmount, 0);

  const firstDebt = allocationFor(snapshot, "b-owes-a-1");
  assert.equal(firstDebt.status, "pending");
  assert.equal(firstDebt.remainingAmount, 60);
  assert.equal(firstDebt.offsetAmount, 0);

  const secondDebt = allocationFor(snapshot, "b-owes-a-2");
  assert.equal(secondDebt.status, "partially_paid");
  assert.equal(secondDebt.remainingAmount, 40);
  assert.equal(secondDebt.offsetAmount, 20);

  const reciprocal = allocationFor(snapshot, "a-owes-b");
  assert.equal(reciprocal.status, "offset");
  assert.equal(reciprocal.remainingAmount, 0);
  assert.equal(reciprocal.offsetAmount, 20);

  assert.equal(transferTotalFrom(snapshot, userB), 100);
  assert.equal(transferTotalTo(snapshot, userA), 100);
});

test("a partial settlement updates balances and leaves only the remaining debt", () => {
  const snapshot = buildSettlementSnapshot({
    users: buildUsers(userA, userB),
    expenses: [
      expense("expense-a", userA, 100),
      expense("expense-b", userB, 30),
    ],
    invoices: [
      invoice({
        id: "a-own",
        user: userA,
        expenseId: "expense-a",
        amount: 50,
        status: "paid",
      }),
      invoice({
        id: "b-owes-a",
        user: userB,
        expenseId: "expense-a",
        amount: 50,
      }),
      invoice({
        id: "a-owes-b",
        user: userA,
        expenseId: "expense-b",
        amount: 30,
      }),
    ],
    payments: [
      {
        _id: "settlement-1",
        house: houseId,
        user: userB,
        recipient: userA,
        amount: 10,
        status: "approved",
        transactionType: "settlement",
      },
    ],
  });

  assert.equal(snapshot.balancesByUserId[userA].balance, 10);
  assert.equal(snapshot.balancesByUserId[userB].balance, -10);
  assert.deepEqual(snapshot.transfers, [
    { fromUserId: userB, toUserId: userA, amount: 10 },
  ]);

  const invoiceAllocation = allocationFor(snapshot, "b-owes-a");
  assert.equal(invoiceAllocation.paidAmount, 10);
  assert.equal(invoiceAllocation.offsetAmount, 30);
  assert.equal(invoiceAllocation.remainingAmount, 10);
  assert.equal(invoiceAllocation.status, "partially_paid");
});

test("legacy approved invoice payments still settle balances and invoices", () => {
  const snapshot = buildSettlementSnapshot({
    users: buildUsers(userA, userB),
    expenses: [expense("expense-a", userA, 100)],
    invoices: [
      invoice({
        id: "a-own",
        user: userA,
        expenseId: "expense-a",
        amount: 50,
        status: "paid",
      }),
      invoice({
        id: "b-owes-a",
        user: userB,
        expenseId: "expense-a",
        amount: 50,
        status: "paid",
        paymentRequest: "legacy-payment",
      }),
    ],
    payments: [
      {
        _id: "legacy-payment",
        house: houseId,
        user: userB,
        amount: 50,
        status: "approved",
        transactionType: "payment",
      },
    ],
  });

  assert.equal(snapshot.balancesByUserId[userA].balance, 0);
  assert.equal(snapshot.balancesByUserId[userA].internalReceived, 50);
  assert.equal(snapshot.balancesByUserId[userB].balance, 0);
  assert.deepEqual(snapshot.transfers, []);

  const invoiceAllocation = allocationFor(snapshot, "b-owes-a");
  assert.equal(invoiceAllocation.paidAmount, 50);
  assert.equal(invoiceAllocation.status, "paid");
});

test("a duplicated approved payment is counted once", () => {
  const duplicatedPayment = {
    _id: "settlement-1",
    house: houseId,
    user: userB,
    recipient: userA,
    amount: 50,
    status: "approved",
    transactionType: "settlement",
  };

  const snapshot = buildSettlementSnapshot({
    users: buildUsers(userA, userB),
    expenses: [expense("expense-a", userA, 100)],
    invoices: [
      invoice({
        id: "a-own",
        user: userA,
        expenseId: "expense-a",
        amount: 50,
        status: "paid",
      }),
      invoice({
        id: "b-owes-a",
        user: userB,
        expenseId: "expense-a",
        amount: 50,
      }),
    ],
    payments: [duplicatedPayment, { ...duplicatedPayment }],
  });

  assert.equal(snapshot.balancesByUserId[userA].balance, 0);
  assert.equal(snapshot.balancesByUserId[userB].balance, 0);
  assert.equal(snapshot.balancesByUserId[userB].internalSent, 50);
  assert.deepEqual(snapshot.transfers, []);
});

test("atomic settlement approval succeeds once and rejects a duplicate approval", async () => {
  let calls = 0;
  const paymentModel = {
    findOneAndUpdate: async (query, update) => {
      calls += 1;
      assert.equal(query.status, "pending");
      assert.equal(query.transactionType, "settlement");
      assert.equal(update.$set.status, "approved");
      return calls === 1
        ? { _id: "settlement-1", status: "approved" }
        : null;
    },
  };

  const first = await approveSettlementPayment({
    paymentId: "settlement-1",
    houseId,
    adminId: "admin-1",
    paymentModel,
  });
  const second = await approveSettlementPayment({
    paymentId: "settlement-1",
    houseId,
    adminId: "admin-1",
    paymentModel,
  });

  assert.equal(first.status, "approved");
  assert.equal(second, null);
  assert.equal(calls, 2);
});
