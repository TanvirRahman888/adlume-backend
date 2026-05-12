import express from "express";
import {
  acceptDelivery,
  assignOrderManager,
  createOrder,
  getMyOrders,
  getOrderById,
  getOrders,
  updateOrderStatus,
} from "../controllers/orderController.js";
import {
  adminOnly,
  loadDbUser,
  managerOrAdmin,
  protect,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, loadDbUser, createOrder);
router.get("/my", protect, loadDbUser, getMyOrders);

router.get("/", protect, loadDbUser, managerOrAdmin, getOrders);
router.get("/:id", protect, loadDbUser, getOrderById);

router.patch("/:id/status", protect, loadDbUser, managerOrAdmin, updateOrderStatus);
router.patch("/:id/assign-manager", protect, loadDbUser, adminOnly, assignOrderManager);
router.patch("/:id/accept-delivery", protect, loadDbUser, acceptDelivery);

export default router;