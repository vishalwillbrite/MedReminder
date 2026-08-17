const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    medicine: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Medicine',
      default: null,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['MEDICINE_REMINDER', 'MISSED_DOSE', 'SNOOZED', 'DAILY_SUMMARY', 'SYSTEM'],
      default: 'MEDICINE_REMINDER',
    },
    scheduledFor: {
      type: Date,
      default: Date.now,
    },
    sentAt: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ['PENDING', 'SENT', 'FAILED', 'READ', 'MISSED'],
      default: 'PENDING',
    },
    read: {
      type: Boolean,
      default: false,
    },
    action: {
      type: String,
      enum: ['NONE', 'TAKEN', 'SNOOZED', 'SKIPPED', 'DISMISSED'],
      default: 'NONE',
    },
  },
  {
    timestamps: true,
  }
);

notificationSchema.index({ user: 1, read: 1, createdAt: -1 });
notificationSchema.index({ user: 1, type: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
