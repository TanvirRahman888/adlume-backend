import express from "express";
import {
  createReview,
  deleteReview,
  getReviewById,
  getReviews,
  updateReview,
} from "../controllers/reviewController.js";
import {
  adminOnly,
  loadDbUser,
  protect,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getReviews);
router.get("/:id", getReviewById);

router.post("/", protect, loadDbUser, adminOnly, createReview);
router.patch("/:id", protect, loadDbUser, adminOnly, updateReview);
router.delete("/:id", protect, loadDbUser, adminOnly, deleteReview);

export default router;