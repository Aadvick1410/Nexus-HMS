import mongoose from 'mongoose';

const labTestSchema = mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Patient',
    },
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
    },
    orderedBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User', // Doctor
    },
    testType: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['Requested', 'Sample Collected', 'Testing', 'Completed', 'Cancelled'],
      default: 'Requested',
    },
    reportUrl: {
      type: String, // URL to S3/Cloudinary when uploaded
      default: '',
    },
    resultsSummary: {
      type: String,
      default: '',
    },
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const LabTest = mongoose.model('LabTest', labTestSchema);

export default LabTest;
