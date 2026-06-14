import mongoose from 'mongoose';

const moodSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    emoji: {
      type: String,
      required: true, // e.g., '😊', '😢', '😡', '😴'
    },
    note: {
      type: String,
      default: '',
    },
    dateLogged: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const Mood = mongoose.model('Mood', moodSchema);

export default Mood;
