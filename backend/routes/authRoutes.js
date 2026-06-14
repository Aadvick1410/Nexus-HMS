import express from 'express';
import { registerUser, authUser, getUserProfile, adminResetPassword, refreshToken, createStaffAccount } from '../controllers/authController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', authUser);
router.route('/profile')
  .get(protect, getUserProfile);

// Admin routes
router.route('/admin/reset-password/:id')
  .put(protect, authorize('Super Admin', 'Hospital Admin'), adminResetPassword);

router.post('/refresh', refreshToken);
router.post('/staff', protect, authorize('Super Admin', 'Hospital Admin'), createStaffAccount);

export default router;
