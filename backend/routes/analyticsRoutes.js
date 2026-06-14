import express from 'express';
const router = express.Router();
import { getDashboardAnalytics } from '../controllers/analyticsController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

router
  .route('/dashboard')
  .get(protect, authorize('Super Admin', 'Hospital Admin'), getDashboardAnalytics);

export default router;
