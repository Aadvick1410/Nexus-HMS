import asyncHandler from 'express-async-handler';
import Patient from '../models/Patient.js';

// @desc    Create a patient profile
// @route   POST /api/patients
// @access  Private (Patient/Admin/Receptionist)
const createPatientProfile = asyncHandler(async (req, res) => {
  const {
    userId,
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

  const targetUserId = userId || req.user._id;
  const patientExists = await Patient.findOne({ userId: targetUserId });

  if (patientExists) {
    res.status(400);
    throw new Error('Patient profile already exists for this user');
  }

  // Generate a sequential patient ID
  const lastPatient = await Patient.findOne().sort({ createdAt: -1 });
  let nextIdNumber = 1000;
  
  if (lastPatient && lastPatient.patientId && lastPatient.patientId.startsWith('PAT-')) {
    const lastId = parseInt(lastPatient.patientId.replace('PAT-', ''), 10);
    if (!isNaN(lastId)) {
      nextIdNumber = lastId + 1;
    }
  }
  
  const patientId = `PAT-${nextIdNumber}`;

  const patient = await Patient.create({
    userId: targetUserId,
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

// @desc    Get all patients
// @route   GET /api/patients
// @access  Private (Staff roles)
const getAllPatients = asyncHandler(async (req, res) => {
  const patients = await Patient.find({}).populate('userId', 'name email');
  res.json(patients);
});

// @desc    Add to medical history
// @route   PUT /api/patients/profile/history
// @access  Private (Patient)
const addMedicalHistory = asyncHandler(async (req, res) => {
  const { condition, notes } = req.body;
  const patient = await Patient.findOne({ userId: req.user._id });

  if (patient) {
    patient.medicalHistory.push({
      condition: condition || 'Uploaded Document',
      diagnosedDate: new Date(),
      notes: notes || 'File attached to this record.'
    });
    const updatedPatient = await patient.save();
    res.json(updatedPatient);
  } else {
    res.status(404);
    throw new Error('Patient profile not found');
  }
});

// @desc    Update patient details (Admin Edit)
// @route   PUT /api/patients/admin/:id
// @access  Private (Staff)
const updatePatientAdmin = asyncHandler(async (req, res) => {
  const patient = await Patient.findById(req.params.id).populate('userId');

  if (patient) {
    patient.phone = req.body.phone || patient.phone;
    patient.bloodGroup = req.body.bloodGroup || patient.bloodGroup;
    
    if (req.body.name || req.body.email) {
      patient.userId.name = req.body.name || patient.userId.name;
      patient.userId.email = req.body.email || patient.userId.email;
      await patient.userId.save();
    }

    const updatedPatient = await patient.save();
    // Return populated for immediate UI refresh
    const populatedPatient = await Patient.findById(updatedPatient._id).populate('userId', 'name email');
    res.json(populatedPatient);
  } else {
    res.status(404);
    throw new Error('Patient not found');
  }
});

export { createPatientProfile, getPatientProfile, getPatientById, getAllPatients, addMedicalHistory, updatePatientAdmin };
