import admin from "../config/firebaseAdmin.js";
import User from "../models/User.js";

export async function protect(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Not authorized. Token missing.",
      });
    }

    const token = authHeader.split(" ")[1];

    const decodedToken = await admin.auth().verifyIdToken(token);

    req.user = decodedToken;

    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Not authorized. Invalid token.",
    });
  }
}

export async function loadDbUser(req, res, next) {
  try {
    const dbUser = await User.findOne({
      firebaseUid: req.user.uid,
    });

    if (!dbUser) {
      return res.status(404).json({
        success: false,
        message: "User profile not found.",
      });
    }

    if (dbUser.status === "blocked") {
      return res.status(403).json({
        success: false,
        message: "Your account has been blocked.",
      });
    }

    req.dbUser = dbUser;

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to load user profile.",
    });
  }
}

export function authorizeRoles(...roles) {
  return (req, res, next) => {
    if (!req.dbUser) {
      return res.status(401).json({
        success: false,
        message: "User profile not loaded.",
      });
    }

    if (!roles.includes(req.dbUser.role)) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to perform this action.",
      });
    }

    next();
  };
}

export function adminOnly(req, res, next) {
  if (!req.dbUser) {
    return res.status(401).json({
      success: false,
      message: "User profile not loaded.",
    });
  }

  if (req.dbUser.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Admin access required.",
    });
  }

  next();
}

export function managerOrAdmin(req, res, next) {
  if (!req.dbUser) {
    return res.status(401).json({
      success: false,
      message: "User profile not loaded.",
    });
  }

  if (!["manager", "admin"].includes(req.dbUser.role)) {
    return res.status(403).json({
      success: false,
      message: "Manager or admin access required.",
    });
  }

  next();
}