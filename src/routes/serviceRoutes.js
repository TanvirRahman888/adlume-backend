import express from "express";
import {
  createService,
  deleteService,
  getServiceBySlug,
  getServices,
  updateService,
} from "../controllers/serviceController.js";
import {
  adminOnly,
  loadDbUser,
  managerOrAdmin,
  protect,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getServices);
router.get("/:slug", getServiceBySlug);

router.post("/", protect, loadDbUser, managerOrAdmin, createService);
router.patch("/:id", protect, loadDbUser, managerOrAdmin, updateService);
router.delete("/:id", protect, loadDbUser, adminOnly, deleteService);

export default router;