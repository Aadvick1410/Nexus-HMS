import mongoose from 'mongoose';

const admissionSchema = mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Patient',
    },
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Room',
    },
    admittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User', // Doctor or Admin
    },
    assignedNurse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Nurse
    },
    admissionDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    dischargeDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['Admitted', 'Under Treatment', 'Discharged'],
      default: 'Admitted',
    },
    diagnosis: {
      type: String,
      required: true,
    },
    treatmentPlan: {
      type: String,
    },
    notes: {
      type: String,
    },
    vitals: [{
      bloodPressure: String,
      heartRate: Number,
      temperature: Number,
      oxygenSaturation: Number,
      recordedAt: {
        type: Date,
        default: Date.now,
      },
    }],
  },
  {
    timestamps: true,
  }
);

const Admission = mongoose.model('Admission', admissionSchema);
export default Admission;
