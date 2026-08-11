import test from "node:test";
import assert from "node:assert/strict";
import { z } from "zod";
import { validate } from "../middleware/validate.js";
import { registerSchema, loginSchema } from "../validators/authValidators.js";
import { createExpenseSchema } from "../validators/expenseValidators.js";
import { createHouseSchema, joinHouseSchema } from "../validators/houseValidators.js";
import { createNoteSchema } from "../validators/noteValidators.js";

test("validate middleware parses valid body, query, and params", () => {
  const schema = {
    body: z.object({ name: z.string() }),
    query: z.object({ page: z.string().transform(Number) }),
    params: z.object({ id: z.string() }),
  };

  const req = {
    body: { name: "Test" },
    query: { page: "2" },
    params: { id: "123" },
  };

  let nextCalled = false;
  const next = () => {
    nextCalled = true;
  };

  const res = {};

  const middleware = validate(schema);
  middleware(req, res, next);

  assert.equal(nextCalled, true);
  assert.deepEqual(req.body, { name: "Test" });
  assert.deepEqual(req.query, { page: 2 });
  assert.deepEqual(req.params, { id: "123" });
});

test("validate middleware returns 400 on ZodError", () => {
  const schema = {
    body: z.object({ username: z.string().min(3, "Username too short") }),
  };

  const req = { body: { username: "ab" } };
  let statusSet = null;
  let jsonSent = null;

  const res = {
    status(code) {
      statusSet = code;
      return this;
    },
    json(data) {
      jsonSent = data;
      return this;
    },
  };

  let nextCalled = false;
  const next = () => {
    nextCalled = true;
  };

  const middleware = validate(schema);
  middleware(req, res, next);

  assert.equal(nextCalled, false);
  assert.equal(statusSet, 400);
  assert.equal(jsonSent.message, "Username too short");
  assert.equal(jsonSent.errors.length, 1);
  assert.equal(jsonSent.errors[0].field, "username");
});

test("validate middleware passes non-Zod error to next()", () => {
  const faultySchema = {
    body: {
      parse() {
        throw new Error("Unexpected system error");
      },
    },
  };

  const req = { body: {} };
  const res = {};
  let passedError = null;

  const next = (err) => {
    passedError = err;
  };

  const middleware = validate(faultySchema);
  middleware(req, res, next);

  assert.ok(passedError);
  assert.equal(passedError.message, "Unexpected system error");
});

test("authValidators - registerSchema validates correctly", () => {
  const validData = {
    username: "validuser",
    password: "password123",
    name: "Valid User",
    email: "test@example.com",
  };
  assert.deepEqual(registerSchema.parse(validData), validData);

  assert.throws(() => registerSchema.parse({ ...validData, username: "ab" }));
  assert.throws(() => registerSchema.parse({ ...validData, password: "123" }));
  assert.throws(() => registerSchema.parse({ ...validData, name: "a" }));
  assert.throws(() => registerSchema.parse({ ...validData, email: "invalid-email" }));
});

test("authValidators - loginSchema validates correctly", () => {
  const validData = { username: "user", password: "pass" };
  assert.deepEqual(loginSchema.parse(validData), validData);

  assert.throws(() => loginSchema.parse({ username: "", password: "pass" }));
  assert.throws(() => loginSchema.parse({ username: "user", password: "" }));
});

test("expenseValidators - createExpenseSchema validates correctly", () => {
  const validData = {
    title: "Groceries",
    category: "Food",
    totalAmount: 150,
    splitType: "equal",
  };
  assert.deepEqual(createExpenseSchema.parse(validData), validData);

  assert.throws(() => createExpenseSchema.parse({ ...validData, totalAmount: -10 }));
  assert.throws(() => createExpenseSchema.parse({ ...validData, splitType: "invalid_type" }));
});

test("houseValidators - createHouseSchema & joinHouseSchema validate correctly", () => {
  const validHouse = { name: "Sweet Home", password: "1234" };
  assert.deepEqual(createHouseSchema.parse(validHouse), validHouse);

  assert.throws(() => createHouseSchema.parse({ name: "ab", password: "1234" }));
  assert.throws(() => createHouseSchema.parse({ name: "House", password: "123" }));

  assert.deepEqual(joinHouseSchema.parse({ password: "secret" }), { password: "secret" });
  assert.throws(() => joinHouseSchema.parse({ password: "" }));
});

test("noteValidators - createNoteSchema validates correctly", () => {
  assert.deepEqual(createNoteSchema.parse({ content: "Buy milk" }), { content: "Buy milk" });
  assert.throws(() => createNoteSchema.parse({ content: "" }));
});
