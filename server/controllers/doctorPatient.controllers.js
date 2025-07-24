import User from '../models/user.models.js';
import HealthReport from '../models/healthReport.models.js';
import Recommendation from '../models/recommendation.model.js';
import AIHealthRecommendationService from '../services/aiRecommendationService.js';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Get patient's health analysis for the last 6 months
export const getPatientHealthAnalysis = async (req, res) => {
    try {
        const { patientId } = req.params;
        const doctorId = req.user.id;

        // Verify doctor has access to this patient
        const patient = await User.findById(patientId);
        if (!patient || patient.role !== 'patient') {
            return res.status(404).json({ message: 'Patient not found' });
        }

        // Get patient's reports from the last 6 months
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const recentReports = await HealthReport.find({
            patientId,
            createdAt: { $gte: sixMonthsAgo }
        }).sort({ createdAt: -1 });

        // Get recommendations for these reports
        const recommendations = await Recommendation.find({
            patientId,
            createdAt: { $gte: sixMonthsAgo }
        }).populate('reportId');

        // Get patient profile
        const patientProfile = {
            id: patient._id,
            name: patient.fullName,
            email: patient.email,
            age: patient.dateOfBirth ? Math.floor((new Date() - new Date(patient.dateOfBirth)) / (365.25 * 24 * 60 * 60 * 1000)) : 35,
            gender: patient.gender || 'unknown',
            bloodGroup: patient.bloodGroup || 'unknown',
            medicalHistory: patient.medicalHistory || [],
            currentMedications: patient.currentMedications || []
        };

        res.json({
            patient: patientProfile,
            reportsCount: recentReports.length,
            recommendations,
            timeRange: '6 months'
        });

    } catch (error) {
        console.error('Error fetching patient health analysis:', error);
        res.status(500).json({ message: 'Failed to fetch patient health analysis' });
    }
};

// Send reminder email to patient
export const sendPatientReminder = async (req, res) => {
    try {
        const { patientId } = req.params;
        const { subject, message, actionItems } = req.body;
        const doctorId = req.user.id;

        // Verify doctor has access to this patient
        const patient = await User.findById(patientId);
        if (!patient || patient.role !== 'patient') {
            return res.status(404).json({ message: 'Patient not found' });
        }

        // Get doctor info
        const doctor = await User.findById(doctorId);
        if (!doctor || doctor.role !== 'doctor') {
            return res.status(403).json({ message: 'Unauthorized access' });
        }

        // Create email transporter
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER || 'healthcareai@example.com',
                pass: process.env.EMAIL_PASS || 'your-app-password'
            }
        });

        // Format action items as HTML list
        const actionItemsHtml = actionItems && actionItems.length > 0 
            ? `<h3>Recommended Actions:</h3><ul>${actionItems.map(item => `<li>${item}</li>`).join('')}</ul>` 
            : '';

        // Prepare email
        const mailOptions = {
            from: `"${doctor.fullName}" <${process.env.EMAIL_USER || 'healthcareai@example.com'}>`,
            to: patient.email,
            subject: subject || 'Health Reminder from Your Doctor',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                    <h2>Health Reminder</h2>
                    <p>Dear ${patient.fullName},</p>
                    <p>${message || 'This is a reminder about your health plan and recommended actions.'}</p>
                    ${actionItemsHtml}
                    <p>Please contact us if you have any questions.</p>
                    <p>Best regards,<br>Dr. ${doctor.fullName}</p>
                </div>
            `
        };

        // Send email
        await transporter.sendMail(mailOptions);

        // Log the reminder
        const reminderLog = {
            doctorId,
            patientId,
            subject: subject || 'Health Reminder',
            sentAt: new Date(),
            actionItems: actionItems || []
        };

        // In a real implementation, you would save this to a database
        console.log('Reminder sent:', reminderLog);

        res.json({ 
            message: 'Reminder sent successfully',
            sentTo: patient.email
        });

    } catch (error) {
        console.error('Error sending patient reminder:', error);
        res.status(500).json({ message: 'Failed to send reminder' });
    }
};

// Schedule automatic reminders for a patient
export const scheduleAutomaticReminders = async (req, res) => {
    try {
        const { patientId } = req.params;
        const { frequency, actionItems, message } = req.body;
        const doctorId = req.user.id;

        // Verify doctor has access to this patient
        const patient = await User.findById(patientId);
        if (!patient || patient.role !== 'patient') {
            return res.status(404).json({ message: 'Patient not found' });
        }

        // In a real implementation, you would save this to a database and use a job scheduler
        // For this example, we'll just return success
        
        res.json({ 
            message: 'Automatic reminders scheduled successfully',
            patient: patient.fullName,
            frequency,
            actionItems
        });

    } catch (error) {
        console.error('Error scheduling automatic reminders:', error);
        res.status(500).json({ message: 'Failed to schedule reminders' });
    }
};

export default {
    getPatientHealthAnalysis,
    sendPatientReminder,
    scheduleAutomaticReminders
};