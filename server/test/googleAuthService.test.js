import test from "node:test";
import assert from "node:assert/strict";

import { resolveGoogleUser } from "../services/googleAuthService.js";

const payload = {
  sub: "google-123",
  email: "omar@example.com",
  name: "Omar",
  picture: "https://pic.example/omar.jpg",
};

test("returns the existing user when googleId matches", async () => {
  const existing = { _id: "u1", email: payload.email };
  const User = {
    findOne: async (q) => (q.googleId === payload.sub ? existing : null),
    create: async () => {
      throw new Error("should not create");
    },
  };

  const user = await resolveGoogleUser(payload, User);
  assert.equal(user, existing);
});

test("links googleId to an existing password account by email", async () => {
  const existing = {
    _id: "u1",
    email: payload.email,
    name: "Omar",
    profilePicture: null,
    saveCalls: 0,
    async save() {
      this.saveCalls += 1;
    },
  };
  const User = {
    findOne: async (q) => (q.email === payload.email ? existing : null),
    create: async () => {
      throw new Error("should not create");
    },
  };

  const user = await resolveGoogleUser(payload, User);
  assert.equal(user, existing);
  assert.equal(user.googleId, payload.sub);
  assert.equal(user.profilePicture, payload.picture);
  assert.equal(user.saveCalls, 1);
});

test("keeps existing name when linking (only fills empty fields)", async () => {
  const existing = {
    _id: "u1",
    email: payload.email,
    name: "Name Already Set",
    profilePicture: "https://old-pic",
    async save() {},
  };
  const User = {
    findOne: async (q) => (q.email === payload.email ? existing : null),
    create: async () => {
      throw new Error("should not create");
    },
  };

  const user = await resolveGoogleUser(payload, User);
  assert.equal(user.name, "Name Already Set");
  assert.equal(user.profilePicture, "https://old-pic");
});

test("creates a new user without password when nothing matches", async () => {
  const created = [];
  const User = {
    findOne: async () => null,
    create: async (doc) => {
      created.push(doc);
      return { ...doc, _id: "u-new" };
    },
  };

  const user = await resolveGoogleUser(payload, User);
  assert.equal(user._id, "u-new");
  assert.equal(user.email, payload.email);
  assert.equal(user.name, payload.name);
  assert.equal(user.googleId, payload.sub);
  assert.equal(user.profilePicture, payload.picture);
  assert.equal(user.username, "omar");
  assert.equal(user.password, undefined);
  assert.equal(created.length, 1);
});

test("appends a random suffix when the derived username is taken", async () => {
  const User = {
    findOne: async (q) => (q.username === "omar" ? { username: "omar" } : null),
    create: async (doc) => doc,
  };

  const user = await resolveGoogleUser(payload, User);
  assert.ok(user.username.startsWith("omar"));
  assert.notEqual(user.username, "omar");
});

test("falls back to 'user' when the email local part is empty or invalid", async () => {
  const User = {
    findOne: async () => null,
    create: async (doc) => doc,
  };

  const user = await resolveGoogleUser(
    { ...payload, email: "@example.com" },
    User,
  );
  assert.equal(user.username, "user");
});
