const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    medicine: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Medicine',
      required: true,
    },
    scheduledTime: {
      type: Date,
      required: true,
    },
    timeSlot: {
      type: String, // HH:mm e.g. "09:00"
      required: true,
    },
    dateString: {
      type: String, // YYYY-MM-DD
      required: true,
    },
    dosage: {
      type: String,
      default: '',
    },
    foodTiming: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['Pending', 'Taken', 'Missed', 'Skipped'],
      default: 'Pending',
    },
    takenAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

reminderSchema.index({ user: 1, dateString: 1 });
reminderSchema.index({ medicine: 1, dateString: 1, timeSlot: 1 }, { unique: true });

module.exports = mongoose.model('Reminder', reminderSchema);
