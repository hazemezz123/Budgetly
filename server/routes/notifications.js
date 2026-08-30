import express from "express";
import { authenticate } from "../middleware/auth.js";
import {
  getPublicKey,
  subscribe,
  unsubscribe,
  listNotifications,
  getUnreadCount,
  markRead,
  markAllRead,
  deleteNotification,
} from "../controllers/notificationController.js";

const router = express.Router();

router.get("/", authenticate, listNotifications);
router.get("/unread-count", authenticate, getUnreadCount);
router.get("/vapid-public-key", authenticate, getPublicKey);
router.post("/subscribe", authenticate, subscribe);
router.post("/unsubscribe", authenticate, unsubscribe);
router.patch("/:id/read", authenticate, markRead);
router.patch("/read-all", authenticate, markAllRead);
router.delete("/:id", authenticate, deleteNotification);

export default router;
