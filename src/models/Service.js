import mongoose from "mongoose";

const ServicePackageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    price: {
      type: String,
      required: true,
      trim: true,
    },

    billingType: {
      type: String,
      enum: ["one-time", "monthly", "custom"],
      default: "one-time",
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    features: {
      type: [String],
      default: [],
    },

    popular: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
);

const ServiceSectionSchema = new mongoose.Schema(
  {
    heading: {
      type: String,
      required: true,
      trim: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false }
);

const ServiceFaqSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
      trim: true,
    },
    answer: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false }
);

const ServiceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    shortDescription: {
      type: String,
      required: true,
      trim: true,
    },

    heroTitle: {
      type: String,
      required: true,
      trim: true,
    },

    heroDescription: {
      type: String,
      required: true,
      trim: true,
    },

    icon: {
      type: String,
      required: true,
      trim: true,
    },

    image: {
      type: String,
      required: true,
      trim: true,
    },

    features: {
      type: [String],
      default: [],
    },

    benefits: {
      type: [String],
      default: [],
    },

    process: {
      type: [String],
      default: [],
    },

    packages: {
      type: [ServicePackageSchema],
      default: [],
    },

    sections: {
      type: [ServiceSectionSchema],
      default: [],
    },

    faqs: {
      type: [ServiceFaqSchema],
      default: [],
    },

    order: {
      type: Number,
      default: 0,
    },

    featured: {
      type: Boolean,
      default: false,
    },

    status: {
      type: String,
      enum: ["draft", "published", "hold"],
      default: "published",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Service ||
  mongoose.model("Service", ServiceSchema);