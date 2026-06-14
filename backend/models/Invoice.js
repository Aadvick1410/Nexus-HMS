import mongoose from 'mongoose';

const invoiceSchema = mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Patient',
    },
    lineItems: [
      {
        description: { type: String, required: true },
        amount: { type: Number, required: true },
        category: {
          type: String,
          enum: ['Consultation', 'Lab Test', 'Pharmacy', 'Admission', 'Other'],
          required: true,
        },
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
      default: 0.0,
    },
    paymentStatus: {
      type: String,
      enum: ['Unpaid', 'Partial', 'Paid', 'Insurance Claimed'],
      default: 'Unpaid',
    },
    paymentMethod: {
      type: String,
      enum: ['UPI', 'Card', 'Cash', 'Insurance', 'Pending'],
      default: 'Pending',
    },
    paidAt: {
      type: Date,
    },
    generatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Invoice = mongoose.model('Invoice', invoiceSchema);

export default Invoice;
