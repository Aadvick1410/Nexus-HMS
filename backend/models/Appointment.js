import mongoose from 'mongoose';

const appointmentSchema = mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Patient',
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User', // Ref to User model where role is Doctor
    },
    department: {
      type: String,
      required: true,
    },
    slot: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['Requested', 'Confirmed', 'In Consultation', 'Completed', 'Cancelled'],
      default: 'Requested',
    },
    reason: {
      type: String,
      required: true,
    },
    aiRecommendation: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const Appointment = mongoose.model('Appointment', appointmentSchema);

export default Appointment;
