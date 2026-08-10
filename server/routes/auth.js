import express from "express";
import { authenticate } from "../middleware/auth.js";
import {
  register,
  login,
  googleLogin,
  getCurrentUser,
  forgotPassword,
  resetPassword,
} from "../controllers/authController.js";

const router = express.Router();

// Register
router.post("/register", register);

// Login
router.post("/login", login);

// Google login
router.post("/google", googleLogin);

// Get current user
router.get("/me", authenticate, getCurrentUser);

// Forgot Password
router.post("/forgot-password", forgotPassword);

// Reset Password
router.put("/reset-password/:token", resetPassword);

export default router;
