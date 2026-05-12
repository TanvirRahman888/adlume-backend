import express from "express";
import {
  createProject,
  deleteProject,
  getProjectBySlug,
  getProjects,
  updateProject,
} from "../controllers/projectController.js";
import {
  adminOnly,
  loadDbUser,
  protect,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getProjects);
router.get("/:slug", getProjectBySlug);

router.post("/", protect, loadDbUser, adminOnly, createProject);
router.patch("/:id", protect, loadDbUser, adminOnly, updateProject);
router.delete("/:id", protect, loadDbUser, adminOnly, deleteProject);

export default router;