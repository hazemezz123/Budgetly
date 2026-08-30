import webPushModule from "web-push";
import PushSubscription from "../models/PushSubscription.js";
import crypto from "crypto";

const webpush = webPushModule.default || webPushModule;

const getVapidKeys = () => {
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || "mailto:support@budgetly.app";

  if (publicKey && privateKey) {
    return { publicKey, privateKey, subject };
  }

  const generated = webpush.generateVAPIDKeys();
  console.warn(
    "\n⚠️  VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY missing in .env\n" +
      "Generated one-time keys (NOT persisted — add these to server/.env):\n" +
      `  VAPID_PUBLIC_KEY=${generated.publicKey}\n` +
      `  VAPID_PRIVATE_KEY=${generated.privateKey}\n`
  );
  return { publicKey: generated.publicKey, privateKey: generated.privateKey, subject };
};

const vapid = getVapidKeys();

webpush.setVapidDetails(vapid.subject, vapid.publicKey, vapid.privateKey);

export const getVapidPublicKey = () => vapid.publicKey;

export const saveSubscription = async ({ userId, subscription, userAgent = "" }) => {
  if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
    throw new Error("Invalid push subscription object");
  }

  const existing = await PushSubscription.findOne({
    user: userId,
    endpoint: subscription.endpoint,
  });

  if (existing) {
    existing.keys = subscription.keys;
    existing.userAgent = userAgent;
    await existing.save();
    return existing;
  }

  return PushSubscription.create({
    user: userId,
    endpoint: subscription.endpoint,
    keys: subscription.keys,
    userAgent,
  });
};

export const removeSubscription = async ({ userId, endpoint }) => {
  const result = await PushSubscription.deleteOne({ user: userId, endpoint });
  return result.deletedCount > 0;
};

export const removeAllSubscriptionsForUser = async (userId) => {
  const result = await PushSubscription.deleteMany({ user: userId });
  return result.deletedCount;
};

export const getSubscriptionsForUser = async (userId) => {
  return PushSubscription.find({ user: userId }).lean();
};

export const getSubscriptionsForUsers = async (userIds) => {
  if (!userIds?.length) return [];
  return PushSubscription.find({ user: { $in: userIds } }).lean();
};

const sendSingle = async (subDoc, payload) => {
  const subscription = {
    endpoint: subDoc.endpoint,
    keys: {
      p256dh: subDoc.keys.p256dh,
      auth: subDoc.keys.auth,
    },
  };

  try {
    await webpush.sendNotification(subscription, JSON.stringify(payload));
    return { ok: true, endpoint: subDoc.endpoint, userId: subDoc.user };
  } catch (error) {
    if (error.statusCode === 410 || error.statusCode === 404) {
      await PushSubscription.deleteOne({ _id: subDoc._id });
      return { ok: false, removed: true, endpoint: subDoc.endpoint, userId: subDoc.user, error: error.message };
    }
    console.error("Push send error:", error.message, "statusCode:", error.statusCode);
    return { ok: false, removed: false, endpoint: subDoc.endpoint, userId: subDoc.user, error: error.message };
  }
};

export const sendPushToUser = async (userId, payload) => {
  const subs = await getSubscriptionsForUser(userId);
  if (!subs.length) return { sent: 0, skipped: 0, total: 0 };

  const results = await Promise.all(subs.map((s) => sendSingle(s, payload)));
  const sent = results.filter((r) => r.ok).length;
  return { sent, skipped: subs.length - sent, total: subs.length, results };
};

export const sendPushToUsers = async (userIds, payload) => {
  const subs = await getSubscriptionsForUsers(userIds);
  if (!subs.length) return { sent: 0, skipped: 0, total: 0 };

  const results = await Promise.all(subs.map((s) => sendSingle(s, payload)));
  const sent = results.filter((r) => r.ok).length;
  return { sent, skipped: subs.length - sent, total: subs.length, results };
};

export const buildNotificationPayload = ({
  title,
  body,
  icon = "/assets/logo.png",
  badge = "/favicon-96x96.png",
  url = "/",
  tag,
  data = {},
  silent = false,
  requireInteraction = false,
}) => {
  const nonce = crypto.randomBytes(4).toString("hex");
  return {
    notification: {
      title,
      body,
      icon,
      badge,
      tag: tag || `ntf-${nonce}`,
      requireInteraction,
      silent,
      data: {
        url,
        ...data,
      },
    },
  };
};
