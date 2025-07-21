import User from "../models/user.models.js"; //User.find(), User.create(), User.findById(), User.deleteOne()
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export const signup = async (req, res) => {
	try {
		const { 
			username, 
			fullName, 
			email, 
			password, 
			role, 
			specialization, 
			licenseNumber, 
			yearsOfExperience,
			dateOfBirth,
			gender,
			medicalHistory
		} = req.body;

		// Check if user already exists
		const existingUser = await User.findOne({ 
			$or: [{ email }, { username }] 
		});
		
		if (existingUser) {
			return res.status(400).json({ 
				message: existingUser.email === email 
					? "User with this email already exists" 
					: "Username already taken" 
			});
		}

		// Validate role if provided
		const userRole = role && ['patient', 'doctor'].includes(role) ? role : 'patient';

		// Create user data object
		const userData = {
			username,
			fullName,
			email,
			password, // This will be hashed by the pre-save middleware
			role: userRole
		};

		// Add role-specific fields
		if (userRole === 'doctor') {
			userData.specialization = specialization || '';
			userData.licenseNumber = licenseNumber || '';
			userData.yearsOfExperience = yearsOfExperience || 0;
		} else {
			userData.dateOfBirth = dateOfBirth ? new Date(dateOfBirth) : undefined;
			userData.gender = gender || 'other';
			userData.medicalHistory = medicalHistory || [];
		}

		// Create new user
		const newUser = new User(userData);
		await newUser.save();

		// Generate JWT token
		const token = jwt.sign(
			{ id: newUser._id, email: newUser.email, role: newUser.role },
			process.env.JWT_SECRET,
			{ expiresIn: "24h" }
		);

		res.status(201).json({ 
			message: "User created successfully", 
			token, 
			role: newUser.role,
			user: {
				id: newUser._id,
				username: newUser.username,
				fullName: newUser.fullName,
				email: newUser.email,
				role: newUser.role,
				specialization: newUser.specialization
			}
		});
	} catch (error) {
		console.error("Signup error:", error);
		res.status(500).json({ message: "Registration failed" });
	}
};

export const login = async (req, res) => {
	try {
		const { email, password } = req.body;
	console.log("Login attempt with email:", email);

		const user = await User.findOne({ email });
		console.log("User found:", user);
		
		if (!user) return res.status(404).json({ message: "User not found" });

		const passMatch = await bcrypt.compare(password, user.password);
		if (!passMatch)
			return res.status(401).json({ message: "Invalid credentials" });

		const token = jwt.sign(
			{ id: user._id, email: user.email, role: user.role  },
			process.env.JWT_SECRET,
			{ expiresIn: "24h" }
		);

		res.status(200).json({ 
			message: "Login successful", 
			token, 
			role: user.role,
			user: {
				id: user._id,
				username: user.username,
				fullName: user.fullName,
				email: user.email,
				role: user.role,
				specialization: user.specialization
			}
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Login failed" });
	}
}
export const forgotpassword = async (req, res) => {
	try {
		const { email } = req.body;
		const user = await User.findOne({ email });
		if (!user) return res.status(404).json({ message: "User not found" });

		const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
			expiresIn: "15m",
		});

		user.resetPasswordToken = token;
		user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;
		await user.save();

		const origin = req.get("origin") || "http://localhost:5173";
		const resetLink = `${origin}/resetpassword/${token}`;
		res.json({ resetLink, token, message: "Reset link generated successfully" });
	} catch (error) {
		console.log(error);
		res.status(500).json({ message: "Internal server error" });
	}
}
export const resetpassword = async (req, res) => {
	try {
		const { token } = req.params
		const { newPassword } = req.body;
		if (!newPassword || newPassword.length < 6) {
			return res
				.status(400)
				.json({ message: "Password must be at least 6 characters" });
		}
		const user = await User.findOne({
			resetPasswordToken: token,
			resetPasswordExpires: { $gt: Date.now() },
		});
		if (!user)
			return res
				.status(404)
				.json({ message: "User not found or Token Invalid" });

		user.password = newPassword;
		user.resetPasswordToken = undefined;
		user.resetPasswordExpires = undefined;

		await user.save();
		res.json({ message: "Password has been reset successfully" });
	} catch (error) {
		console.error("Reset Password Error:", error);
		res.status(500).json({ message: "Server error during password reset" });
	}
}