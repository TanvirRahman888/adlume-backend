import express from "express";
import {
  getMe,
  getUsers,
  syncUser,
  updateUserRole,
  updateUserStatus,
} from "../controllers/userController.js";
import {
  adminOnly,
  loadDbUser,
  protect,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/sync", protect, syncUser);
router.get("/me", protect, getMe);

router.get("/", protect, loadDbUser, adminOnly, getUsers);
router.patch("/:id/role", protect, loadDbUser, adminOnly, updateUserRole);
router.patch("/:id/status", protect, loadDbUser, adminOnly, updateUserStatus);

export default router;