import Review from "../models/Review.js";

export async function getReviews(req, res) {
  try {
    const { featured } = req.query;

    const filter = {
      status: "published",
    };

    if (featured === "true") {
      filter.featured = true;
    }

    const reviews = await Review.find(filter).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch reviews.",
    });
  }
}

export async function getReviewById(req, res) {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found.",
      });
    }

    res.status(200).json({
      success: true,
      review,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch review.",
    });
  }
}

export async function createReview(req, res) {
  try {
    const { name, business, time, feedback, rating, featured, status } =
      req.body;

    if (!name || !business || !feedback || !rating) {
      return res.status(400).json({
        success: false,
        message: "Name, business, feedback, and rating are required.",
      });
    }

    const review = await Review.create({
      name,
      business,
      time,
      feedback,
      rating,
      featured,
      status,
    });

    res.status(201).json({
      success: true,
      message: "Review created successfully.",
      review,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create review.",
    });
  }
}

export async function updateReview(req, res) {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found.",
      });
    }

    const updatedReview = await Review.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      success: true,
      message: "Review updated successfully.",
      review: updatedReview,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update review.",
    });
  }
}

export async function deleteReview(req, res) {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found.",
      });
    }

    await review.deleteOne();

    res.status(200).json({
      success: true,
      message: "Review deleted successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete review.",
    });
  }
}