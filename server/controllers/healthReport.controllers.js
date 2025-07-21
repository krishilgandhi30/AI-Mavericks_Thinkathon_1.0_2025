import HealthReport from '../models/healthReport.models.js';
import Recommendation from '../models/recommendation.model.js';
import User from '../models/user.models.js';

// AI Analysis Engine - Mock implementation
const analyzeHealthReport = (reportData) => {
    const { bloodMetrics, urineMetrics, reportType } = reportData;
    
    // Mock AI analysis logic
    const analysis = {
        treatmentPlan: {
            medications: [],
            procedures: [],
            followUpTests: [],
            summary: ''
        },
        lifestyleChanges: {
            diet: [],
            exercise: [],
            habits: [],
            precautions: [],
            summary: ''
        },
        riskFactors: [],
        urgencyLevel: 'medium'
    };

    // Blood test analysis
    if (reportType === 'blood' && bloodMetrics) {
        // Glucose analysis
        if (bloodMetrics.glucose?.value) {
            if (bloodMetrics.glucose.value > 126) {
                analysis.riskFactors.push('Elevated glucose levels - possible diabetes');
                analysis.treatmentPlan.medications.push({
                    name: 'Metformin',
                    dosage: '500mg',
                    frequency: 'Twice daily',
                    duration: '3 months',
                    notes: 'Monitor blood glucose levels'
                });
                analysis.treatmentPlan.followUpTests.push('HbA1c test in 3 months');
                analysis.lifestyleChanges.diet.push('Reduce sugar and refined carbohydrates');
                analysis.lifestyleChanges.exercise.push('30 minutes moderate exercise daily');
                analysis.urgencyLevel = 'high';
            } else if (bloodMetrics.glucose.value > 100) {
                analysis.riskFactors.push('Pre-diabetic glucose levels');
                analysis.lifestyleChanges.diet.push('Low glycemic index diet');
                analysis.lifestyleChanges.exercise.push('Regular cardio exercise');
                analysis.urgencyLevel = 'medium';
            }
        }

        // Cholesterol analysis
        if (bloodMetrics.cholesterol?.value) {
            if (bloodMetrics.cholesterol.value > 240) {
                analysis.riskFactors.push('High cholesterol levels');
                analysis.treatmentPlan.medications.push({
                    name: 'Atorvastatin',
                    dosage: '20mg',
                    frequency: 'Once daily',
                    duration: '6 months',
                    notes: 'Take with evening meal'
                });
                analysis.lifestyleChanges.diet.push('Low saturated fat diet');
                analysis.lifestyleChanges.exercise.push('Aerobic exercise 150 min/week');
            } else if (bloodMetrics.cholesterol.value > 200) {
                analysis.lifestyleChanges.diet.push('Heart-healthy diet with omega-3 fatty acids');
                analysis.lifestyleChanges.exercise.push('Regular physical activity');
            }
        }

        // Hemoglobin analysis
        if (bloodMetrics.hemoglobin?.value) {
            if (bloodMetrics.hemoglobin.value < 12) {
                analysis.riskFactors.push('Low hemoglobin - possible anemia');
                analysis.treatmentPlan.medications.push({
                    name: 'Iron supplement',
                    dosage: '65mg elemental iron',
                    frequency: 'Once daily',
                    duration: '3 months',
                    notes: 'Take with vitamin C for better absorption'
                });
                analysis.lifestyleChanges.diet.push('Iron-rich foods (spinach, red meat, lentils)');
                analysis.treatmentPlan.followUpTests.push('Complete blood count in 6 weeks');
            }
        }
    }

    // Generate summaries
    analysis.treatmentPlan.summary = analysis.treatmentPlan.medications.length > 0 
        ? `Treatment plan includes ${analysis.treatmentPlan.medications.length} medication(s) and ${analysis.treatmentPlan.followUpTests.length} follow-up test(s).`
        : 'No specific medications required at this time.';
    
    analysis.lifestyleChanges.summary = 'Lifestyle modifications recommended for optimal health.';

    return analysis;
};

