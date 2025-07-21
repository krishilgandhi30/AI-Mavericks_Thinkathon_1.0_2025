import express from 'express';
import { 
    getRecommendationDetails,
    updateRecommendation,
    approveRecommendation,
    rejectRecommendation,
    getDoctorDashboardStats,
    provideFeedbackToAI
} from '../controllers/doctorReview.controllers.js';
import { Authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

// Doctor dashboard and statistics
router.get('/dashboard/stats', Authenticate, getDoctorDashboardStats);

// Recommendation review routes
router.get('/:recommendationId', Authenticate, getRecommendationDetails);
router.put('/:recommendationId', Authenticate, updateRecommendation);
router.post('/:recommendationId/approve', Authenticate, approveRecommendation);
router.post('/:recommendationId/reject', Authenticate, rejectRecommendation);

// AI feedback
router.post('/:recommendationId/feedback', Authenticate, provideFeedbackToAI);

export default router;
