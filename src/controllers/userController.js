import User from "../models/User.js";

export async function syncUser(req, res) {
  try {
    const firebaseUser = req.user;

    if (!firebaseUser?.uid || !firebaseUser?.email) {
      return res.status(400).json({
        success: false,
        message: "Invalid Firebase user data.",
      });
    }

    const existingUser = await User.findOne({
      firebaseUid: firebaseUser.uid,
    });

    if (existingUser) {
      existingUser.name =
        firebaseUser.name || firebaseUser.displayName || existingUser.name;
      existingUser.email = firebaseUser.email;
      existingUser.photoURL = firebaseUser.picture || existingUser.photoURL;
      existingUser.lastLoginAt = new Date();

      await existingUser.save();

      return res.status(200).json({
        success: true,
        message: "User synced successfully.",
        user: existingUser,
      });
    }

    const userCount = await User.countDocuments();

    const newUser = await User.create({
      firebaseUid: firebaseUser.uid,
      name:
        firebaseUser.name ||
        firebaseUser.displayName ||
        firebaseUser.email.split("@")[0],
      email: firebaseUser.email,
      photoURL: firebaseUser.picture || "",
      role: userCount === 0 ? "admin" : "user",
      status: "active",
      lastLoginAt: new Date(),
    });

    res.status(201).json({
      success: true,
      message: "User created successfully.",
      user: newUser,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to sync user.",
    });
  }
}

export async function getMe(req, res) {
  try {
    const firebaseUser = req.user;

    const user = await User.findOne({
      firebaseUid: firebaseUser.uid,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User profile not found. Please sync user first.",
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch user profile.",
    });
  }
}

export async function getUsers(req, res) {
  try {
    const users = await User.find().sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch users.",
    });
  }
}

export async function updateUserRole(req, res) {
  try {
    const { role } = req.body;

    if (!["user", "manager", "admin"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role.",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "User role updated successfully.",
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update user role.",
    });
  }
}

export async function updateUserStatus(req, res) {
  try {
    const { status } = req.body;

    if (!["active", "blocked"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status.",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "User status updated successfully.",
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update user status.",
    });
  }
}