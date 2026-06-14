import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import User from '../models/User.js';

const router = express.Router();

// @desc    Get all doctors
// @route   GET /api/doctors
// @access  Private (any authenticated user)
router.get('/', protect, async (req, res) => {
  try {
    const doctors = await User.find({ role: 'Doctor' }).select('-password');
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get doctor's appointments
// @route   GET /api/doctors/my-appointments
// @access  Private (Doctor)
router.get('/my-appointments', protect, authorize('Doctor'), async (req, res) => {
  try {
    const { default: Appointment } = await import('../models/Appointment.js');
    const appointments = await Appointment.find({ doctorId: req.user._id })
      .populate({
        path: 'patientId',
        populate: { path: 'userId', select: 'name email' }
      })
      .sort({ slot: -1 });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
