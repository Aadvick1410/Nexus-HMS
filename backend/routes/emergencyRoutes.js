import express from 'express';
import { registerEmergency, getEmergencyCases, updateEmergencyCase } from '../controllers/emergencyController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, authorize('Super Admin', 'Hospital Admin', 'Doctor', 'Nurse', 'Receptionist'), registerEmergency)
  .get(protect, authorize('Super Admin', 'Hospital Admin', 'Doctor', 'Nurse', 'Receptionist'), getEmergencyCases);

router.route('/:id')
  .put(protect, authorize('Super Admin', 'Hospital Admin', 'Doctor', 'Nurse'), updateEmergencyCase);

export default router;
