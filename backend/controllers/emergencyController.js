import asyncHandler from 'express-async-handler';
import EmergencyCase from '../models/EmergencyCase.js';
import User from '../models/User.js';

// @desc    Register new emergency case
// @route   POST /api/emergency
// @access  Private (Admin, Nurse, Receptionist, Doctor)
const registerEmergency = asyncHandler(async (req, res) => {
  const { patientName, severity, chiefComplaint, notes, patientId } = req.body;

  const emergencyCase = await EmergencyCase.create({
    patientName,
    severity,
    chiefComplaint,
    notes,
    patientId: patientId || undefined,
  });

  if (emergencyCase) {
    const io = req.app.get('io');
    if (io) {
      io.to('emergency_ward').emit('new_notification', { 
        title: 'EMERGENCY', 
        message: `New Level ${severity} Emergency: ${chiefComplaint}` 
      });
    }
    res.status(201).json(emergencyCase);
  } else {
    res.status(400);
    throw new Error('Invalid emergency data');
  }
});

// @desc    Get all active emergency cases
// @route   GET /api/emergency
// @access  Private (Admin, Nurse, Receptionist, Doctor)
const getEmergencyCases = asyncHandler(async (req, res) => {
  const cases = await EmergencyCase.find({ status: { $ne: 'Discharged' } })
    .populate('assignedDoctor', 'name')
    .sort({ arrivalTime: 1 }); // Oldest first, frontend can sort by severity
    
  res.json(cases);
});

// @desc    Update emergency case
// @route   PUT /api/emergency/:id
// @access  Private (Admin, Nurse, Doctor)
const updateEmergencyCase = asyncHandler(async (req, res) => {
  const { status, assignedDoctor, severity, notes } = req.body;
  const emergencyCase = await EmergencyCase.findById(req.params.id);

  if (emergencyCase) {
    if (status) emergencyCase.status = status;
    if (severity) emergencyCase.severity = severity;
    if (notes) emergencyCase.notes = notes;
    
    if (assignedDoctor) {
      const doctor = await User.findById(assignedDoctor);
      if (doctor && doctor.role === 'Doctor') {
        emergencyCase.assignedDoctor = assignedDoctor;
      }
    }

    const updatedCase = await emergencyCase.save();
    
    const populatedCase = await EmergencyCase.findById(updatedCase._id)
      .populate('assignedDoctor', 'name');
      
    res.json(populatedCase);
  } else {
    res.status(404);
    throw new Error('Emergency case not found');
  }
});

export { registerEmergency, getEmergencyCases, updateEmergencyCase };
