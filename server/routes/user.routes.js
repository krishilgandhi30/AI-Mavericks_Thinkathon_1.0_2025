import express from 'express';
import User from '../models/user.models.js';
import { Authenticate } from '../middleware/auth.middleware.js';
import multer from 'multer';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'), false);
        }
    }
});

// Get current user profile
router.get('/profile', Authenticate, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password -resetPasswordToken -resetPasswordExpires');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update user profile (healthcare-focused)
router.put('/profile', Authenticate, async (req, res) => {
    try {
        const {
            location,
            bio,
            specialization,
            licenseNumber,
            yearsOfExperience,
            dateOfBirth,
            gender,
            medicalHistory,
            isProfilePublic
        } = req.body;

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update common fields
        if (location !== undefined) user.location = location;
        if (bio !== undefined) user.bio = bio;
        if (isProfilePublic !== undefined) user.isProfilePublic = isProfilePublic;

        // Update role-specific fields
        if (user.role === 'doctor') {
            if (specialization !== undefined) user.specialization = specialization;
            if (licenseNumber !== undefined) user.licenseNumber = licenseNumber;
            if (yearsOfExperience !== undefined) user.yearsOfExperience = yearsOfExperience;
        } else if (user.role === 'patient') {
            if (dateOfBirth !== undefined) user.dateOfBirth = dateOfBirth;
            if (gender !== undefined) user.gender = gender;
            if (medicalHistory !== undefined) user.medicalHistory = medicalHistory;
        }

        await user.save();

        const updatedUser = await User.findById(req.user.id).select('-password -resetPasswordToken -resetPasswordExpires');
        res.json({ message: 'Profile updated successfully', user: updatedUser });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Upload profile photo
router.post('/profile/photo', Authenticate, upload.single('photo'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // In a real application, you would upload to a cloud service like Cloudinary
        // For now, we'll just simulate the URL
        const photoUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.profilePhoto = photoUrl;
        await user.save();

        res.json({ message: 'Profile photo updated successfully', photoUrl });
    } catch (error) {
        console.error('Upload photo error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;