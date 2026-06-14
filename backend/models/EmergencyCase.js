import mongoose from 'mongoose';

const emergencyCaseSchema = mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      // Optional because emergency patient might not be fully registered yet, but we will require it after triage for simplicity here
    },
    patientName: {
      type: String,
      required: true,
    },
    severity: {
      type: String,
      enum: ['Critical', 'Urgent', 'Standard'],
      required: true,
    },
    chiefComplaint: {
      type: String,
      required: true,
    },
    assignedDoctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    status: {
      type: String,
      enum: ['Incoming', 'Triaged', 'In Treatment', 'Stabilized', 'Transferred', 'Discharged'],
      default: 'Incoming',
    },
    arrivalTime: {
      type: Date,
      default: Date.now,
      required: true,
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const EmergencyCase = mongoose.model('EmergencyCase', emergencyCaseSchema);
export default EmergencyCase;
