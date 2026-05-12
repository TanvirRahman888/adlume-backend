import express from "express";
import {
  createRoleRequest,
  getAllRoleRequests,
  getMyRoleRequests,
  reviewRoleRequest,
} from "../controllers/roleRequestController.js";
import {
  adminOnly,
  loadDbUser,
  protect,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, loadDbUser, createRoleRequest);
router.get("/my", protect, loadDbUser, getMyRoleRequests);

router.get("/", protect, loadDbUser, adminOnly, getAllRoleRequests);
router.patch("/:id/review", protect, loadDbUser, adminOnly, reviewRoleRequest);

export default router;