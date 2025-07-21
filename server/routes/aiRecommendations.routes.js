import express from 'express';
import { 
    getHealthInsights, 
    getPersonalizedRecommendations 
} from '../controllers/aiRecommendations.controllers.js';
import { Authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

// Get AI health insights for a specific report
router.get('/insights/:reportId', Authenticate, getHealthInsights);

// Get personalized recommendations based on multiple reports
router.get('/personalized', Authenticate, getPersonalizedRecommendations);

export default router;
