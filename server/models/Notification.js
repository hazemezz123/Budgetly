import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    house: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "House",
      required: true,
      index: true,
    },
    expense: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Expense",
      required: true,
    },
    type: {
      type: String,
      enum: ["pending-expense"],
      default: "pending-expense",
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    body: {
      type: String,
      required: true,
      trim: true,
    },
    url: {
      type: String,
      required: true,
    },
    icon: {
      type: String,
      default: "/assets/logo.png",
    },
    badge: {
      type: String,
      default: "/favicon-96x96.png",
    },
    tag: {
      type: String,
      trim: true,
    },
    data: {
      expenseId: { type: String },
      houseId: { type: String },
      creatorName: { type: String },
      title: { type: String },
      totalAmount: { type: Number },
      category: { type: String },
      type: { type: String },
      createdBy: { type: String },
      url: { type: String },
    },
    read: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Query helpers
notificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ house: 1, createdAt: -1 });

// TTL: auto-delete after 90 days
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 90 });

export default mongoose.model("Notification", notificationSchema);
