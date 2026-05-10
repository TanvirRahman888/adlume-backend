import express from "express";
import {
  createService,
  deleteService,
  getServiceBySlug,
  getServices,
  updateService,
} from "../controllers/serviceController.js";
import { adminOnly, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getServices);
router.get("/:slug", getServiceBySlug);

router.post("/", protect, adminOnly, createService);
router.patch("/:id", protect, adminOnly, updateService);
router.delete("/:id", protect, adminOnly, deleteService);

export default router;