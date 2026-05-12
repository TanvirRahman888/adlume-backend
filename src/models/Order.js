import mongoose from "mongoose";

const OrderPackageSchema = new mongoose.Schema(
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
  },
  { _id: false }
);

const OrderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
      trim: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },

    assignedManagerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    serviceTitle: {
      type: String,
      required: true,
      trim: true,
    },

    serviceSlug: {
      type: String,
      required: true,
      trim: true,
    },

    selectedPackage: {
      type: OrderPackageSchema,
      required: true,
    },

    projectTitle: {
      type: String,
      required: true,
      trim: true,
    },

    businessName: {
      type: String,
      required: true,
      trim: true,
    },

    contactPhone: {
      type: String,
      required: true,
      trim: true,
    },

    contactEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    country: {
      type: String,
      required: true,
      trim: true,
    },

    projectDescription: {
      type: String,
      required: true,
      trim: true,
    },

    requirements: {
      type: String,
      default: "",
      trim: true,
    },

    deadline: {
      type: String,
      default: "",
      trim: true,
    },

    budgetNote: {
      type: String,
      default: "",
      trim: true,
    },

    status: {
      type: String,
      enum: [
        "pending",
        "accepted",
        "rejected",
        "in-progress",
        "delivered",
        "revision-requested",
        "completed",
        "cancelled",
      ],
      default: "pending",
    },

    adminNote: {
      type: String,
      default: "",
      trim: true,
    },

    managerNote: {
      type: String,
      default: "",
      trim: true,
    },

    rejectionReason: {
      type: String,
      default: "",
      trim: true,
    },

    deliveredAt: {
      type: Date,
      default: null,
    },

    completedAt: {
      type: Date,
      default: null,
    },

    reviewed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

OrderSchema.pre("save", function () {
  if (!this.orderNumber) {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(1000 + Math.random() * 9000);
    this.orderNumber = `ADM-${timestamp}-${random}`;
  }
});

export default mongoose.models.Order || mongoose.model("Order", OrderSchema);