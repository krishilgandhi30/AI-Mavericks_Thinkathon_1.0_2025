import express from "express";
import User from "../models/user.models.js";
import { Authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();

// Middleware to check admin role
const requireAdmin = async (req, res, next) => {
	try {
		const user = await User.findById(req.user.id);
		if (!user || user.role !== "admin") {
			return res.status(403).json({ message: "Admin access required" });
		}
		next();
	} catch (error) {
		res.status(500).json({ message: "Server error" });
	}
};

// Get admin dashboard stats (healthcare-focused)
router.get("/dashboard", Authenticate, requireAdmin, async (req, res) => {
	try {
		const totalUsers = await User.countDocuments({ role: { $in: ["patient", "doctor"] } });
		const totalPatients = await User.countDocuments({ role: "patient" });
		const totalDoctors = await User.countDocuments({ role: "doctor" });
		const bannedUsers = await User.countDocuments({ isBanned: true });

		res.json({
			stats: {
				totalUsers,
				totalPatients,
				totalDoctors,
				bannedUsers
			}
		});
	} catch (error) {
		console.error("Admin dashboard error:", error);
		res.status(500).json({ message: "Server error" });
	}
});

// Get all users with pagination (healthcare-focused)
router.get("/users", Authenticate, requireAdmin, async (req, res) => {
	try {
		const { page = 1, limit = 20, search, status, role } = req.query;

		let query = { role: { $in: ["patient", "doctor"] } };

		if (search) {
			query.$or = [
				{ username: { $regex: search, $options: "i" } },
				{ fullName: { $regex: search, $options: "i" } },
				{ email: { $regex: search, $options: "i" } },
			];
		}

		if (status === "banned") {
			query.isBanned = true;
		} else if (status === "active") {
			query.isBanned = false;
		}

		if (role && ["patient", "doctor"].includes(role)) {
			query.role = role;
		}

		const skip = (page - 1) * limit;
		const users = await User.find(query)
			.select("-password -resetPasswordToken -resetPasswordExpires")
			.skip(skip)
			.limit(parseInt(limit))
			.sort({ createdAt: -1 });

		const total = await User.countDocuments(query);

		res.json({
			users,
			pagination: {
				page: parseInt(page),
				limit: parseInt(limit),
				total,
				pages: Math.ceil(total / limit),
			},
		});
	} catch (error) {
		console.error("Admin get users error:", error);
		res.status(500).json({ message: "Server error" });
	}
});

// Ban/Unban user
router.put("/users/:id/ban", Authenticate, requireAdmin, async (req, res) => {
	try {
		const { banned } = req.body;
		const user = await User.findById(req.params.id);

		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		user.isBanned = banned;
		await user.save();

		res.json({
			message: `User ${banned ? "banned" : "unbanned"} successfully`,
			user: await User.findById(user._id).select("-password -resetPasswordToken -resetPasswordExpires")
		});
	} catch (error) {
		console.error("Admin ban user error:", error);
		res.status(500).json({ message: "Server error" });
	}
});

export default router;
