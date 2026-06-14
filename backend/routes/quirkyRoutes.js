import express from 'express';
import { logMood, getTrivia, getDoctorSuperpower, generateDischargeHaiku } from '../controllers/quirkyController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/mood')
  .post(protect, logMood);

router.route('/trivia')
  .get(getTrivia); // Public route for waiting rooms

router.route('/doctor/:id/superpower')
  .get(protect, getDoctorSuperpower);

router.route('/haiku')
  .post(protect, authorize('Doctor', 'Hospital Admin', 'Super Admin'), generateDischargeHaiku);

export default router;
