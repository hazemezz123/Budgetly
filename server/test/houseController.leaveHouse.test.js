import test from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";

import { leaveHouse } from "../controllers/houseController.js";
import House from "../models/House.js";
import User from "../models/User.js";

const objectId = () => new mongoose.Types.ObjectId();

const createRes = () => {
  const res = {
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
  };
  return res;
};

const createUser = ({ id, houseId, role = "user" }) => ({
  _id: id,
  house: houseId,
  role,
  saveCalls: 0,
  async save() {
    this.saveCalls += 1;
  },
});

const createHouse = ({ id, adminId, memberIds }) => ({
  _id: id,
  admin: adminId,
  members: [...memberIds],
  saveCalls: 0,
  async save() {
    this.saveCalls += 1;
  },
});

const originalHouseFindById = House.findById;
const originalHouseFindByIdAndDelete = House.findByIdAndDelete;
const originalUserFindById = User.findById;
const originalUserFindByIdAndUpdate = User.findByIdAndUpdate;

test.afterEach(() => {
  House.findById = originalHouseFindById;
  House.findByIdAndDelete = originalHouseFindByIdAndDelete;
  User.findById = originalUserFindById;
  User.findByIdAndUpdate = originalUserFindByIdAndUpdate;
});

test("leaveHouse transfers admin to first remaining member when admin leaves", async () => {
  const adminId = objectId();
  const memberId = objectId();
  const houseId = objectId();
  const admin = createUser({ id: adminId, houseId, role: "admin" });
  const house = createHouse({ id: houseId, adminId, memberIds: [adminId, memberId] });
  let transferredTo = null;

  User.findById = async () => admin;
  House.findById = async () => house;
  User.findByIdAndUpdate = async (id, update) => {
    transferredTo = { id, update };
  };

  const res = createRes();
  await leaveHouse({ user: { id: adminId }, params: { id: houseId } }, res);

  assert.equal(res.statusCode, 200);
  assert.equal(house.admin.toString(), memberId.toString());
  assert.deepEqual(transferredTo.id, memberId);
  assert.equal(transferredTo.update.$set.role, "admin");
  assert.deepEqual(house.members, [memberId]);
  assert.equal(admin.house, null);
  assert.equal(admin.role, "user");
});

test("leaveHouse deletes the house when admin is the last member", async () => {
  const adminId = objectId();
  const houseId = objectId();
  const admin = createUser({ id: adminId, houseId, role: "admin" });
  const house = createHouse({ id: houseId, adminId, memberIds: [adminId] });
  let houseDeleted = false;

  User.findById = async () => admin;
  House.findById = async () => house;
  House.findByIdAndDelete = async () => {
    houseDeleted = true;
  };

  const res = createRes();
  await leaveHouse({ user: { id: adminId }, params: { id: houseId } }, res);

  assert.equal(res.statusCode, 200);
  assert.equal(houseDeleted, true);
  assert.equal(admin.house, null);
  assert.equal(admin.role, "user");
});

test("leaveHouse still works for regular members", async () => {
  const adminId = objectId();
  const memberId = objectId();
  const houseId = objectId();
  const member = createUser({ id: memberId, houseId });
  const house = createHouse({ id: houseId, adminId, memberIds: [adminId, memberId] });

  User.findById = async () => member;
  House.findById = async () => house;

  const res = createRes();
  await leaveHouse({ user: { id: memberId }, params: { id: houseId } }, res);

  assert.equal(res.statusCode, 200);
  assert.deepEqual(house.members, [adminId]);
  assert.equal(member.house, null);
  assert.equal(member.role, "user");
});
