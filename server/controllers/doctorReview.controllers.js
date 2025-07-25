import Recommendation from '../models/recommendation.model.js';
import HealthReport from '../models/healthReport.models.js';
import AIHealthRecommendationService from '../services/aiRecommendationService.js';

// Get single recommendation details for review
export const getRecommendationDetails = async (req, res) => {
    try {
        const { recommendationId } = req.params;
        
        const recommendation = await Recommendation.findById(recommendationId)
            .populate('patientId', 'fullName email gender dateOfBirth medicalHistory bloodGroup age')
            .populate('reportId') // This includes all report data
            .populate('doctorId', 'fullName specialization');

        if (!recommendation) {
            return res.status(404).json({ message: 'Recommendation not found' });
        }

        // Get the full health report data
        if (recommendation.reportId && recommendation.reportId._id) {
            const fullReport = await HealthReport.findById(recommendation.reportId._id);
            if (fullReport) {
                recommendation.reportId.reportData = fullReport.reportData;
            }
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
        recommendation.finalRecommendations = recommendation.aiSuggestions || {
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
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const stats = await Promise.all([
            // Pending reviews (unassigned)
            Recommendation.countDocuments({ 
                doctorId: null, 
                reviewStatus: 'pending' 
            }),
            
            // Assigned to me
            Recommendation.countDocuments({ 
                doctorId, 
                reviewStatus: { $in: ['pending', 'under_review'] } 
            }),
            
            // Completed today
            Recommendation.countDocuments({ 
                doctorId, 
                reviewStatus: { $in: ['approved', 'rejected'] },
                reviewedAt: { $gte: today }
            }),
            
            // Total reviews
            Recommendation.countDocuments({ 
                doctorId,
                reviewStatus: { $in: ['approved', 'rejected'] }
            }),
            
            // Recent activity
            Recommendation.find({ 
                doctorId,
                reviewedAt: { $exists: true }
            })
            .populate('patientId', 'fullName')
            .populate('reportId', 'reportType')
            .sort({ reviewedAt: -1 })
            .limit(5)
        ]);
        
        // Format recent activity
        const recentActivity = stats[4].map(rec => {
            const action = rec.reviewStatus === 'approved' ? 'Approved' : 'Rejected';
            const patientName = rec.patientId?.fullName || 'Unknown Patient';
            const reportType = rec.reportId?.reportType || 'Unknown';
            const date = new Date(rec.reviewedAt).toLocaleDateString();
            return `${action} ${reportType} report for ${patientName} on ${date}`;
        });

        res.json({
            pendingReviews: stats[0],
            assignedToMe: stats[1],
            completedToday: stats[2],
            totalReviews: stats[3],
            recentActivity
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

// Get pending recommendations for review
export const getPendingRecommendations = async (req, res) => {
    try {
        const recommendations = await Recommendation.find({ 
            doctorId: null, 
            reviewStatus: 'pending' 
        })
        .populate('patientId', 'fullName age bloodGroup')
        .populate('reportId', 'reportType')
        .sort({ createdAt: -1 });

        res.json({ recommendations });
    } catch (error) {
        console.error('Error fetching pending recommendations:', error);
        res.status(500).json({ message: 'Failed to fetch pending recommendations' });
    }
};

// Get recommendations assigned to the current doctor
export const getAssignedRecommendations = async (req, res) => {
    try {
        const doctorId = req.user.id;
        
        const recommendations = await Recommendation.find({ 
            doctorId
            // No status filter - show all reports assigned to this doctor
        })        
        .populate('patientId', 'fullName email')
        .populate('reportId', 'reportType reportData')
        .sort({ reviewedAt: -1 });

        res.json({ recommendations });
    } catch (error) {
        console.error('Error fetching assigned recommendations:', error);
        res.status(500).json({ message: 'Failed to fetch assigned recommendations' });
    }
};

// Update AI recommendations based on doctor feedback
export const updateAIRecommendations = async (req, res) => {
    try {
        const { recommendationId } = req.params;
        const { doctorFeedbackToAI } = req.body;

        if (!doctorFeedbackToAI) {
            return res.status(400).json({ message: 'Doctor feedback is required to update AI recommendations' });
        }

        // Find the recommendation
        const recommendation = await Recommendation.findById(recommendationId)
            .populate('reportId')
            .populate('patientId', 'fullName email gender dateOfBirth medicalHistory bloodGroup age');

        if (!recommendation) {
            return res.status(404).json({ message: 'Recommendation not found' });
        }

        // Get patient profile for enhanced analysis
        const patientProfile = {
            age: recommendation.patientId.age || 30,
            gender: recommendation.patientId.gender || 'unknown',
            bloodGroup: recommendation.patientId.bloodGroup,
            medicalHistory: recommendation.patientId.medicalHistory || [],
            currentMedications: recommendation.patientId.currentMedications || []
        };

        // Add doctor feedback to the recommendation object before passing it to the service
        recommendation.doctorFeedbackToAI = doctorFeedbackToAI;
        
        // Generate updated AI analysis based on doctor feedback using OpenAI
        const updatedAIInsights = await AIHealthRecommendationService.getAIInsights(
            recommendation,
            patientProfile
        );

        // Update the recommendation with new AI insights
        recommendation.aiSuggestions = updatedAIInsights;
        recommendation.doctorFeedbackToAI = doctorFeedbackToAI;
        recommendation.reviewStatus = 'under_review';
        recommendation.lastModified = new Date();

        await recommendation.save();

        res.json({
            message: 'AI recommendations updated successfully based on doctor feedback',
            recommendation
        });

    } catch (error) {
        console.error('Error updating AI recommendations:', error);
        res.status(500).json({ 
            message: 'Failed to update AI recommendations', 
            error: error.message 
        });
    }
};

export default {
    getRecommendationDetails,
    updateRecommendation,
    approveRecommendation,
    rejectRecommendation,
    getDoctorDashboardStats,
    provideFeedbackToAI,
    getPendingRecommendations,
    getAssignedRecommendations,
    updateAIRecommendations
};
