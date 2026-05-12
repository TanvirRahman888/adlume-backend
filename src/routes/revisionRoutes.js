import express from "express";
import {
  createRevisionRequest,
  getOrderRevisions,
  updateRevisionStatus,
} from "../controllers/revisionController.js";
import {
  loadDbUser,
  managerOrAdmin,
  protect,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/orders/:orderId", protect, loadDbUser, createRevisionRequest);

router.get("/orders/:orderId", protect, loadDbUser, getOrderRevisions);

router.patch(
  "/:id/status",
  protect,
  loadDbUser,
  managerOrAdmin,
  updateRevisionStatus
);

export default router;