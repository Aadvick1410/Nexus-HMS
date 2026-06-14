import express from 'express';
import { addMedicine, getMedicines, updateMedicineStock } from '../controllers/pharmacyController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, authorize('Pharmacist', 'Super Admin', 'Hospital Admin'), addMedicine)
  .get(protect, authorize('Pharmacist', 'Doctor', 'Super Admin', 'Hospital Admin'), getMedicines);

router.route('/:id/stock')
  .put(protect, authorize('Pharmacist', 'Super Admin'), updateMedicineStock);

export default router;
