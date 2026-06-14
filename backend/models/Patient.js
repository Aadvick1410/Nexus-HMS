import mongoose from 'mongoose';

const patientSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    patientId: {
      type: String,
      required: true,
      unique: true,
    },
    dob: {
      type: Date,
      required: true,
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
      required: true,
    },
    bloodGroup: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    emergencyContact: {
      name: { type: String, required: true },
      relationship: { type: String, required: true },
      phone: { type: String, required: true },
    },
    insuranceInfo: {
      provider: { type: String },
      policyNumber: { type: String },
      claimNumber: { type: String },
      expiryDate: { type: Date },
    },
    allergies: [
      {
        type: String,
      },
    ],
    medicalHistory: [
      {
        condition: { type: String },
        diagnosedDate: { type: Date },
        notes: { type: String },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Patient = mongoose.model('Patient', patientSchema);

export default Patient;
