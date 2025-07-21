import Recommendation from '../models/recommendation.model.js';
import HealthReport from '../models/healthReport.models.js';
import User from '../models/user.models.js';

// Get single recommendation details for review
export const getRecommendationDetails = async (req, res) => {
    try {
        const { recommendationId } = req.params;
        
        const recommendation = await Recommendation.findById(recommendationId)
            .populate('patientId', 'fullName email gender dateOfBirth medicalHistory')
            .populate('reportId')
            .populate('doctorId', 'fullName specialization');

        if (!recommendation) {
            return res.status(404).json({ message: 'Recommendation not found' });
        }

        res.json({ recommendation });

    } catch (error) {
        console.error('Error fetching recommendation details:', error);
        res.status(500).json({ message: 'Failed to fetch recommendation details' });
    }
};

// Update recommendation with doctor modifications
export const updateRecommendation = async (req, res) => {
    try {
        const { recommendationId } = req.params;
        const { 
            doctorModifications, 
            doctorNotes, 
            doctorFeedbackToAI, 
            reviewStatus 
        } = req.body;

        const recommendation = await Recommendation.findById(recommendationId);
        if (!recommendation) {
            return res.status(404).json({ message: 'Recommendation not found' });
        }

        // Update doctor modifications
        if (doctorModifications) {
            recommendation.doctorModifications = doctorModifications;
        }

        // Update review metadata
        if (doctorNotes) recommendation.doctorNotes = doctorNotes;
        if (doctorFeedbackToAI) recommendation.doctorFeedbackToAI = doctorFeedbackToAI;
        
        recommendation.reviewStatus = reviewStatus || 'modified';
        recommendation.reviewedAt = new Date();

        await recommendation.save();

        res.json({ 
            message: 'Recommendation updated successfully',
            recommendation 
        });

    } catch (error) {
        console.error('Error updating recommendation:', error);
        res.status(500).json({ message: 'Failed to update recommendation' });
    }
};

// Approve recommendation (with or without modifications)
export const approveRecommendation = async (req, res) => {
    try {
        const { recommendationId } = req.params;
        const { finalRecommendations, doctorNotes } = req.body;

        const recommendation = await Recommendation.findById(recommendationId);
        if (!recommendation) {
            return res.status(404).json({ message: 'Recommendation not found' });
        }

        // Set final recommendations
        recommendation.finalRecommendations = finalRecommendations || {
            treatmentPlan: recommendation.doctorModifications?.treatmentPlan || recommendation.aiSuggestions.treatmentPlan,
            lifestyleChanges: recommendation.doctorModifications?.lifestyleChanges || recommendation.aiSuggestions.lifestyleChanges
        };

        recommendation.reviewStatus = 'approved';
        recommendation.doctorNotes = doctorNotes || recommendation.doctorNotes;
        recommendation.approvedAt = new Date();
        recommendation.reviewedAt = new Date();

        await recommendation.save();

        res.json({ 
            message: 'Recommendation approved successfully',
            recommendation 
        });

    } catch (error) {
        console.error('Error approving recommendation:', error);
        res.status(500).json({ message: 'Failed to approve recommendation' });
    }
};

// Reject recommendation
export const rejectRecommendation = async (req, res) => {
    try {
        const { recommendationId } = req.params;
        const { doctorNotes, doctorFeedbackToAI } = req.body;

        const recommendation = await Recommendation.findById(recommendationId);
        if (!recommendation) {
            return res.status(404).json({ message: 'Recommendation not found' });
        }

        recommendation.reviewStatus = 'rejected';
        recommendation.doctorNotes = doctorNotes;
        recommendation.doctorFeedbackToAI = doctorFeedbackToAI;
        recommendation.reviewedAt = new Date();

        await recommendation.save();

        res.json({ 
            message: 'Recommendation rejected',
            recommendation 
        });

    } catch (error) {
        console.error('Error rejecting recommendation:', error);
        res.status(500).json({ message: 'Failed to reject recommendation' });
    }
};

// Get doctor dashboard statistics
export const getDoctorDashboardStats = async (req, res) => {
    try {
        const doctorId = req.user.id;

        const stats = await Promise.all([
            // Total recommendations assigned
            Recommendation.countDocuments({ doctorId }),
            
            // Pending reviews
            Recommendation.countDocuments({ 
                doctorId, 
                reviewStatus: { $in: ['pending', 'under_review'] } 
            }),
            
            // Approved this month
            Recommendation.countDocuments({ 
                doctorId, 
                reviewStatus: 'approved',
                approvedAt: { 
                    $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) 
                }
            }),
            
            // Total unassigned recommendations
            Recommendation.countDocuments({ 
                doctorId: null, 
                reviewStatus: 'pending' 
            })
        ]);

        res.json({
            totalAssigned: stats[0],
            pendingReviews: stats[1],
            approvedThisMonth: stats[2],
            unassignedTotal: stats[3]
        });

    } catch (error) {
        console.error('Error fetching doctor dashboard stats:', error);
        res.status(500).json({ message: 'Failed to fetch dashboard statistics' });
    }
};

// Provide feedback to improve AI
export const provideFeedbackToAI = async (req, res) => {
    try {
        const { recommendationId } = req.params;
        const { feedback, rating, suggestions } = req.body;

        const recommendation = await Recommendation.findById(recommendationId);
        if (!recommendation) {
            return res.status(404).json({ message: 'Recommendation not found' });
        }

        recommendation.doctorFeedbackToAI = feedback;
        recommendation.confidenceScore = rating ? rating / 10 : recommendation.confidenceScore;
        
        // Store feedback for AI improvement (in real implementation, this would feed into ML pipeline)
        // For now, we'll just save it in the recommendation document
        recommendation.aiImprovementData = {
            feedback,
            rating,
            suggestions,
            submittedAt: new Date()
        };

        await recommendation.save();

        res.json({ 
            message: 'Feedback submitted successfully',
            feedback: recommendation.aiImprovementData 
        });

    } catch (error) {
        console.error('Error submitting feedback:', error);
        res.status(500).json({ message: 'Failed to submit feedback' });
    }
};

export default {
    getRecommendationDetails,
    updateRecommendation,
    approveRecommendation,
    rejectRecommendation,
    getDoctorDashboardStats,
    provideFeedbackToAI
};
