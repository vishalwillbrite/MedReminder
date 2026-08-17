const Medicine = require('../models/Medicine');
const Reminder = require('../models/Reminder');

// @desc    Export User Medicines to CSV
// @route   GET /api/export/csv
// @access  Private
const exportMedicinesCSV = async (req, res) => {
  try {
    const medicines = await Medicine.find({ user: req.user._id }).sort({ createdAt: -1 });

    const headers = [
      'Medicine Name',
      'Dosage',
      'Type',
      'Quantity',
      'Food Timing',
      'Alarm Slots',
      'Start Date',
      'End Date',
      'Doctor Name',
      'Category',
      'Status',
    ];

    const rows = medicines.map((m) => [
      `"${m.name.replace(/"/g, '""')}"`,
      `"${m.dosage}"`,
      `"${m.medicineType}"`,
      m.quantity,
      `"${m.foodTiming}"`,
      `"${(m.reminderTimes || []).join(', ')}"`,
      `"${new Date(m.startDate).toISOString().split('T')[0]}"`,
      `"${new Date(m.endDate).toISOString().split('T')[0]}"`,
      `"${(m.doctorName || '').replace(/"/g, '""')}"`,
      `"${m.category}"`,
      `"${m.status}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=MedReminder_Prescriptions_${Date.now()}.csv`);
    res.status(200).send(csvContent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  exportMedicinesCSV,
};
