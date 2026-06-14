import express from 'express';
import { createPrescription, getPatientPrescriptions, updatePrescriptionStatus, getAllPrescriptions } from '../controllers/prescriptionController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, authorize('Doctor'), createPrescription);

router.route('/all')
  .get(protect, authorize('Pharmacist', 'Doctor', 'Super Admin'), getAllPrescriptions);

router.route('/patient/:patientId')
  .get(protect, authorize('Patient', 'Doctor', 'Pharmacist', 'Super Admin'), getPatientPrescriptions);

router.route('/:id/status')
  .put(protect, authorize('Pharmacist', 'Super Admin'), updatePrescriptionStatus);

export default router;
