import test from "node:test";
import assert from "node:assert/strict";

import { buildHouseBalanceSnapshot } from "../services/statsService.js";

const houseId = "house-1";
const userA = "user-a";
const userB = "user-b";

const buildSnapshot = ({ invoices, payments }) =>
  buildHouseBalanceSnapshot({
    houseId,
    users: [
      { _id: userA, name: "Alice", username: "alice" },
      { _id: userB, name: "Bob", username: "bob" },
    ],
    expenses: [
      {
        _id: "expense-1",
        house: houseId,
        status: "approved",
        totalAmount: 100,
        createdBy: userA,
        paidBy: userA,
      },
    ],
    invoices,
    payments,
  });

test("charges the payer for their own share of an approved expense", () => {
  const snapshot = buildSnapshot({
    invoices: [
      {
        _id: "invoice-1",
        house: houseId,
        user: userA,
        expense: "expense-1",
        amount: 50,
        status: "paid",
      },
      {
        _id: "invoice-2",
        house: houseId,
        user: userB,
        expense: "expense-1",
        amount: 50,
        status: "pending",
      },
    ],
    payments: [],
  });

  assert.deepEqual(snapshot.balancesByUserId[userA], {
    externalPaid: 100,
    internalSent: 0,
    invoicesAssigned: 0,
    internalReceived: 0,
    balance: 50,
  });

  assert.deepEqual(snapshot.balancesByUserId[userB], {
    externalPaid: 0,
    internalSent: 0,
    invoicesAssigned: 50,
    internalReceived: 0,
    balance: -50,
  });

  const totalBalance =
    snapshot.balancesByUserId[userA].balance +
    snapshot.balancesByUserId[userB].balance;
  assert.equal(totalBalance, 0);
});

test("counts an approved settlement by its explicit recipient", () => {
  const snapshot = buildSnapshot({
    invoices: [
      {
        _id: "invoice-1",
        house: houseId,
        user: userA,
        expense: "expense-1",
        amount: 50,
        status: "paid",
      },
      {
        _id: "invoice-2",
        house: houseId,
        user: userB,
        expense: "expense-1",
        amount: 50,
        status: "paid",
      },
    ],
    payments: [
      {
        _id: "settlement-1",
        house: houseId,
        user: userB,
        recipient: userA,
        amount: 50,
        status: "approved",
        transactionType: "settlement",
      },
    ],
  });

  assert.equal(snapshot.balancesByUserId[userA].internalReceived, 50);
  assert.equal(snapshot.balancesByUserId[userA].balance, 0);
  assert.equal(snapshot.balancesByUserId[userB].internalSent, 50);
  assert.equal(snapshot.balancesByUserId[userB].balance, 0);
});

test("reports net debt instead of the gross sum of pending invoices", () => {
  const snapshot = buildHouseBalanceSnapshot({
    houseId,
    users: [
      { _id: userA, name: "Alice", username: "alice" },
      { _id: userB, name: "Bob", username: "bob" },
    ],
    expenses: [
      {
        _id: "expense-a",
        house: houseId,
        status: "approved",
        totalAmount: 100,
        createdBy: userA,
        paidBy: userA,
      },
      {
        _id: "expense-b",
        house: houseId,
        status: "approved",
        totalAmount: 100,
        createdBy: userB,
        paidBy: userB,
      },
    ],
    invoices: [
      {
        _id: "a-own",
        house: houseId,
        user: userA,
        expense: "expense-a",
        amount: 50,
        status: "paid",
      },
      {
        _id: "b-owes-a",
        house: houseId,
        user: userB,
        expense: "expense-a",
        amount: 50,
        status: "pending",
      },
      {
        _id: "b-own",
        house: houseId,
        user: userB,
        expense: "expense-b",
        amount: 50,
        status: "paid",
      },
      {
        _id: "a-owes-b",
        house: houseId,
        user: userA,
        expense: "expense-b",
        amount: 50,
        status: "pending",
      },
    ],
    payments: [],
  });

  assert.equal(snapshot.balancesByUserId[userA].balance, 0);
  assert.equal(snapshot.balancesByUserId[userA].invoicesAssigned, 0);
  assert.equal(snapshot.balancesByUserId[userB].invoicesAssigned, 0);
});

test("settles an approved invoice payment to zero without double-counting it", () => {
  const snapshot = buildSnapshot({
    invoices: [
      {
        _id: "invoice-1",
        house: houseId,
        user: userA,
        expense: "expense-1",
        amount: 50,
        status: "paid",
      },
      {
        _id: "invoice-2",
        house: houseId,
        user: userB,
        expense: "expense-1",
        amount: 50,
        status: "paid",
        paymentRequest: "payment-1",
      },
    ],
    payments: [
      {
        _id: "payment-1",
        house: houseId,
        user: userB,
        amount: 50,
        status: "approved",
        transactionType: "payment",
      },
    ],
  });

  assert.deepEqual(snapshot.balancesByUserId[userA], {
    externalPaid: 100,
    internalSent: 0,
    invoicesAssigned: 0,
    internalReceived: 50,
    balance: 0,
  });

  assert.deepEqual(snapshot.balancesByUserId[userB], {
    externalPaid: 0,
    internalSent: 50,
    invoicesAssigned: 0,
    internalReceived: 0,
    balance: 0,
  });

  const totalBalance =
    snapshot.balancesByUserId[userA].balance +
    snapshot.balancesByUserId[userB].balance;
  assert.equal(totalBalance, 0);
});
