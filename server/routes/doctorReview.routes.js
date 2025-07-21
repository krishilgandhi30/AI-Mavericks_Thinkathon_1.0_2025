import express from 'express';
import { 
    getRecommendationDetails,
    updateRecommendation,
    approveRecommendation,
    rejectRecommendation,
    getDoctorDashboardStats,
    provideFeedbackToAI,
    getPendingRecommendations,
    getAssignedRecommendations
} from '../controllers/doctorReview.controllers.js';
import { Authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

// Doctor dashboard and statistics
router.get('/stats', Authenticate, getDoctorDashboardStats);

// Add specific routes BEFORE parameterized routes
router.get('/pending', Authenticate, getPendingRecommendations);
router.get('/assigned', Authenticate, getAssignedRecommendations);

// Recommendation review routes
router.get('/:recommendationId', Authenticate, getRecommendationDetails);
router.put('/:recommendationId', Authenticate, updateRecommendation);
router.post('/:recommendationId/approve', Authenticate, approveRecommendation);
router.post('/:recommendationId/reject', Authenticate, rejectRecommendation);

// AI feedback
router.post('/:recommendationId/feedback', Authenticate, provideFeedbackToAI);

export default router;
