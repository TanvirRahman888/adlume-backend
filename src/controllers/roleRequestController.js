import RoleRequest from "../models/RoleRequest.js";
import User from "../models/User.js";

export async function createRoleRequest(req, res) {
  try {
    const { requestedRole, reason } = req.body;
    const user = req.dbUser;

    if (!requestedRole || !reason) {
      return res.status(400).json({
        success: false,
        message: "Requested role and reason are required.",
      });
    }

    if (!["manager", "admin"].includes(requestedRole)) {
      return res.status(400).json({
        success: false,
        message: "Invalid requested role.",
      });
    }

    if (user.role === "user" && requestedRole !== "manager") {
      return res.status(403).json({
        success: false,
        message: "Users can only request manager role.",
      });
    }

    if (user.role === "manager" && requestedRole !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Managers can only request admin role.",
      });
    }

    if (user.role === "admin") {
      return res.status(400).json({
        success: false,
        message: "Admins do not need to request another role.",
      });
    }

    const existingPendingRequest = await RoleRequest.findOne({
      userId: user._id,
      requestedRole,
      status: "pending",
    });

    if (existingPendingRequest) {
      return res.status(409).json({
        success: false,
        message: "You already have a pending request for this role.",
      });
    }

    const roleRequest = await RoleRequest.create({
      userId: user._id,
      requestedRole,
      currentRole: user.role,
      reason,
    });

    res.status(201).json({
      success: true,
      message: "Role request submitted successfully.",
      roleRequest,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create role request.",
    });
  }
}

export async function getMyRoleRequests(req, res) {
  try {
    const requests = await RoleRequest.find({
      userId: req.dbUser._id,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: requests.length,
      requests,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch your role requests.",
    });
  }
}

export async function getAllRoleRequests(req, res) {
  try {
    const { status } = req.query;

    const filter = {};

    if (status) {
      filter.status = status;
    }

    const requests = await RoleRequest.find(filter)
      .populate("userId", "name email role status")
      .populate("reviewedBy", "name email role")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: requests.length,
      requests,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch role requests.",
    });
  }
}

export async function reviewRoleRequest(req, res) {
  try {
    const { status, reviewNote } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be approved or rejected.",
      });
    }

    const roleRequest = await RoleRequest.findById(req.params.id);

    if (!roleRequest) {
      return res.status(404).json({
        success: false,
        message: "Role request not found.",
      });
    }

    if (roleRequest.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "This request has already been reviewed.",
      });
    }

    roleRequest.status = status;
    roleRequest.reviewNote = reviewNote || "";
    roleRequest.reviewedBy = req.dbUser._id;
    roleRequest.reviewedAt = new Date();

    await roleRequest.save();

    if (status === "approved") {
      await User.findByIdAndUpdate(roleRequest.userId, {
        role: roleRequest.requestedRole,
      });
    }

    res.status(200).json({
      success: true,
      message:
        status === "approved"
          ? "Role request approved successfully."
          : "Role request rejected successfully.",
      roleRequest,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to review role request.",
    });
  }
}