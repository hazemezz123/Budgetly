import express from "express";
import {
  getNotes,
  createNote,
  deleteNote,
  addReply,
} from "../controllers/noteController.js";
import { authenticate as protect } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { createNoteSchema } from "../validators/noteValidators.js";

const router = express.Router();

router.use(protect);

router.get("/", getNotes);
router.post("/", validate({ body: createNoteSchema }), createNote);
router.post("/:id/reply", addReply);
router.delete("/:id", deleteNote);

export default router;