// Upload and analyze health report
export const uploadHealthReport = async (req, res) => {
    try {
        const { reportType, bloodMetrics, urineMetrics, patientNotes } = req.body;
        const patientId = req.user.id;

        // Create health report
        const healthReport = new HealthReport({
            patientId,
            reportType,
            bloodMetrics: reportType === 'blood' ? bloodMetrics : undefined,
            urineMetrics: reportType === 'urine' ? urineMetrics : undefined,
            patientNotes,
            isAnalyzed: false
        });

        await healthReport.save();

        // Generate AI recommendations
        const aiAnalysis = analyzeHealthReport(healthReport);
        
        const recommendation = new Recommendation({
            reportId: healthReport._id,
            patientId,
            aiSuggestions: aiAnalysis,
            reviewStatus: 'pending'
        });

        await recommendation.save();

        // Update health report as analyzed
        healthReport.isAnalyzed = true;
        healthReport.analysisDate = new Date();
        await healthReport.save();

        res.status(201).json({
            message: 'Health report uploaded and analyzed successfully',
            reportId: healthReport._id,
            recommendationId: recommendation._id,
            aiSuggestions: aiAnalysis
        });

    } catch (error) {
        console.error('Error uploading health report:', error);
        res.status(500).json({ message: 'Failed to upload health report' });
    }
};

// Get patient's health reports
export const getPatientReports = async (req, res) => {
    try {
        const patientId = req.user.id;
        
        const reports = await HealthReport.find({ patientId })
            .sort({ createdAt: -1 })
            .populate('patientId', 'fullName email');

        // Get recommendations for each report
        const reportsWithRecommendations = await Promise.all(
            reports.map(async (report) => {
                const recommendation = await Recommendation.findOne({ reportId: report._id })
                    .populate('doctorId', 'fullName specialization');
                
                return {
                    ...report.toObject(),
                    recommendation
                };
            })
        );

        res.json({ reports: reportsWithRecommendations });

    } catch (error) {
        console.error('Error fetching patient reports:', error);
        res.status(500).json({ message: 'Failed to fetch reports' });
    }
};

// Get all pending recommendations for doctors
export const getPendingRecommendations = async (req, res) => {
    try {
        const recommendations = await Recommendation.find({ 
            reviewStatus: { $in: ['pending', 'under_review'] }
        })
        .populate('patientId', 'fullName email gender dateOfBirth')
        .populate('reportId')
        .populate('doctorId', 'fullName specialization')
        .sort({ createdAt: -1 });

        res.json({ recommendations });

    } catch (error) {
        console.error('Error fetching pending recommendations:', error);
        res.status(500).json({ message: 'Failed to fetch pending recommendations' });
    }
};

// Assign doctor to recommendation
export const assignDoctor = async (req, res) => {
    try {
        const { recommendationId } = req.params;
        const doctorId = req.user.id;

        const recommendation = await Recommendation.findById(recommendationId);
        if (!recommendation) {
            return res.status(404).json({ message: 'Recommendation not found' });
        }

        recommendation.doctorId = doctorId;
        recommendation.reviewStatus = 'under_review';
        await recommendation.save();

        res.json({ message: 'Doctor assigned successfully' });

    } catch (error) {
        console.error('Error assigning doctor:', error);
        res.status(500).json({ message: 'Failed to assign doctor' });
    }
};

// Get recommendations assigned to current doctor
export const getDoctorRecommendations = async (req, res) => {
    try {
        const doctorId = req.user.id;
        
        const recommendations = await Recommendation.find({ doctorId })
            .populate('patientId', 'fullName email gender dateOfBirth medicalHistory')
            .populate('reportId')
            .sort({ createdAt: -1 });

        res.json({ recommendations });

    } catch (error) {
        console.error('Error fetching doctor recommendations:', error);
        res.status(500).json({ message: 'Failed to fetch recommendations' });
    }
};

export default {
    uploadHealthReport,
    getPatientReports,
    getPendingRecommendations,
    assignDoctor,
    getDoctorRecommendations
};
