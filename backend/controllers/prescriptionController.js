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

  if (!prescription) {
    res.status(404);
    throw new Error('Prescription not found');
  }

  const isNewlyDispensed = status === 'Dispensed' && prescription.status !== 'Dispensed';
  prescription.status = status;
  const updatedPrescription = await prescription.save();

  if (isNewlyDispensed) {
    const Medicine = (await import('../models/Medicine.js')).default;
    const Invoice = (await import('../models/Invoice.js')).default;
    let totalAmount = 0;
    const lineItems = [];

    for (const med of prescription.medicines) {
      let medicineDoc;
      if (med.medicineId) {
        medicineDoc = await Medicine.findById(med.medicineId);
      } else {
        medicineDoc = await Medicine.findOne({ name: { $regex: new RegExp(`^${med.medicineName}$`, 'i') } });
      }

      let price = 15; // default fallback
      if (medicineDoc) {
        medicineDoc.stock = Math.max(0, medicineDoc.stock - 1);
        await medicineDoc.save();
        price = medicineDoc.price || 15;
      }

      lineItems.push({
        description: `Pharmacy: ${med.medicineName} (${med.dosage || 'Standard'})`,
        amount: price,
        category: 'Pharmacy'
      });
      totalAmount += price;
    }

    if (lineItems.length > 0) {
      await Invoice.create({
        patientId: prescription.patientId,
        lineItems,
        totalAmount,
        paymentStatus: 'Unpaid',
        generatedBy: req.user._id
      });
    }
  }

  res.json(updatedPrescription);
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

// @desc    Upload prescription by patient
// @route   POST /api/prescriptions/upload-patient
// @access  Private (Patient)
const uploadPatientPrescription = asyncHandler(async (req, res) => {
  const { doctorName, diagnosis, medicinesRaw, uploadUrl } = req.body;
  
  const Patient = (await import('../models/Patient.js')).default;
  const patient = await Patient.findOne({ userId: req.user._id });
  if (!patient) {
    res.status(404);
    throw new Error('Patient profile not found');
  }

  // Parse medicines Raw (assume comma separated or multiline)
  const medicines = medicinesRaw.split(/[,\n]/).map(med => {
    return {
      medicineName: med.trim(),
      dosage: 'As prescribed',
      duration: 'As prescribed',
      instructions: 'See uploaded document'
    };
  }).filter(m => m.medicineName.length > 0);

  const prescription = await Prescription.create({
    patientId: patient._id,
    doctorName: doctorName || 'External Doctor',
    diagnosis: diagnosis || 'Uploaded Prescription',
    medicines: medicines,
    notes: `Prescription document: ${uploadUrl}`,
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Valid for 30 days
    status: 'Pending'
  });

  if (prescription) {
    res.status(201).json(prescription);
  } else {
    res.status(400);
    throw new Error('Invalid prescription data');
  }
});

export { createPrescription, getPatientPrescriptions, updatePrescriptionStatus, getAllPrescriptions, uploadPatientPrescription };
