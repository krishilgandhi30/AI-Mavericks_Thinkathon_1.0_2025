import express from 'express';
import { 
    uploadHealthReport, 
    getPatientReports, 
    getPendingRecommendations, 
    assignDoctor, 
    getDoctorRecommendations 
} from '../controllers/healthReport.controllers.js';
import { Authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

// Patient routes
router.post('/upload', Authenticate, uploadHealthReport);
router.get('/patient/reports', Authenticate, getPatientReports);

// Doctor routes
router.get('/pending', Authenticate, getPendingRecommendations);
router.get('/doctor/assigned', Authenticate, getDoctorRecommendations);
router.post('/:recommendationId/assign', Authenticate, assignDoctor);

export default router;
