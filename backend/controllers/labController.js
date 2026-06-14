import asyncHandler from 'express-async-handler';
import LabTest from '../models/LabTest.js';

// @desc    Order a lab test
// @route   POST /api/labs
// @access  Private (Doctor)
const orderLabTest = asyncHandler(async (req, res) => {
  const { patientId, appointmentId, testType } = req.body;

  const labTest = await LabTest.create({
    patientId,
    appointmentId,
    orderedBy: req.user._id,
    testType,
  });

  if (labTest) {
    res.status(201).json(labTest);
  } else {
    res.status(400);
    throw new Error('Invalid lab test data');
  }
});

// @desc    Get all lab tests (for lab technicians)
// @route   GET /api/labs
// @access  Private (Lab Technician, Hospital Admin)
const getLabTests = asyncHandler(async (req, res) => {
  const labTests = await LabTest.find({})
    .populate('patientId', 'patientId userId')
    .populate('orderedBy', 'name')
    .sort({ createdAt: -1 });
    
  res.json(labTests);
});

// @desc    Update lab test status and upload report
// @route   PUT /api/labs/:id
// @access  Private (Lab Technician)
const updateLabTest = asyncHandler(async (req, res) => {
  const { status, reportUrl, resultsSummary } = req.body;
  const labTest = await LabTest.findById(req.params.id);

  if (labTest) {
    labTest.status = status || labTest.status;
    labTest.reportUrl = reportUrl || labTest.reportUrl;
    labTest.resultsSummary = resultsSummary || labTest.resultsSummary;

    if (status === 'Completed' && !labTest.completedAt) {
      labTest.completedAt = Date.now();

      const io = req.app.get('io');
      if (io) {
        const populatedLabTest = await labTest.populate('patientId', 'userId');
        const patientUserId = populatedLabTest.patientId?.userId;
        const doctorId = populatedLabTest.orderedBy;

        if (doctorId) {
          io.to(doctorId.toString()).emit('new_notification', {
            title: 'Lab Result Completed',
            message: `Lab result for ${populatedLabTest.testType} is ready.`
          });
        }

        if (patientUserId) {
          io.to(patientUserId.toString()).emit('new_notification', {
            title: 'Lab Result Completed',
            message: `Your lab result for ${populatedLabTest.testType} is ready.`
          });
        }
      }
    }

    const updatedLabTest = await labTest.save();
    res.json(updatedLabTest);
  } else {
    res.status(404);
    throw new Error('Lab test not found');
  }
});

// @desc    Get lab tests for a specific patient
// @route   GET /api/labs/patient/:patientId
// @access  Private (Patient, Doctor)
const getPatientLabTests = asyncHandler(async (req, res) => {
  const labTests = await LabTest.find({ patientId: req.params.patientId })
    .populate('orderedBy', 'name')
    .sort({ createdAt: -1 });
    
  res.json(labTests);
});


export { orderLabTest, getLabTests, updateLabTest, getPatientLabTests };
