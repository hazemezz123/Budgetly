import {
  getVapidPublicKey,
  saveSubscription,
  removeSubscription,
  removeAllSubscriptionsForUser,
} from "../services/pushNotificationService.js";
import {
  listNotifications as listNotificationsService,
  getUnreadCount as getUnreadCountService,
  markOneRead,
  markAllRead as markAllReadService,
  deleteNotification as deleteNotificationService,
} from "../services/notificationService.js";

export const getPublicKey = async (req, res) => {
  try {
    res.json({ publicKey: getVapidPublicKey() });
  } catch (error) {
    console.error("Get VAPID public key error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const subscribe = async (req, res) => {
  try {
    const { subscription } = req.body;
    if (!subscription) {
      return res.status(400).json({ message: "Subscription object is required" });
    }

    const userAgent = req.headers["user-agent"] || "";

    const doc = await saveSubscription({
      userId: req.user.id,
      subscription,
      userAgent,
    });

    res.status(201).json({
      message: "Subscribed to push notifications",
      subscription: {
        _id: doc._id,
        user: doc.user,
        endpoint: doc.endpoint,
      },
    });
  } catch (error) {
    console.error("Subscribe error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

export const unsubscribe = async (req, res) => {
  try {
    const { endpoint } = req.body;
    if (!endpoint) {
      const deleted = await removeAllSubscriptionsForUser(req.user.id);
      return res.json({
        message: `Unsubscribed all devices (removed ${deleted} subscriptions)`,
        removed: deleted,
      });
    }

    const removed = await removeSubscription({ userId: req.user.id, endpoint });
    res.json({
      message: removed ? "Unsubscribed successfully" : "Subscription not found",
      removed: removed ? 1 : 0,
    });
  } catch (error) {
    console.error("Unsubscribe error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const listNotifications = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 50);
    const unreadOnly = req.query.unreadOnly === "true" || req.query.unreadOnly === true;

    const result = await listNotificationsService({
      recipientId: req.user.id,
      page,
      limit,
      unreadOnly,
    });

    res.json({
      items: result.items,
      total: result.total,
      page: result.page,
      totalPages: result.totalPages,
    });
  } catch (error) {
    console.error("List notifications error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getUnreadCount = async (req, res) => {
  try {
    const count = await getUnreadCountService(req.user.id);
    res.json({ count });
  } catch (error) {
    console.error("Unread count error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const markRead = async (req, res) => {
  try {
    const doc = await markOneRead({ notificationId: req.params.id, recipientId: req.user.id });
    if (!doc) return res.status(404).json({ message: "Notification not found" });
    res.json({ notification: doc });
  } catch (error) {
    console.error("Mark read error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const markAllRead = async (req, res) => {
  try {
    const modifiedCount = await markAllReadService(req.user.id);
    res.json({ modifiedCount });
  } catch (error) {
    console.error("Mark all read error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteNotification = async (req, res) => {
  try {
    const deleted = await deleteNotificationService({ notificationId: req.params.id, recipientId: req.user.id });
    if (!deleted) return res.status(404).json({ message: "Notification not found" });
    res.json({ deleted: true });
  } catch (error) {
    console.error("Delete notification error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
