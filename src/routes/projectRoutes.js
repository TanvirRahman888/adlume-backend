import express from "express";
import {
  createProject,
  deleteProject,
  getProjectBySlug,
  getProjects,
  updateProject,
} from "../controllers/projectController.js";

const router = express.Router();

router.get("/", getProjects);
router.get("/:slug", getProjectBySlug);

router.post("/", createProject);
router.patch("/:id", updateProject);
router.delete("/:id", deleteProject);

export default router;