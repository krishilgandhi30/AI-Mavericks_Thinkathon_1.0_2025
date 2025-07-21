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

// Update user profile
router.put('/profile', Authenticate, async (req, res) => {
    try {
        const {
            location,
            bio,
            skillsOffered,
            skillsWanted,
            availability,
            isProfilePublic
        } = req.body;

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update fields
        if (location !== undefined) user.location = location;
        if (bio !== undefined) user.bio = bio;
        if (skillsOffered !== undefined) user.skillsOffered = skillsOffered;
        if (skillsWanted !== undefined) user.skillsWanted = skillsWanted;
        if (availability !== undefined) user.availability = availability;
        if (isProfilePublic !== undefined) user.isProfilePublic = isProfilePublic;

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

// Search users by skills
router.get('/search', Authenticate, async (req, res) => {
    try {
        const { skill, location, availability, page = 1, limit = 10 } = req.query;

        let query = {
            role:"user",
            isProfilePublic: true,
            isBanned: false,
            _id: { $ne: req.user.id } // Exclude current user
        };

        // Search by skill in skillsOffered
        if (skill) {
            query.$or = [
                { 'skillsOffered.name': { $regex: skill, $options: 'i' } },
                { 'skillsOffered.description': { $regex: skill, $options: 'i' } }
            ];
        }

        // Filter by location
        if (location) {
            query.location = { $regex: location, $options: 'i' };
        }

        // Filter by availability
        if (availability) {
            query.availability = { $in: [availability] };
        }

        const skip = (page - 1) * limit;
        const users = await User.find(query)
            .select('-password -resetPasswordToken -resetPasswordExpires -email')
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ averageRating: -1, createdAt: -1 });

        const total = await User.countDocuments(query);

        res.json({
            users,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Search users error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get user by ID (public profile)
router.get('/:id', Authenticate, async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .select('-password -resetPasswordToken -resetPasswordExpires -email');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!user.isProfilePublic && user._id.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Profile is private' });
        }

        res.json(user);
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;