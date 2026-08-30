import test from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";

const objectId = () => new mongoose.Types.ObjectId();

import Notification from "../models/Notification.js";
import * as notificationController from "../controllers/notificationController.js";

const createRes = () => ({
  statusCode: 200,
  body: null,
  status(code) { this.statusCode = code; return this; },
  json(payload) { this.body = payload; return this; },
});

const originalFind = Notification.find;
const originalCountDocuments = Notification.countDocuments;
const originalFindOne = Notification.findOne;
const originalUpdateMany = Notification.updateMany;
const originalDeleteOne = Notification.deleteOne;
const originalFindById = Notification.findById;

test.afterEach(() => {
  Notification.find = originalFind;
  Notification.countDocuments = originalCountDocuments;
  Notification.findOne = originalFindOne;
  Notification.updateMany = originalUpdateMany;
  Notification.deleteOne = originalDeleteOne;
  Notification.findById = originalFindById;
});

test("GET /api/notifications returns paginated list newest first", async () => {
  assert.equal(typeof notificationController.listNotifications, "function", "listNotifications should exist");
  const userId = objectId();
  const houseId = objectId();
  const expenseId = objectId();
  const now = new Date();

  const fakeDocs = [
    { _id: objectId(), recipient: userId, house: houseId, expense: expenseId, title: "مصروف جديد", body: "أحمد أضاف", read: false, createdAt: now },
    { _id: objectId(), recipient: userId, house: houseId, expense: expenseId, title: "مصروف جديد", body: "محمد أضاف", read: true, createdAt: new Date(now - 1000) },
  ];

  Notification.countDocuments = async (query) => {
    assert.equal(String(query.recipient), String(userId));
    return 2;
  };
  Notification.find = (query) => {
    assert.equal(String(query.recipient), String(userId));
    return {
      sort: (order) => {
        assert.deepEqual(order, { createdAt: -1 });
        return {
          skip: (s) => {
            assert.equal(s, 0);
            return {
              limit: (l) => {
                assert.equal(l, 10);
                return { lean: async () => fakeDocs };
              },
            };
          },
        };
      },
    };
  };

  const req = { user: { id: userId.toString(), house: houseId }, query: { page: "1", limit: "10" } };
  const res = createRes();
  await notificationController.listNotifications(req, res);
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.total, 2);
  assert.equal(res.body.items.length, 2);
  assert.equal(res.body.page, 1);
  assert.equal(res.body.totalPages, 1);
});

test("GET /api/notifications filters unreadOnly", async () => {
  const userId = objectId();
  Notification.countDocuments = async (query) => {
    assert.equal(query.read, false);
    return 1;
  };
  Notification.find = () => ({
    sort: () => ({
      skip: () => ({
        limit: () => ({ lean: async () => [{ _id: objectId(), read: false }] }),
      }),
    }),
  });
  const req = { user: { id: userId.toString() }, query: { unreadOnly: "true" } };
  const res = createRes();
  await notificationController.listNotifications(req, res);
  assert.equal(res.body.total, 1);
});

test("GET /api/notifications/unread-count returns count", async () => {
  assert.equal(typeof notificationController.getUnreadCount, "function");
  const userId = objectId();
  Notification.countDocuments = async (query) => {
    assert.equal(String(query.recipient), String(userId));
    assert.equal(query.read, false);
    return 5;
  };
  const req = { user: { id: userId.toString() } };
  const res = createRes();
  await notificationController.getUnreadCount(req, res);
  assert.equal(res.body.count, 5);
});

test("PATCH /api/notifications/:id/read marks single notification read", async () => {
  assert.equal(typeof notificationController.markRead, "function");
  const userId = objectId();
  const notifId = objectId();
  let saved = false;
  const fakeDoc = {
    _id: notifId,
    recipient: userId,
    read: false,
    save: async () => { saved = true; fakeDoc.read = true; fakeDoc.readAt = new Date(); },
  };
  Notification.findOne = async (query) => {
    assert.equal(String(query._id), String(notifId));
    assert.equal(String(query.recipient), String(userId));
    return fakeDoc;
  };
  const req = { user: { id: userId.toString() }, params: { id: notifId.toString() } };
  const res = createRes();
  await notificationController.markRead(req, res);
  assert.equal(saved, true);
  assert.equal(res.body.notification.read, true);
});

test("PATCH /api/notifications/:id/read returns 404 when not found or not owned", async () => {
  Notification.findOne = async () => null;
  const req = { user: { id: objectId().toString() }, params: { id: objectId().toString() } };
  const res = createRes();
  await notificationController.markRead(req, res);
  assert.equal(res.statusCode, 404);
});

test("PATCH /api/notifications/read-all marks all unread as read", async () => {
  assert.equal(typeof notificationController.markAllRead, "function");
  const userId = objectId();
  Notification.updateMany = async (query, update) => {
    assert.equal(String(query.recipient), String(userId));
    assert.equal(query.read, false);
    assert.equal(update.$set.read, true);
    return { modifiedCount: 3 };
  };
  const req = { user: { id: userId.toString() } };
  const res = createRes();
  await notificationController.markAllRead(req, res);
  assert.equal(res.body.modifiedCount, 3);
});

test("DELETE /api/notifications/:id deletes owned notification", async () => {
  assert.equal(typeof notificationController.deleteNotification, "function");
  const userId = objectId();
  const notifId = objectId();
  Notification.deleteOne = async (query) => {
    assert.equal(String(query._id), String(notifId));
    assert.equal(String(query.recipient), String(userId));
    return { deletedCount: 1 };
  };
  const req = { user: { id: userId.toString() }, params: { id: notifId.toString() } };
  const res = createRes();
  await notificationController.deleteNotification(req, res);
  assert.equal(res.body.deleted, true);
});

test("DELETE returns 404 when not found", async () => {
  Notification.deleteOne = async () => ({ deletedCount: 0 });
  const req = { user: { id: objectId().toString() }, params: { id: objectId().toString() } };
  const res = createRes();
  await notificationController.deleteNotification(req, res);
  assert.equal(res.statusCode, 404);
});

