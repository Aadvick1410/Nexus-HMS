import express from 'express';
import { generateInvoice, getPatientInvoices, processPayment } from '../controllers/billingController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, authorize('Billing Executive', 'Super Admin'), generateInvoice);

router.route('/patient/:patientId')
  .get(protect, authorize('Patient', 'Billing Executive', 'Super Admin'), getPatientInvoices);

router.route('/:id/pay')
  .put(protect, authorize('Billing Executive', 'Super Admin'), processPayment);

export default router;
