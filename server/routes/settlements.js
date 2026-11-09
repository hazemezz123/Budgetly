import express from "express";
import { authenticate, isAdmin } from "../middleware/auth.js";
import {
  getSettlements,
  createSettlementRequest,
  approveSettlement,
  rejectSettlement,
} from "../controllers/settlementController.js";

const router = express.Router();

router.get("/", authenticate, getSettlements);
router.post("/", authenticate, createSettlementRequest);
router.put("/:id/approve", authenticate, isAdmin, approveSettlement);
router.put("/:id/reject", authenticate, isAdmin, rejectSettlement);

export default router;
