process.env.JWT_SECRET = "test-secret";
process.env.GOOGLE_CLIENT_ID = "test-client-id";

import test from "node:test";
import assert from "node:assert/strict";

import { OAuth2Client } from "google-auth-library";
import { googleLogin } from "../controllers/authController.js";
import User from "../models/User.js";

const originalVerify = OAuth2Client.prototype.verifyIdToken;
const originalFindOne = User.findOne;
const originalCreate = User.create;
const originalFindById = User.findById;

const createRes = () => {
  const res = {
    statusCode: 200,
    body: undefined,
    cookies: {},
    cookie(name, value, options) {
      this.cookies[name] = { value, options };
    },
    clearCookie(name) {
      delete this.cookies[name];
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

test.afterEach(() => {
  OAuth2Client.prototype.verifyIdToken = originalVerify;
  User.findOne = originalFindOne;
  User.create = originalCreate;
  User.findById = originalFindById;
});

test("returns 401 when the ID token is invalid or expired", async () => {
  OAuth2Client.prototype.verifyIdToken = async () => {
    throw new Error("Invalid token");
  };

  const res = createRes();
  await googleLogin({ body: { idToken: "bad-token" } }, res);

  assert.equal(res.statusCode, 401);
});

test("returns 401 when the Google email is unverified", async () => {
  OAuth2Client.prototype.verifyIdToken = async () => ({
    getPayload: () => ({ email_verified: false }),
  });

  const res = createRes();
  await googleLogin({ body: { idToken: "unverified" } }, res);

  assert.equal(res.statusCode, 401);
  assert.equal(res.body.message, "البريد الإلكتروني غير مؤكد");
});

test("returns 400 when idToken is missing", async () => {
  const res = createRes();
  await googleLogin({ body: {} }, res);

  assert.equal(res.statusCode, 400);
});

test("returns 200 with a token and user on success", async () => {
  OAuth2Client.prototype.verifyIdToken = async () => ({
    getPayload: () => ({
      sub: "g1",
      email: "x@example.com",
      email_verified: true,
      name: "X",
      picture: null,
    }),
  });
  const created = {
    _id: "u1",
    username: "x",
    name: "X",
    email: "x@example.com",
    role: "user",
    house: null,
    profilePicture: null,
    isActive: true,
    createdAt: new Date(),
  };
  User.findOne = async () => null;
  User.create = async () => created;
  User.findById = () => ({ populate: async () => created });

  const res = createRes();
  await googleLogin({ body: { idToken: "valid" } }, res);

  assert.equal(res.statusCode, 200);
  assert.ok(res.body.token);
  assert.equal(res.body.user.email, "x@example.com");
  assert.equal(res.body.user.username, "x");
});

test("returns 401 when the account is inactive", async () => {
  OAuth2Client.prototype.verifyIdToken = async () => ({
    getPayload: () => ({
      sub: "g1",
      email: "x@example.com",
      email_verified: true,
      name: "X",
      picture: null,
    }),
  });
  User.findOne = async () => ({ _id: "u1", isActive: false });
  User.findById = () => ({
    populate: async () => ({ _id: "u1", isActive: false }),
  });

  const res = createRes();
  await googleLogin({ body: { idToken: "valid" } }, res);

  assert.equal(res.statusCode, 401);
  assert.equal(res.body.message, "الحساب غير نشط");
});
