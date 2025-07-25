import HealthReport from '../models/healthReport.models.js';
import Recommendation from '../models/recommendation.model.js';
import User from '../models/user.models.js';
import AIHealthRecommendationService from '../services/aiRecommendationService.js';

// AI Analysis Engine - Enhanced implementation
const analyzeHealthReport = async (reportData, patientProfile = {}) => {
    // Use the enhanced AI service for comprehensive analysis
    try {
        const aiAnalysis = await AIHealthRecommendationService.getAIInsights(reportData, patientProfile);
        return aiAnalysis;
    } catch (error) {
        console.error('Enhanced AI analysis failed, falling back to basic analysis:', error);
        // Fallback to basic analysis
        return AIHealthRecommendationService.generateHealthRecommendations(reportData, patientProfile);
    }
};

// Upload and analyze health report
export const uploadHealthReport = async (req, res) => {
    try {
        const { reportType, bloodMetrics, urineMetrics, patientNotes } = req.body;
        const patientId = req.user.id;

        // Get patient profile for enhanced analysis
        const patient = await User.findById(patientId);
        const patientProfile = {
            age: patient.dateOfBirth ? Math.floor((new Date() - new Date(patient.dateOfBirth)) / (365.25 * 24 * 60 * 60 * 1000)) : 35,
            gender: patient.gender || 'unknown',
            medicalHistory: patient.medicalHistory || [],
            currentMedications: patient.currentMedications || []
        };

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

        // Create recommendation without AI analysis initially
        const recommendation = new Recommendation({
            reportId: healthReport._id,
            patientId,
            reviewStatus: 'pending',
            confidenceScore: 0.8
        });

        await recommendation.save();

        // Update health report as analyzed
        healthReport.isAnalyzed = true;
        healthReport.analysisDate = new Date();
        await healthReport.save();

        res.status(201).json({
            message: 'Health report uploaded successfully. Doctor will be assigned shortly.',
            reportId: healthReport._id,
            recommendationId: recommendation._id,
            status: 'pending'
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

        // Generate AI analysis when doctor is assigned
        const healthReport = await HealthReport.findById(recommendation.reportId);
        const patient = await User.findById(recommendation.patientId);
        
        const patientProfile = {
            age: patient.dateOfBirth ? Math.floor((new Date() - new Date(patient.dateOfBirth)) / (365.25 * 24 * 60 * 60 * 1000)) : 35,
            gender: patient.gender || 'unknown',
            bloodGroup: patient.bloodGroup,
            medicalHistory: patient.medicalHistory || [],
            currentMedications: patient.currentMedications || []
        };

        const aiAnalysis = await analyzeHealthReport(healthReport, patientProfile);
        
        recommendation.doctorId = doctorId;
        recommendation.reviewStatus = 'under_review';
        recommendation.aiSuggestions = aiAnalysis;
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

// Get a specific health report by ID
export const getReportById = async (req, res) => {
    try {
        const { reportId } = req.params;
        
        const report = await HealthReport.findById(reportId);
        if (!report) {
            return res.status(404).json({ message: 'Health report not found' });
        }
        
        // Check if the user is authorized to view this report
        // Allow access if the user is the patient or a doctor
        if (req.user.role !== 'doctor' && report.patientId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to view this report' });
        }
        
        // Get the recommendation for this report
        const recommendation = await Recommendation.findOne({ reportId })
            .populate('doctorId', 'fullName specialization');
        
        res.json({
            report,
            recommendation
        });
        
    } catch (error) {
        console.error('Error fetching health report:', error);
        res.status(500).json({ message: 'Failed to fetch health report' });
    }
};

export default {
    uploadHealthReport,
    getPatientReports,
    getPendingRecommendations,
    assignDoctor,
    getDoctorRecommendations,
    getReportById
};
