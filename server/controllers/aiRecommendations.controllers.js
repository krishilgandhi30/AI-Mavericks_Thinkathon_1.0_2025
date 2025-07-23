import HealthReport from '../models/healthReport.models.js';
import Recommendation from '../models/recommendation.model.js';
import User from '../models/user.models.js';

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
            medicalHistory: user.medicalHistory || [],
            currentMedications: user.currentMedications || []
        };

        // Analyze trends across multiple reports
        const trendAnalysis = analyzeTrends(recentReports);
        
        // Generate comprehensive recommendations
        const personalizedRecommendations = await generatePersonalizedPlan(
            recentReports,
            trendAnalysis,
            patientProfile
        );

        res.json({
            message: 'Personalized recommendations generated successfully',
            reportsAnalyzed: recentReports.length,
            timeRange: '6 months',
            trendAnalysis,
            recommendations: personalizedRecommendations,
            lastUpdated: new Date()
        });

    } catch (error) {
        console.error('Error generating personalized recommendations:', error);
        res.status(500).json({ message: 'Failed to generate personalized recommendations' });
    }
};

// Helper function to analyze trends across multiple reports
const analyzeTrends = (reports) => {
    const trends = {
        glucose: { trend: 'stable', values: [], concern: false },
        cholesterol: { trend: 'stable', values: [], concern: false },
        hemoglobin: { trend: 'stable', values: [], concern: false },
        overallHealthTrend: 'improving'
    };

    reports.forEach(report => {
        if (report.bloodMetrics) {
            if (report.bloodMetrics.glucose?.value) {
                trends.glucose.values.push({
                    value: report.bloodMetrics.glucose.value,
                    date: report.createdAt
                });
            }
            if (report.bloodMetrics.cholesterol?.value) {
                trends.cholesterol.values.push({
                    value: report.bloodMetrics.cholesterol.value,
                    date: report.createdAt
                });
            }
            if (report.bloodMetrics.hemoglobin?.value) {
                trends.hemoglobin.values.push({
                    value: report.bloodMetrics.hemoglobin.value,
                    date: report.createdAt
                });
            }
        }
    });

    // Calculate trends for each metric
    Object.keys(trends).forEach(metric => {
        if (trends[metric].values && trends[metric].values.length >= 2) {
            const values = trends[metric].values.sort((a, b) => new Date(a.date) - new Date(b.date));
            const recent = values.slice(-3).map(v => v.value);
            const older = values.slice(0, -3).map(v => v.value);

            if (recent.length > 0 && older.length > 0) {
                const recentAvg = recent.reduce((sum, val) => sum + val, 0) / recent.length;
                const olderAvg = older.reduce((sum, val) => sum + val, 0) / older.length;
                
                const percentChange = ((recentAvg - olderAvg) / olderAvg) * 100;
                
                if (percentChange > 5) {
                    trends[metric].trend = 'increasing';
                    if (metric === 'glucose' || metric === 'cholesterol') {
                        trends[metric].concern = percentChange > 10;
                    }
                } else if (percentChange < -5) {
                    trends[metric].trend = 'decreasing';
                    if (metric === 'hemoglobin') {
                        trends[metric].concern = percentChange < -10;
                    }
                }
            }
        }
    });

    return trends;
};

// Helper function to generate personalized plan
const generatePersonalizedPlan = async (reports, trends, patientProfile) => {
    const plan = {
        priorities: [],
        shortTermGoals: [],
        longTermGoals: [],
        actionItems: [],
        riskMitigation: [],
        successMetrics: []
    };

    // Analyze concerning trends
    if (trends.glucose.concern && trends.glucose.trend === 'increasing') {
        plan.priorities.push('Diabetes Prevention/Management');
        plan.shortTermGoals.push('Reduce blood glucose by 10% in 3 months');
        plan.actionItems.push('Implement carbohydrate counting');
        plan.actionItems.push('30-minute post-meal walks');
        plan.riskMitigation.push('Regular glucose monitoring');
        plan.successMetrics.push('Fasting glucose < 100 mg/dL');
    }

    if (trends.cholesterol.concern && trends.cholesterol.trend === 'increasing') {
        plan.priorities.push('Cardiovascular Health');
        plan.shortTermGoals.push('Lower cholesterol levels within 6 months');
        plan.actionItems.push('Heart-healthy Mediterranean diet');
        plan.actionItems.push('150 minutes aerobic exercise weekly');
        plan.successMetrics.push('Total cholesterol < 200 mg/dL');
    }

    // Age-specific recommendations
    if (patientProfile.age > 50) {
        plan.longTermGoals.push('Maintain bone density and muscle mass');
        plan.actionItems.push('Resistance training 2-3x per week');
        plan.successMetrics.push('Annual bone density within normal range');
    }

    // General wellness goals
    plan.longTermGoals.push('Maintain optimal health metrics');
    plan.actionItems.push('Annual comprehensive health screening');
    plan.actionItems.push('Stress management and adequate sleep');

    return plan;
};

export default {
    getHealthInsights,
    getPersonalizedRecommendations
};
