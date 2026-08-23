import test from "node:test";
import assert from "node:assert/strict";

import {
  getRotationSettings,
  resetRotation,
  startRotationCycle,
  updateRotationSettings,
} from "../controllers/roleRotationController.js";
import House from "../models/House.js";

const originalFindById = House.findById;

let idCounter = 0;
const makeId = (prefix = "id") => `${prefix}-${++idCounter}`;

const createResponse = () => ({
  statusCode: 200,
  body: null,
  status(code) {
    this.statusCode = code;
    return this;
  },
  json(payload) {
    this.body = payload;
    return this;
  },
});

const createHouse = (overrides = {}) => ({
  _id: makeId("house"),
  admin: makeId("admin"),
  members: [],
  roleRotation: {
    enabled: true,
    participants: [],
    roles: [],
    cycleIndex: 0,
    currentCycle: null,
    history: [],
  },
  saveCalls: 0,
  async save() {
    this.saveCalls += 1;
  },
  populate() {
    return this;
  },
  select() {
    return this;
  },
  ...overrides,
});

test.afterEach(() => {
  House.findById = originalFindById;
});

test("getRotationSettings returns 403 for non-members", async () => {
  const house = createHouse();
  House.findById = () => house;

  const req = {
    params: { id: house._id.toString() },
    user: { id: makeId("user"), house: makeId("other-house") },
  };
  const res = createResponse();

  await getRotationSettings(req, res);

  assert.equal(res.statusCode, 403);
  assert.equal(res.body.message, "You are not a member of this house");
});

test("updateRotationSettings returns 400 when participant count and slot count differ", async () => {
  const house = createHouse({
    members: [makeId("member"), makeId("member")],
  });
  House.findById = async () => house;

  const req = {
    params: { id: house._id.toString() },
    user: { id: house.admin.toString(), house: house._id },
    body: {
      enabled: true,
      participants: [house.members[0].toString()],
      roles: [{ name: "Cooking", count: 2 }],
    },
  };
  const res = createResponse();

  await updateRotationSettings(req, res);

  assert.equal(res.statusCode, 400);
  assert.equal(res.body.message, "Participant count must match total role slots");
});

test("startRotationCycle stores the next snapshot and pushes the previous cycle to history", async () => {
  const house = createHouse({
    admin: makeId("admin"),
    members: ["p1", "p2"],
    roleRotation: {
      enabled: true,
      participants: ["p1", "p2"],
      roles: [{ name: "Cooking", count: 2 }],
      cycleIndex: 1,
      currentCycle: {
        cycleNumber: 1,
        startedAt: "2026-05-16",
        assignments: [
          { slotIndex: 0, roleName: "Cooking", participant: "p1" },
          { slotIndex: 1, roleName: "Cooking", participant: "p2" },
        ],
      },
      history: [],
    },
  });
  House.findById = async () => house;

  const req = {
    params: { id: house._id.toString() },
    user: { id: house.admin.toString(), house: house._id },
  };
  const res = createResponse();

  await startRotationCycle(req, res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.cycleIndex, 2);
  assert.equal(res.body.currentCycle.cycleNumber, 2);
  assert.equal(res.body.history.length, 1);
  assert.equal(res.body.history[0].cycleNumber, 1);
  assert.equal(res.body.currentCycle.assignments[0].participant, "p2");
  assert.equal(res.body.currentCycle.assignments[1].participant, "p1");
  assert.equal(house.saveCalls, 1);
});

test("resetRotation clears role rotation state", async () => {
  const house = createHouse({
    admin: makeId("admin"),
    roleRotation: {
      enabled: true,
      participants: ["p1", "p2"],
      roles: [{ name: "Cooking", count: 2 }],
      cycleIndex: 4,
      currentCycle: { cycleNumber: 4, assignments: [] },
      history: [{ cycleNumber: 1, assignments: [] }],
    },
  });
  House.findById = async () => house;

  const req = {
    params: { id: house._id.toString() },
    user: { id: house.admin.toString(), house: house._id },
  };
  const res = createResponse();

  await resetRotation(req, res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.message, "Rotation reset successfully");
  assert.equal(house.roleRotation.enabled, false);
  assert.deepEqual(house.roleRotation.participants, []);
  assert.deepEqual(house.roleRotation.roles, []);
  assert.equal(house.roleRotation.cycleIndex, 0);
  assert.equal(house.roleRotation.currentCycle, null);
  assert.deepEqual(house.roleRotation.history, []);
});
