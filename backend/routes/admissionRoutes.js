import express from 'express';
import { admitPatient, getAdmissions, updateAdmissionStatus, addVitals } from '../controllers/admissionController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, authorize('Super Admin', 'Hospital Admin', 'Doctor', 'Receptionist'), admitPatient)
  .get(protect, authorize('Super Admin', 'Hospital Admin', 'Doctor', 'Nurse'), getAdmissions);

router.route('/:id/status')
  .put(protect, authorize('Super Admin', 'Hospital Admin', 'Doctor', 'Nurse'), updateAdmissionStatus);

router.route('/:id/vitals')
  .post(protect, authorize('Nurse', 'Doctor'), addVitals);

export default router;
