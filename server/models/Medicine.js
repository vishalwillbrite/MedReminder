const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Please provide medicine name'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    dosage: {
      type: String,
      required: [true, 'Please specify dosage (e.g. 500mg, 1 pill)'],
      trim: true,
    },
    medicineType: {
      type: String,
      required: [true, 'Please select medicine type'],
      enum: ['Tablet', 'Capsule', 'Syrup', 'Injection', 'Drops'],
      default: 'Tablet',
    },
    quantity: {
      type: Number,
      required: [true, 'Please provide quantity'],
      min: [1, 'Quantity must be at least 1'],
    },
    foodTiming: {
      type: String,
      required: [true, 'Please select food timing'],
      enum: ['Before Food', 'After Food', 'With Food', 'No Restriction'],
      default: 'After Food',
    },
    reminderTimes: [
      {
        type: String, // format "HH:mm" e.g. "08:00", "20:00"
        required: true,
      },
    ],
    startDate: {
      type: Date,
      required: [true, 'Please specify start date'],
    },
    endDate: {
      type: Date,
      required: [true, 'Please specify end date'],
    },
    doctorName: {
      type: String,
      default: '',
      trim: true,
    },
    category: {
      type: String,
      default: 'General',
      trim: true,
    },
    notes: {
      type: String,
      default: '',
      trim: true,
    },
    image: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['Active', 'Completed', 'Paused'],
      default: 'Active',
    },
  },
  {
    timestamps: true,
  }
);

medicineSchema.index({ user: 1, name: 1 });
medicineSchema.index({ user: 1, status: 1 });

module.exports = mongoose.model('Medicine', medicineSchema);
