import express from 'express';
import mongoose from 'mongoose';
import User from '../models/user.models.js';
import { Authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

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
        // Get all fields from request body
        const updateFields = { ...req.body };
        
        // Remove sensitive fields that shouldn't be updated
        delete updateFields.password;
        delete updateFields.resetPasswordToken;
        delete updateFields.resetPasswordExpires;
        delete updateFields._id;
        delete updateFields.__v;
        
        // Use native MongoDB driver to bypass Mongoose validation completely
        const result = await mongoose.connection.collection('users').updateOne(
            { _id: new mongoose.Types.ObjectId(req.user.id) },
            { $set: updateFields }
        );
        
        if (result.matchedCount === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Fetch the updated user
        const user = await User.findById(req.user.id)
            .select('-password -resetPasswordToken -resetPasswordExpires');


        res.json({ message: 'Profile updated successfully', user });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;