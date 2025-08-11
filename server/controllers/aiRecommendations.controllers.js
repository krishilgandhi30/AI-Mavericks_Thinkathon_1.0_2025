import HealthReport from '../models/healthReport.models.js';
import Recommendation from '../models/recommendation.model.js';
import User from '../models/user.models.js';
import AIHealthRecommendationService from '../services/aiRecommendationService.js';

// Get AI health insights for a specific report
export const getHealthInsights = async (req, res) => {
    try {
        const { reportId } = req.params;
        const userId = req.user.id;

        // Find the health report
        const healthReport = await Recommendation.findOne({
            reportId,
            patientId: userId
        });

        if (!healthReport) {
            return res.status(404).json({ message: 'Health report not found' });
        }

        // Get user profile for enhanced analysis
        const user = await User.findById(userId);
        const patientProfile = {
            age: user.dateOfBirth ? Math.floor((new Date() - new Date(user.dateOfBirth)) / (365.25 * 24 * 60 * 60 * 1000)) : 30,
            gender: user.gender || 'unknown',
            medicalHistory: user.medicalHistory || [],
            currentMedications: user.currentMedications || []
        };

        res.json({
            message: 'Health insights generated successfully',
            reportId: healthReport._id,
            insights: healthReport?.finalRecommendations,
            patientProfile: {
                age: patientProfile.age,
                gender: patientProfile.gender
            }
        });

    } catch (error) {
        console.error('Error generating health insights:', error);
        res.status(500).json({ message: 'Failed to generate health insights' });
    }
};

// Get personalized health recommendations based on multiple reports
export const getPersonalizedRecommendations = async (req, res) => {
    try {
        const userId = req.user.id;

        // Get user's recent health reports (last 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const recentReports = await HealthReport.find({
            patientId: userId,
            createdAt: { $gte: sixMonthsAgo }
        }).sort({ createdAt: -1 }).limit(10);

        if (recentReports.length === 0) {
            return res.status(404).json({ message: 'No recent health reports found' });
        }

        // Get user profile
        const user = await User.findById(userId);
        const patientProfile = {
            age: user.dateOfBirth ? Math.floor((new Date() - new Date(user.dateOfBirth)) / (365.25 * 24 * 60 * 60 * 1000)) : 35,
            gender: user.gender || 'unknown',
            bloodGroup: user.bloodGroup || 'unknown',
            medicalHistory: user.medicalHistory || [],
            currentMedications: user.currentMedications || []
        };

        // Analyze trends across multiple reports
        const trendAnalysis = AIHealthRecommendationService.analyzeTrends(recentReports);

        // Generate AI-powered personalized health plan using OpenAI
        const aiPersonalizedPlan = await AIHealthRecommendationService.generateAIPersonalizedPlan(
            recentReports,
            trendAnalysis,
            patientProfile
        );

        res.json({
            message: 'Personalized recommendations generated successfully',
            reportsAnalyzed: recentReports.length,
            timeRange: '6 months',
            trendAnalysis,
            recommendations: aiPersonalizedPlan,
            lastUpdated: new Date()
        });

    } catch (error) {
        console.error('Error generating personalized recommendations:', error);
        res.status(500).json({ message: 'Failed to generate personalized recommendations' });
    }
};

export default {
    getHealthInsights,
    getPersonalizedRecommendations
};
