import express from "express";
import {
  createReview,
  deleteReview,
  getReviewById,
  getReviews,
  updateReview,
} from "../controllers/reviewController.js";
import { adminOnly, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getReviews);
router.get("/:id", getReviewById);

router.post("/", protect, adminOnly, createReview);
router.patch("/:id", protect, adminOnly, updateReview);
router.delete("/:id", protect, adminOnly, deleteReview);

export default router;