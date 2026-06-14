import express from 'express';
import { bookAppointment, getMyAppointments, updateAppointmentStatus } from '../controllers/appointmentController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, authorize('Patient'), bookAppointment);

router.route('/myappointments')
  .get(protect, authorize('Patient'), getMyAppointments);

router.route('/:id/status')
  .put(protect, authorize('Super Admin', 'Hospital Admin', 'Receptionist', 'Doctor'), updateAppointmentStatus);

export default router;
