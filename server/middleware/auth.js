import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const authenticate = async (req, res, next) => {
  try {
    // An explicit Authorization header wins over an ambient cookie so that
    // API clients presenting their own credential are never shadowed by a
    // stale/different browser cookie.
    const bearerToken = req.header("Authorization")?.replace("Bearer ", "");
    const token = bearerToken || req.cookies?.token;

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Always fetch fresh user data to check current role and isActive status
    const user = await User.findById(decoded.id).select("name username role house isActive");

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    if (!user.isActive) {
      return res.status(401).json({ message: "Account is inactive" });
    }

    // Use fresh data from DB, not stale JWT data
    req.user = {
      id: user._id,
      name: user.name,
      username: user.username,
      role: user.role,
      house: user.house,
    };
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};

export const isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};
