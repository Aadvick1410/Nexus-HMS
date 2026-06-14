import express from 'express';
import { bookAppointment, getMyAppointments, updateAppointmentStatus, getAllAppointments, updateAppointmentAdmin, getDoctorsByDepartment } from '../controllers/appointmentController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, authorize('Patient', 'Receptionist', 'Super Admin'), bookAppointment)
  .get(protect, authorize('Super Admin', 'Hospital Admin', 'Doctor', 'Nurse', 'Receptionist'), getAllAppointments);

router.route('/myappointments')
  .get(protect, authorize('Patient'), getMyAppointments);

router.route('/doctors/:department')
  .get(protect, authorize('Patient', 'Receptionist', 'Super Admin', 'Hospital Admin'), getDoctorsByDepartment);

router.route('/:id')
  .put(protect, authorize('Super Admin', 'Hospital Admin', 'Receptionist'), updateAppointmentAdmin);

router.route('/:id/status')
  .put(protect, authorize('Super Admin', 'Hospital Admin', 'Doctor', 'Nurse', 'Receptionist'), updateAppointmentStatus);

export default router;
