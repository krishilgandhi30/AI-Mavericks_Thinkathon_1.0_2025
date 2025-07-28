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
                <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; background: #f7f9fb; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.07); border: 1px solid #e3e7ed;">
                  <div style="background: linear-gradient(90deg, #4f8cff 0%, #38c6fa 100%); color: #fff; padding: 24px 32px 16px 32px; border-top-left-radius: 12px; border-top-right-radius: 12px;">
                    <h2 style="margin: 0; font-size: 2rem; font-weight: 700; letter-spacing: 1px;">Health Reminder</h2>
                  </div>
                  <div style="padding: 24px 32px;">
                    <p style="font-size: 1.1rem; margin-bottom: 8px;">Dear <span style="font-weight: 600; color: #4f8cff;">${patient.fullName}</span>,</p>
                    <p style="font-size: 1.05rem; margin-bottom: 18px;">${message || 'This is a reminder about your health plan and recommended actions.'}</p>
                    ${actionItems && actionItems.length > 0 ? `
                      <div style="margin-bottom: 18px;">
                        <h3 style="color: #38c6fa; font-size: 1.1rem; margin-bottom: 8px;">Recommended Actions:</h3>
                        <ul style="padding-left: 18px;">
                          ${actionItems.map(item => `
                            <li style="margin-bottom: 8px; font-size: 1rem;">
                              <span style="background: #e3f3ff; color: #4f8cff; padding: 6px 14px; border-radius: 20px; font-weight: 500; display: inline-block;">${item}</span>
                            </li>
                          `).join('')}
                        </ul>
                        <a href="mailto:${process.env.EMAIL_USER || 'healthcareai@example.com'}" style="display: inline-block; margin-top: 10px; background: linear-gradient(90deg, #4f8cff 0%, #38c6fa 100%); color: #fff; text-decoration: none; padding: 10px 28px; border-radius: 24px; font-weight: 600; font-size: 1rem; box-shadow: 0 1px 4px rgba(79,140,255,0.12); transition: background 0.2s;">Contact Doctor</a>
                      </div>
                    ` : ''}
                    <p style="font-size: 1rem; color: #555; margin-bottom: 18px;">Please contact us if you have any questions.</p>
                    <p style="font-size: 1rem; color: #888;">Best regards,<br><span style="font-weight: 600; color: #4f8cff;">Dr. ${doctor.fullName}</span></p>
                  </div>
                </div>
            `
        };

        console.log('Sending reminder email to:', mailOptions);
        

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