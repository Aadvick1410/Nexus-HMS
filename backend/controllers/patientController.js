import asyncHandler from 'express-async-handler';
import Patient from '../models/Patient.js';

// @desc    Create a patient profile
// @route   POST /api/patients
// @access  Private (Patient/Admin/Receptionist)
const createPatientProfile = asyncHandler(async (req, res) => {
  const {
    dob,
    gender,
    bloodGroup,
    phone,
    address,
    emergencyContact,
    insuranceInfo,
    allergies,
    medicalHistory,
  } = req.body;

  const patientExists = await Patient.findOne({ userId: req.user._id });

  if (patientExists) {
    res.status(400);
    throw new Error('Patient profile already exists for this user');
  }

  // Generate a unique patient ID (e.g., PAT-123456)
  const patientId = 'PAT-' + Math.floor(100000 + Math.random() * 900000);

  const patient = await Patient.create({
    userId: req.user._id,
    patientId,
    dob,
    gender,
    bloodGroup,
    phone,
    address,
    emergencyContact,
    insuranceInfo,
    allergies,
    medicalHistory,
  });

  if (patient) {
    res.status(201).json(patient);
  } else {
    res.status(400);
    throw new Error('Invalid patient data');
  }
});

// @desc    Get patient profile
// @route   GET /api/patients/profile
// @access  Private (Patient)
const getPatientProfile = asyncHandler(async (req, res) => {
  const patient = await Patient.findOne({ userId: req.user._id }).populate('userId', 'name email');

  if (patient) {
    res.json(patient);
  } else {
    res.status(404);
    throw new Error('Patient profile not found');
  }
});

// @desc    Get patient by ID
// @route   GET /api/patients/:id
// @access  Private (Staff roles)
const getPatientById = asyncHandler(async (req, res) => {
  const patient = await Patient.findById(req.params.id).populate('userId', 'name email');

  if (patient) {
    res.json(patient);
  } else {
    res.status(404);
    throw new Error('Patient not found');
  }
});

export { createPatientProfile, getPatientProfile, getPatientById };
