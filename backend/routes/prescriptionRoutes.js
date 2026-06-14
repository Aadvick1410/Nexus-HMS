import express from 'express';
import { createPrescription, getPatientPrescriptions, updatePrescriptionStatus } from '../controllers/prescriptionController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, authorize('Doctor'), createPrescription);

router.route('/patient/:patientId')
  .get(protect, authorize('Patient', 'Doctor', 'Pharmacist', 'Super Admin'), getPatientPrescriptions);

router.route('/:id/status')
  .put(protect, authorize('Pharmacist', 'Super Admin'), updatePrescriptionStatus);

export default router;
