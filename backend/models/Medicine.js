import mongoose from 'mongoose';

const medicineSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    genericName: {
      type: String,
      required: true,
    },
    stock: {
      type: Number,
      required: true,
      default: 0,
    },
    reorderLevel: {
      type: Number,
      required: true,
      default: 50,
    },
    expiryDate: {
      type: Date,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      default: 0.0,
    },
    supplier: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Medicine = mongoose.model('Medicine', medicineSchema);

export default Medicine;
