import mongoose from 'mongoose';

const roomSchema = mongoose.Schema(
  {
    roomNumber: {
      type: String,
      required: true,
      unique: true,
    },
    ward: {
      type: String,
      enum: ['General', 'ICU', 'NICU', 'Surgical', 'Maternity', 'Private'],
      required: true,
    },
    bedCount: {
      type: Number,
      required: true,
    },
    occupiedBeds: {
      type: Number,
      default: 0,
    },
    pricePerDay: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['Available', 'Full', 'Maintenance'],
      default: 'Available',
    },
  },
  {
    timestamps: true,
  }
);

const Room = mongoose.model('Room', roomSchema);
export default Room;
