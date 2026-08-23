process.env.JWT_SECRET = "test-secret";

import test from "node:test";
import assert from "node:assert/strict";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { authenticate } from "../middleware/auth.js";
import { setAuthCookie, logoutUser } from "../controllers/authController.js";

const originalFindById = User.findById;

test.afterEach(() => {
  User.findById = originalFindById;
});

const createMockRes = () => {
  const res = {
    statusCode: 200,
    cookies: {},
    clearedCookies: [],
    body: null,
    cookie(name, value, options) {
      this.cookies[name] = { value, options };
    },
    clearCookie(name) {
      this.clearedCookies.push(name);
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };
  return res;
};

test("setAuthCookie sets httpOnly cookie with correct attributes", () => {
  const res = createMockRes();
  setAuthCookie(res, "mock-token");

  assert.equal(res.cookies.token.value, "mock-token");
  assert.equal(res.cookies.token.options.httpOnly, true);
  assert.equal(res.cookies.token.options.sameSite, "lax");
  assert.equal(res.cookies.token.options.maxAge, 7 * 24 * 60 * 60 * 1000);
});

test("logoutUser clears token cookie and returns success response", () => {
  const res = createMockRes();
  logoutUser({}, res);

  assert.equal(res.clearedCookies.includes("token"), true);
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.message, "Logged out successfully");
});

test("authenticate middleware reads token from req.cookies.token", async () => {
  const validToken = jwt.sign({ id: "user123" }, process.env.JWT_SECRET);
  const mockUser = { _id: "user123", username: "testuser", role: "user", isActive: true };

  User.findById = () => ({
    select: async () => mockUser,
  });

  const req = {
    cookies: { token: validToken },
    header: () => undefined,
  };
  const res = createMockRes();
  let nextCalled = false;

  await authenticate(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, true);
  assert.equal(req.user.username, "testuser");
});

test("authenticate middleware falls back to Authorization Bearer header when cookie is absent", async () => {
  const validToken = jwt.sign({ id: "user456" }, process.env.JWT_SECRET);
  const mockUser = { _id: "user456", username: "beareruser", role: "user", isActive: true };

  User.findById = () => ({
    select: async () => mockUser,
  });

  const req = {
    cookies: {},
    header: (name) => (name === "Authorization" ? `Bearer ${validToken}` : undefined),
  };
  const res = createMockRes();
  let nextCalled = false;

  await authenticate(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, true);
  assert.equal(req.user.username, "beareruser");
});

test("authenticate middleware returns 401 when neither cookie nor Bearer header is present", async () => {
  const req = {
    cookies: {},
    header: () => undefined,
  };
  const res = createMockRes();

  await authenticate(req, res, () => {});

  assert.equal(res.statusCode, 401);
  assert.equal(res.body.message, "No token provided");
});
