import express from 'express';
import { getRooms, getRoomById, createRoom, updateRoom } from '../controllers/roomController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, authorize('Super Admin', 'Hospital Admin', 'Nurse', 'Receptionist', 'Doctor'), getRooms)
  .post(protect, authorize('Super Admin', 'Hospital Admin'), createRoom);

router.route('/:id')
  .get(protect, authorize('Super Admin', 'Hospital Admin', 'Nurse', 'Receptionist', 'Doctor'), getRoomById)
  .put(protect, authorize('Super Admin', 'Hospital Admin'), updateRoom);

export default router;
