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
        const trendAnalysis = analyzeTrends(recentReports);
        
        // Generate AI-powered personalized health plan using OpenAI
        const aiPersonalizedPlan = await generateAIPersonalizedPlan(
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

// Helper function to generate AI-powered personalized plan using OpenAI
const generateAIPersonalizedPlan = async (reports, trends, patientProfile) => {
    try {
        // Extract key metrics from all reports
        const reportMetrics = reports.map(report => {
            const metrics = {};
            if (report.bloodMetrics) {
                Object.entries(report.bloodMetrics).forEach(([key, value]) => {
                    if (value && value.value) {
                        metrics[key] = value.value;
                    }
                });
            }
            if (report.urineMetrics) {
                Object.entries(report.urineMetrics).forEach(([key, value]) => {
                    if (value && value.value) {
                        metrics[key] = value.value;
                    }
                });
            }
            return {
                date: report.createdAt,
                type: report.reportType,
                metrics
            };
        });

        // Prepare the prompt for OpenAI
        const prompt = `Generate a personalized health plan based on multiple health reports over the past 6 months.

Patient Profile:
- Age: ${patientProfile.age}
- Gender: ${patientProfile.gender}
- Blood Group: ${patientProfile.bloodGroup || 'Unknown'}
- Medical History: ${patientProfile.medicalHistory.join(', ') || 'None reported'}
- Current Medications: ${patientProfile.currentMedications.join(', ') || 'None reported'}

Health Report Trends (${reports.length} reports analyzed):
${JSON.stringify(trends, null, 2)}

Report Metrics Summary:
${JSON.stringify(reportMetrics, null, 2)}

Based on this data, create a comprehensive personalized health plan in JSON format with the following structure:
{
  "priorities": ["Priority 1", "Priority 2"],
  "shortTermGoals": ["Goal 1", "Goal 2"],
  "longTermGoals": ["Goal 1", "Goal 2"],
  "actionItems": ["Action 1", "Action 2"],
  "riskMitigation": ["Risk mitigation strategy 1", "Risk mitigation strategy 2"],
  "successMetrics": ["Metric 1", "Metric 2"],
  "dietaryRecommendations": ["Recommendation 1", "Recommendation 2"],
  "exerciseRecommendations": ["Recommendation 1", "Recommendation 2"],
  "lifestyleChanges": ["Change 1", "Change 2"],
  "followUpSchedule": "Recommended follow-up schedule",
  "summary": "Brief summary of the health plan"
}`;

        console.log('Calling OpenAI API for personalized health plan...');
        // Call OpenAI API
        const response = await AIHealthRecommendationService.openai.chat.completions.create({
            model: "gpt-3.5-turbo", // Using a more widely available model
            messages: [{ role: "user", content: prompt }],
            temperature: 0.3,
            max_tokens: 2000
        });
        console.log('OpenAI API response received');

        // Parse the response
        const aiResponse = response.choices[0].message.content;
        
        try {
            // Extract JSON from the response
            const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);  
            const jsonString = jsonMatch ? jsonMatch[0] : null;
            
            if (jsonString) {
                const aiPlan = JSON.parse(jsonString);
                // Add metadata
                aiPlan.generatedBy = 'AI';
                aiPlan.reportsAnalyzed = reports.length;
                aiPlan.timeRange = '6 months';
                return aiPlan;
            } else {
                throw new Error("No valid JSON found in AI response");
            }
        } catch (parseError) {
            console.error("Error parsing AI response:", parseError);
            // Fall back to built-in plan if parsing fails
            return generateFallbackPlan(reports, trends, patientProfile);
        }
    } catch (error) {
        console.error('Error generating AI personalized plan:', error);
        // Fall back to built-in plan if API call fails
        return generateFallbackPlan(reports, trends, patientProfile);
    }
};

// Fallback function to generate personalized plan if AI fails
const generateFallbackPlan = (reports, trends, patientProfile) => {
    const plan = {
        priorities: [],
        shortTermGoals: [],
        longTermGoals: [],
        actionItems: [],
        riskMitigation: [],
        successMetrics: [],
        dietaryRecommendations: [],
        exerciseRecommendations: [],
        lifestyleChanges: [],
        followUpSchedule: "3 months",
        summary: "Personalized health plan based on your recent health reports",
        generatedBy: "System"
    };

    // Analyze concerning trends
    if (trends.glucose.concern && trends.glucose.trend === 'increasing') {
        plan.priorities.push('Diabetes Prevention/Management');
        plan.shortTermGoals.push('Reduce blood glucose by 10% in 3 months');
        plan.actionItems.push('Implement carbohydrate counting');
        plan.actionItems.push('30-minute post-meal walks');
        plan.riskMitigation.push('Regular glucose monitoring');
        plan.successMetrics.push('Fasting glucose < 100 mg/dL');
        plan.dietaryRecommendations.push('Low glycemic index diet');
        plan.exerciseRecommendations.push('Regular moderate exercise, 150 minutes per week');
    }

    if (trends.cholesterol.concern && trends.cholesterol.trend === 'increasing') {
        plan.priorities.push('Cardiovascular Health');
        plan.shortTermGoals.push('Lower cholesterol levels within 6 months');
        plan.actionItems.push('Heart-healthy Mediterranean diet');
        plan.actionItems.push('150 minutes aerobic exercise weekly');
        plan.successMetrics.push('Total cholesterol < 200 mg/dL');
        plan.dietaryRecommendations.push('Reduce saturated fats and increase omega-3 fatty acids');
        plan.exerciseRecommendations.push('Cardiovascular exercise 3-5 times per week');
    }

    // Age-specific recommendations
    if (patientProfile.age > 50) {
        plan.longTermGoals.push('Maintain bone density and muscle mass');
        plan.actionItems.push('Resistance training 2-3x per week');
        plan.successMetrics.push('Annual bone density within normal range');
        plan.exerciseRecommendations.push('Weight-bearing exercises');
        plan.dietaryRecommendations.push('Calcium and vitamin D rich foods');
    }

    // General wellness goals
    plan.longTermGoals.push('Maintain optimal health metrics');
    plan.actionItems.push('Annual comprehensive health screening');
    plan.actionItems.push('Stress management and adequate sleep');
    plan.lifestyleChanges.push('Maintain 7-8 hours of quality sleep');
    plan.lifestyleChanges.push('Practice stress reduction techniques');

    return plan;
};

export default {
    getHealthInsights,
    getPersonalizedRecommendations
};
