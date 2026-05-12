import Order from "../models/Order.js";
import Revision from "../models/Revision.js";

export async function createRevisionRequest(req, res) {
  try {
    const { message } = req.body;

    if (!message || message.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: "Revision message must be at least 10 characters.",
      });
    }

    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    if (order.userId.toString() !== req.dbUser._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only request revision for your own order.",
      });
    }

    if (order.status !== "delivered") {
      return res.status(400).json({
        success: false,
        message: "Revision can only be requested after delivery.",
      });
    }

    const revision = await Revision.create({
      orderId: order._id,
      userId: req.dbUser._id,
      managerId: order.assignedManagerId || null,
      message,
      status: "requested",
    });

    order.status = "revision-requested";
    await order.save();

    res.status(201).json({
      success: true,
      message: "Revision request submitted successfully.",
      revision,
      order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to submit revision request.",
    });
  }
}

export async function getOrderRevisions(req, res) {
  try {
    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    const isOwner = order.userId.toString() === req.dbUser._id.toString();
    const isManagerOrAdmin = ["manager", "admin"].includes(req.dbUser.role);

    if (!isOwner && !isManagerOrAdmin) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to view revisions.",
      });
    }

    const revisions = await Revision.find({
      orderId: order._id,
    })
      .populate("userId", "name email role")
      .populate("managerId", "name email role")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: revisions.length,
      revisions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch revisions.",
    });
  }
}

export async function updateRevisionStatus(req, res) {
  try {
    const { status, responseNote } = req.body;

    if (!["in-progress", "resolved"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid revision status.",
      });
    }

    const revision = await Revision.findById(req.params.id);

    if (!revision) {
      return res.status(404).json({
        success: false,
        message: "Revision request not found.",
      });
    }

    const order = await Order.findById(revision.orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Related order not found.",
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

    revision.status = status;
    revision.responseNote = responseNote || revision.responseNote;
    revision.managerId = req.dbUser._id;

    if (status === "resolved") {
      revision.resolvedAt = new Date();
      order.status = "delivered";
      order.deliveredAt = new Date();
    }

    if (status === "in-progress") {
      order.status = "in-progress";
    }

    await revision.save();
    await order.save();

    res.status(200).json({
      success: true,
      message: "Revision status updated successfully.",
      revision,
      order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update revision.",
    });
  }
}