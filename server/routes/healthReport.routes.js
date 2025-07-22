import express from 'express';
import { 
    uploadHealthReport, 
    getPatientReports, 
    getPendingRecommendations, 
    assignDoctor, 
    getDoctorRecommendations,
    getReportById 
} from '../controllers/healthReport.controllers.js';
import { Authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

// Patient routes
router.post('/upload', Authenticate, uploadHealthReport);
router.get('/patient/reports', Authenticate, getPatientReports);
router.get('/:reportId', Authenticate, getReportById);

// Doctor routes
router.get('/pending', Authenticate, getPendingRecommendations);
router.get('/doctor/assigned', Authenticate, getDoctorRecommendations);
router.post('/:recommendationId/assign', Authenticate, assignDoctor);

export default router;
