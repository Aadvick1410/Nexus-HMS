import express from 'express';
import { orderLabTest, getLabTests, updateLabTest, getPatientLabTests } from '../controllers/labController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, authorize('Doctor', 'Lab Technician'), orderLabTest)
  .get(protect, authorize('Lab Technician', 'Hospital Admin', 'Super Admin'), getLabTests);

// IMPORTANT: Specific routes MUST come before parameterized routes
router.route('/patient/:patientId')
  .get(protect, authorize('Patient', 'Doctor', 'Super Admin'), getPatientLabTests);

router.route('/:id')
  .put(protect, authorize('Lab Technician', 'Super Admin'), updateLabTest);

export default router;

