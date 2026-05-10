import mongoose from "mongoose";

const ReviewSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    business: {
      type: String,
      required: true,
      trim: true,
    },

    time: {
      type: String,
      default: "",
      trim: true,
    },

    feedback: {
      type: String,
      required: true,
      trim: true,
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      default: 5,
    },

    featured: {
      type: Boolean,
      default: true,
    },

    status: {
      type: String,
      enum: ["draft", "published"],
      default: "published",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Review || mongoose.model("Review", ReviewSchema);