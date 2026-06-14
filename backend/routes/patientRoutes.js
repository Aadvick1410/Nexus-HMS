import express from 'express';
import { createPatientProfile, getPatientProfile, getPatientById, getAllPatients, addMedicalHistory, updatePatientAdmin } from '../controllers/patientController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Patients can create and view their own profiles, Staff can view all
router.route('/')
  .post(protect, createPatientProfile)
  .get(protect, authorize('Super Admin', 'Hospital Admin', 'Doctor', 'Nurse', 'Receptionist'), getAllPatients);

router.route('/profile')
  .get(protect, getPatientProfile);

router.route('/profile/history')
  .put(protect, addMedicalHistory);

// Staff can view patient by ID
router.route('/:id')
  .get(protect, authorize('Super Admin', 'Hospital Admin', 'Doctor', 'Nurse', 'Receptionist', 'Billing Executive'), getPatientById);

router.route('/admin/:id')
  .put(protect, authorize('Super Admin', 'Hospital Admin', 'Receptionist'), updatePatientAdmin);

export default router;
