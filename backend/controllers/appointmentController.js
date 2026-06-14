import asyncHandler from 'express-async-handler';
import Appointment from '../models/Appointment.js';
import Patient from '../models/Patient.js';

// @desc    Book a new appointment
// @route   POST /api/appointments
// @access  Private (Patient)
const bookAppointment = asyncHandler(async (req, res) => {
  const { doctorId, department, slot, reason } = req.body;

  // Find the patient profile linked to this user
  let patient = await Patient.findOne({ userId: req.user._id });

  if (!patient) {
    // Lazily create basic profile for new users
    patient = await Patient.create({
      userId: req.user._id,
      patientId: `PAT-${Date.now()}`,
      dob: new Date(),
      gender: 'Other',
      bloodGroup: 'Unknown',
      phone: 'Not Provided',
      address: 'Not Provided',
      emergencyContact: {
        name: 'None',
        relationship: 'None',
        phone: 'None'
      }
    });
  }

  // Prevent booking appointments in the past
  if (new Date(slot) < new Date()) {
    res.status(400);
    throw new Error('Cannot book appointments in the past. Please select a future date and time.');
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
    const io = req.app.get('io');
    if (io) {
      io.to(doctorId.toString()).emit('new_notification', { 
        title: 'New Appointment', 
        message: `You have a new appointment with ${req.user.name}` 
      });
    }
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

// @desc    Get all appointments
// @route   GET /api/appointments
// @access  Private (Staff)
const getAllAppointments = asyncHandler(async (req, res) => {
  const appointments = await Appointment.find({})
    .populate('patientId', 'patientId dob')
    .populate('doctorId', 'name')
    .populate({
      path: 'patientId',
      populate: { path: 'userId', select: 'name email' }
    });
  res.json(appointments);
});

// @desc    Update appointment details (Admin Edit)
// @route   PUT /api/appointments/:id
// @access  Private (Staff)
const updateAppointmentAdmin = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id);

  if (appointment) {
    appointment.slot = req.body.slot || appointment.slot;
    appointment.department = req.body.department || appointment.department;
    appointment.status = req.body.status || appointment.status;
    
    const updatedAppointment = await appointment.save();
    
    const populatedAppt = await Appointment.findById(updatedAppointment._id)
      .populate('patientId', 'patientId dob')
      .populate('doctorId', 'name')
      .populate({
        path: 'patientId',
        populate: { path: 'userId', select: 'name email' }
      });
      
    res.json(populatedAppt);
  } else {
    res.status(404);
    throw new Error('Appointment not found');
  }
});

// @desc    Get doctors by department
// @route   GET /api/appointments/doctors/:department
// @access  Private (Patient, Receptionist)
const getDoctorsByDepartment = asyncHandler(async (req, res) => {
  const { default: User } = await import('../models/User.js');
  const doctors = await User.find({ role: 'Doctor', isActive: true, department: req.params.department }).select('-password');
  res.json(doctors);
});

export { bookAppointment, getMyAppointments, updateAppointmentStatus, getAllAppointments, updateAppointmentAdmin, getDoctorsByDepartment };
