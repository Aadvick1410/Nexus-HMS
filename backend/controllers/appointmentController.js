import asyncHandler from 'express-async-handler';
import Appointment from '../models/Appointment.js';
import Patient from '../models/Patient.js';

// @desc    Book a new appointment
// @route   POST /api/appointments
// @access  Private (Patient)
const bookAppointment = asyncHandler(async (req, res) => {
  const { doctorId, department, slot, reason } = req.body;

  // Find the patient profile linked to this user
  const patient = await Patient.findOne({ userId: req.user._id });

  if (!patient) {
    res.status(404);
    throw new Error('Patient profile not found. Please complete profile first.');
  }

  const appointment = await Appointment.create({
    patientId: patient._id,
    doctorId,
    department,
    slot,
    reason,
    status: 'Requested',
  });

  if (appointment) {
    res.status(201).json(appointment);
  } else {
    res.status(400);
    throw new Error('Invalid appointment data');
  }
});

// @desc    Get logged in user's appointments
// @route   GET /api/appointments/myappointments
// @access  Private (Patient)
const getMyAppointments = asyncHandler(async (req, res) => {
  const patient = await Patient.findOne({ userId: req.user._id });
  
  if (!patient) {
    res.status(404);
    throw new Error('Patient profile not found.');
  }

  const appointments = await Appointment.find({ patientId: patient._id }).populate('doctorId', 'name');
  res.json(appointments);
});

// @desc    Update appointment status
// @route   PUT /api/appointments/:id/status
// @access  Private (Staff)
const updateAppointmentStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  const validStatuses = ['Requested', 'Confirmed', 'In Consultation', 'Completed', 'Cancelled'];
  if (!validStatuses.includes(status)) {
    res.status(400);
    throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
  }

  const appointment = await Appointment.findById(req.params.id);

  if (appointment) {
    appointment.status = status;
    const updatedAppointment = await appointment.save();
    res.json(updatedAppointment);
  } else {
    res.status(404);
    throw new Error('Appointment not found');
  }
});

export { bookAppointment, getMyAppointments, updateAppointmentStatus };
