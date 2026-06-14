import asyncHandler from 'express-async-handler';
import Prescription from '../models/Prescription.js';

// @desc    Create a prescription
// @route   POST /api/prescriptions
// @access  Private (Doctor)
const createPrescription = asyncHandler(async (req, res) => {
  const { appointmentId, patientId, diagnosis, medicines, notes, validUntil } = req.body;

  const prescription = await Prescription.create({
    appointmentId,
    doctorId: req.user._id,
    patientId,
    diagnosis,
    medicines,
    notes,
    validUntil,
  });

  if (prescription) {
    res.status(201).json(prescription);
  } else {
    res.status(400);
    throw new Error('Invalid prescription data');
  }
});

// @desc    Get prescriptions by patient ID
// @route   GET /api/prescriptions/patient/:patientId
// @access  Private (Patient, Doctor, Pharmacist)
const getPatientPrescriptions = asyncHandler(async (req, res) => {
  const prescriptions = await Prescription.find({ patientId: req.params.patientId })
    .populate('doctorId', 'name')
    .sort({ createdAt: -1 });

  res.json(prescriptions);
});

// @desc    Update prescription status
// @route   PUT /api/prescriptions/:id/status
// @access  Private (Pharmacist)
const updatePrescriptionStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const prescription = await Prescription.findById(req.params.id);

  if (prescription) {
    prescription.status = status;
    const updatedPrescription = await prescription.save();
    res.json(updatedPrescription);
  } else {
    res.status(404);
    throw new Error('Prescription not found');
  }
});

// @desc    Get all prescriptions
// @route   GET /api/prescriptions/all
// @access  Private (Pharmacist, Doctor, Super Admin)
const getAllPrescriptions = asyncHandler(async (req, res) => {
  const prescriptions = await Prescription.find({})
    .populate({
      path: 'patientId',
      populate: { path: 'userId', select: 'name email' }
    })
    .populate('doctorId', 'name')
    .sort({ createdAt: -1 });

  res.json(prescriptions);
});

export { createPrescription, getPatientPrescriptions, updatePrescriptionStatus, getAllPrescriptions };
