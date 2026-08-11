import express from "express";
import { authenticate } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { registerSchema, loginSchema } from "../validators/authValidators.js";
import {
  register,
  login,
  googleLogin,
  getCurrentUser,
  forgotPassword,
  resetPassword,
  logoutUser,
} from "../controllers/authController.js";

const router = express.Router();

// Register
router.post("/register", validate({ body: registerSchema }), register);

// Login
router.post("/login", validate({ body: loginSchema }), login);

// Logout
router.post("/logout", logoutUser);

// Google login
router.post("/google", googleLogin);

// Get current user
router.get("/me", authenticate, getCurrentUser);

// Forgot Password
router.post("/forgot-password", forgotPassword);

// Reset Password
router.put("/reset-password/:token", resetPassword);

export default router;
