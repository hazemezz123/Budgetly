import mongoose from "mongoose";

const roleRotationSchema = new mongoose.Schema(
  {
    enabled: {
      type: Boolean,
      default: false,
    },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    roles: [
      {
        name: {
          type: String,
          trim: true,
        },
        count: {
          type: Number,
          min: 1,
        },
      },
    ],
    cycleIndex: {
      type: Number,
      default: 0,
    },
    currentCycle: {
      cycleNumber: Number,
      startedAt: String,
      assignments: [
        {
          slotIndex: Number,
          roleName: String,
          participant: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
          },
        },
      ],
    },
    history: [
      {
        cycleNumber: Number,
        startedAt: String,
        assignments: [
          {
            slotIndex: Number,
            roleName: String,
            participant: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "User",
            },
          },
        ],
      },
    ],
  },
  { _id: false },
);

const houseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    houseId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    password: {
      type: String,
      required: true,
    },
    roleRotation: {
      type: roleRotationSchema,
      default: () => ({
        enabled: false,
        participants: [],
        roles: [],
        cycleIndex: 0,
        currentCycle: null,
        history: [],
      }),
    },
  },
  {
    timestamps: true,
  },
);

// Index for faster queries
houseSchema.index({ admin: 1 });
houseSchema.index({ members: 1 });

export default mongoose.model("House", houseSchema);
