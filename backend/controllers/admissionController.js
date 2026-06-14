import asyncHandler from 'express-async-handler';
import Admission from '../models/Admission.js';
import Room from '../models/Room.js';

// @desc    Admit a patient
// @route   POST /api/admissions
// @access  Private (Admin, Doctor, Receptionist)
const admitPatient = asyncHandler(async (req, res) => {
  const { patientId, roomId, diagnosis, treatmentPlan, notes } = req.body;

  const room = await Room.findById(roomId);
  if (!room) {
    res.status(404);
    throw new Error('Room not found');
  }

  if (room.occupiedBeds >= room.bedCount || room.status === 'Full') {
    res.status(400);
    throw new Error('Room is fully occupied or unavailable');
  }

  const admission = await Admission.create({
    patientId,
    roomId,
    admittedBy: req.user._id,
    diagnosis,
    treatmentPlan,
    notes,
  });

  if (admission) {
    room.occupiedBeds += 1;
    if (room.occupiedBeds >= room.bedCount) {
      room.status = 'Full';
    }
    await room.save();
    
    const populatedAdmission = await Admission.findById(admission._id)
      .populate('patientId', 'patientId dob userId')
      .populate('roomId', 'roomNumber ward')
      .populate('assignedNurse', 'name email');

    res.status(201).json(populatedAdmission);
  } else {
    res.status(400);
    throw new Error('Invalid admission data');
  }
});

// @desc    Get all admissions
// @route   GET /api/admissions
// @access  Private (Admin, Doctor, Nurse)
const getAdmissions = asyncHandler(async (req, res) => {
  const admissions = await Admission.find({})
    .populate({
      path: 'patientId',
      populate: { path: 'userId', select: 'name email' }
    })
    .populate('roomId', 'roomNumber ward')
    .populate('admittedBy', 'name')
    .populate('assignedNurse', 'name');
    
  res.json(admissions);
});

// @desc    Update admission status (e.g., Discharge)
// @route   PUT /api/admissions/:id/status
// @access  Private (Admin, Doctor, Nurse)
const updateAdmissionStatus = asyncHandler(async (req, res) => {
  const { status, treatmentPlan, notes } = req.body;
  const admission = await Admission.findById(req.params.id);

  if (admission) {
    admission.status = status || admission.status;
    if (treatmentPlan) admission.treatmentPlan = treatmentPlan;
    if (notes) admission.notes = notes;

    if (status === 'Discharged' && !admission.dischargeDate) {
      admission.dischargeDate = Date.now();
      
      // Free up the bed
      const room = await Room.findById(admission.roomId);
      if (room) {
        room.occupiedBeds = Math.max(0, room.occupiedBeds - 1);
        if (room.occupiedBeds < room.bedCount && room.status === 'Full') {
          room.status = 'Available';
        }
        await room.save();
      }
    }

    const updatedAdmission = await admission.save();
    res.json(updatedAdmission);
  } else {
    res.status(404);
    throw new Error('Admission not found');
  }
});

// @desc    Add vitals to admission
// @route   POST /api/admissions/:id/vitals
// @access  Private (Nurse, Doctor)
const addVitals = asyncHandler(async (req, res) => {
  const { bloodPressure, heartRate, temperature, oxygenSaturation } = req.body;
  const admission = await Admission.findById(req.params.id);

  if (admission) {
    const vitals = {
      bloodPressure,
      heartRate,
      temperature,
      oxygenSaturation,
    };

    admission.vitals.push(vitals);
    await admission.save();

    res.status(201).json(admission);
  } else {
    res.status(404);
    throw new Error('Admission not found');
  }
});

export { admitPatient, getAdmissions, updateAdmissionStatus, addVitals };
