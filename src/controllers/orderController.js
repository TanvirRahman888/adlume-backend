import Order from "../models/Order.js";
import Service from "../models/Service.js";
import User from "../models/User.js";

export async function createOrder(req, res) {
  try {
    const {
      serviceId,
      packageName,
      projectTitle,
      businessName,
      contactPhone,
      contactEmail,
      country,
      projectDescription,
      requirements,
      deadline,
      budgetNote,
    } = req.body;

    if (
      !serviceId ||
      !packageName ||
      !projectTitle ||
      !businessName ||
      !contactPhone ||
      !contactEmail ||
      !country ||
      !projectDescription
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Service, package, project title, business name, contact details, country, and project description are required.",
      });
    }

    const service = await Service.findById(serviceId);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found.",
      });
    }

    if (service.status !== "published") {
      return res.status(400).json({
        success: false,
        message: "This service is not available for orders right now.",
      });
    }

    const selectedPackage = service.packages.find(
      (item) => item.name.toLowerCase() === packageName.toLowerCase()
    );

    if (!selectedPackage) {
      return res.status(400).json({
        success: false,
        message: "Selected package not found for this service.",
      });
    }

    const order = await Order.create({
      userId: req.dbUser._id,
      serviceId: service._id,
      serviceTitle: service.title,
      serviceSlug: service.slug,
      selectedPackage: {
        name: selectedPackage.name,
        price: selectedPackage.price,
        billingType: selectedPackage.billingType,
      },
      projectTitle,
      businessName,
      contactPhone,
      contactEmail,
      country,
      projectDescription,
      requirements,
      deadline,
      budgetNote,
      status: "pending",
    });

    res.status(201).json({
      success: true,
      message: "Order placed successfully.",
      order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to place order.",
    });
  }
}

export async function getMyOrders(req, res) {
  try {
    const orders = await Order.find({
      userId: req.dbUser._id,
    })
      .populate("assignedManagerId", "name email role")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch your orders.",
    });
  }
}

export async function getOrders(req, res) {
  try {
    const { status } = req.query;

    const filter = {};

    if (status) {
      filter.status = status;
    }

    if (req.dbUser.role === "manager") {
      filter.$or = [
        { assignedManagerId: req.dbUser._id },
        { assignedManagerId: null },
      ];
    }

    const orders = await Order.find(filter)
      .populate("userId", "name email role status")
      .populate("serviceId", "title slug")
      .populate("assignedManagerId", "name email role")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch orders.",
    });
  }
}

export async function getOrderById(req, res) {
  try {
    const order = await Order.findById(req.params.id)
      .populate("userId", "name email role status")
      .populate("serviceId", "title slug")
      .populate("assignedManagerId", "name email role");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    const isOwner = order.userId._id.toString() === req.dbUser._id.toString();
    const isManagerOrAdmin = ["manager", "admin"].includes(req.dbUser.role);

    if (!isOwner && !isManagerOrAdmin) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to view this order.",
      });
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch order.",
    });
  }
}

export async function updateOrderStatus(req, res) {
  try {
    const { status, managerNote, adminNote, rejectionReason } = req.body;

    const allowedStatuses = [
      "accepted",
      "rejected",
      "in-progress",
      "delivered",
      "cancelled",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status update.",
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    if (req.dbUser.role === "manager") {
      if (
        order.assignedManagerId &&
        order.assignedManagerId.toString() !== req.dbUser._id.toString()
      ) {
        return res.status(403).json({
          success: false,
          message: "This order is assigned to another manager.",
        });
      }

      if (!order.assignedManagerId) {
        order.assignedManagerId = req.dbUser._id;
      }
    }

    order.status = status;

    if (managerNote) {
      order.managerNote = managerNote;
    }

    if (adminNote) {
      order.adminNote = adminNote;
    }

    if (rejectionReason) {
      order.rejectionReason = rejectionReason;
    }

    if (status === "delivered") {
      order.deliveredAt = new Date();
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: "Order status updated successfully.",
      order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update order status.",
    });
  }
}

export async function assignOrderManager(req, res) {
  try {
    const { managerId } = req.body;

    if (!managerId) {
      return res.status(400).json({
        success: false,
        message: "Manager ID is required.",
      });
    }

    const manager = await User.findById(managerId);

    if (!manager || manager.role !== "manager") {
      return res.status(400).json({
        success: false,
        message: "Valid manager not found.",
      });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      {
        assignedManagerId: manager._id,
      },
      {
        new: true,
        runValidators: true,
      }
    )
      .populate("userId", "name email role status")
      .populate("assignedManagerId", "name email role");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Manager assigned successfully.",
      order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to assign manager.",
    });
  }
}

export async function acceptDelivery(req, res) {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    if (order.userId.toString() !== req.dbUser._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only accept delivery for your own order.",
      });
    }

    if (order.status !== "delivered") {
      return res.status(400).json({
        success: false,
        message: "Only delivered orders can be accepted.",
      });
    }

    order.status = "completed";
    order.completedAt = new Date();

    await order.save();

    res.status(200).json({
      success: true,
      message: "Delivery accepted successfully.",
      order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to accept delivery.",
    });
  }
}