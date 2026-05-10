import admin from "../config/firebaseAdmin.js";

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
    return res.status(401).json({
      success: false,
      message: "Not authorized. Invalid token.",
    });
  }
}

export function adminOnly(req, res, next) {
  if (!req.user?.email) {
    return res.status(401).json({
      success: false,
      message: "User email not found.",
    });
  }

  if (req.user.email !== process.env.ADMIN_EMAIL) {
    return res.status(403).json({
      success: false,
      message: "Admin access only.",
    });
  }

  next();
}