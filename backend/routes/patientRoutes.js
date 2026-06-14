import express from 'express';
import { createPatientProfile, getPatientProfile, getPatientById } from '../controllers/patientController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Patients can create and view their own profiles
router.route('/')
  .post(protect, createPatientProfile);

router.route('/profile')
  .get(protect, getPatientProfile);

// Staff can view patient by ID
router.route('/:id')
  .get(protect, authorize('Super Admin', 'Hospital Admin', 'Doctor', 'Nurse', 'Receptionist', 'Billing Executive'), getPatientById);

export default router;
