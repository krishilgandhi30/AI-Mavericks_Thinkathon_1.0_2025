import express from 'express';
import { 
    getPatientHealthAnalysis,
    sendPatientReminder,
    scheduleAutomaticReminders
} from '../controllers/doctorPatient.controllers.js';
import { Authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

// Get patient's health analysis for the last 6 months
router.get('/patients/:patientId/analysis', Authenticate, getPatientHealthAnalysis);

// Send reminder email to patient
router.post('/patients/:patientId/send-reminder', Authenticate, sendPatientReminder);

// Schedule automatic reminders for a patient
router.post('/patients/:patientId/schedule-reminders', Authenticate, scheduleAutomaticReminders);

export default router;