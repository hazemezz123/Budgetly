import Notification from "../models/Notification.js";

export const createNotificationForPendingExpense = async ({
  recipientId,
  senderId,
  houseId,
  expense,
  title,
  body,
  url,
  tag,
  data,
  icon,
  badge,
}) => {
  if (!recipientId || !senderId || !houseId || !expense?._id) {
    throw new Error("Missing required notification fields");
  }
  // self-skip is handled by caller; double-check
  if (String(recipientId) === String(senderId)) return null;

  const doc = await Notification.create({
    recipient: recipientId,
    sender: senderId,
    house: houseId,
    expense: expense._id,
    type: "pending-expense",
    title,
    body,
    url,
    tag: tag || `pending-expense-${expense._id}`,
    data: {
      expenseId: expense._id.toString(),
      houseId: houseId.toString(),
      ...data,
    },
    icon: icon || "/assets/logo.png",
    badge: badge || "/favicon-96x96.png",
  });
  return doc;
};

export const listNotifications = async ({ recipientId, page = 1, limit = 10, unreadOnly = false }) => {
  const query = { recipient: recipientId };
  if (unreadOnly) query.read = false;
  const skip = (page - 1) * limit;
  const [total, items] = await Promise.all([
    Notification.countDocuments(query),
    Notification.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
  ]);
  return { total, items, page, totalPages: Math.ceil(total / limit) };
};

export const getUnreadCount = async (recipientId) => {
  return Notification.countDocuments({ recipient: recipientId, read: false });
};

export const markOneRead = async ({ notificationId, recipientId }) => {
  const doc = await Notification.findOne({ _id: notificationId, recipient: recipientId });
  if (!doc) return null;
  if (!doc.read) {
    doc.read = true;
    doc.readAt = new Date();
    await doc.save();
  }
  return doc;
};

export const markAllRead = async (recipientId) => {
  const result = await Notification.updateMany(
    { recipient: recipientId, read: false },
    { $set: { read: true, readAt: new Date() } }
  );
  return result.modifiedCount;
};

export const deleteNotification = async ({ notificationId, recipientId }) => {
  const result = await Notification.deleteOne({ _id: notificationId, recipient: recipientId });
  return result.deletedCount > 0;
};
