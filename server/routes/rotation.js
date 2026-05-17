import express from "express";
import { authenticate } from "../middleware/auth.js";
import {
  deleteRotation,
  getRotationSettings,
  resetRotation,
  startRotationCycle,
  updateRotationSettings,
} from "../controllers/roleRotationController.js";

const router = express.Router();

router.get("/:id/rotation", authenticate, getRotationSettings);
router.put("/:id/rotation", authenticate, updateRotationSettings);
router.delete("/:id/rotation", authenticate, deleteRotation);
router.post("/:id/rotation/cycles", authenticate, startRotationCycle);
router.post("/:id/rotation/reset", authenticate, resetRotation);

export default router;
