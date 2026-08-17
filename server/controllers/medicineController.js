const Medicine = require('../models/Medicine');
const Reminder = require('../models/Reminder');
const ActivityLog = require('../models/ActivityLog');

// @desc    Create new medicine
// @route   POST /api/medicine
// @access  Private
const createMedicine = async (req, res) => {
  try {
    const {
      name,
      description,
      dosage,
      medicineType,
      quantity,
      foodTiming,
      reminderTimes,
      startDate,
      endDate,
      doctorName,
      category,
      notes,
    } = req.body;

    let parsedReminderTimes = reminderTimes;
    if (typeof reminderTimes === 'string') {
      try {
        parsedReminderTimes = JSON.parse(reminderTimes);
      } catch (e) {
        parsedReminderTimes = [reminderTimes];
      }
    }

    let imageUrl = '';
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }

    const medicine = await Medicine.create({
      user: req.user._id,
      name,
      description: description || '',
      dosage,
      medicineType: medicineType || 'Tablet',
      quantity: Number(quantity),
      foodTiming: foodTiming || 'After Food',
      reminderTimes: Array.isArray(parsedReminderTimes) ? parsedReminderTimes : ['08:00'],
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      doctorName: doctorName || '',
      category: category || 'General',
      notes: notes || '',
      image: imageUrl,
      status: 'Active',
    });

    await ActivityLog.create({
      user: req.user._id,
      action: 'MEDICINE_ADDED',
      details: `Added new medicine: ${medicine.name} (${medicine.dosage})`,
    });

    res.status(201).json(medicine);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all medicines for logged in user (with search, category, status, timing filters)
// @route   GET /api/medicine
// @access  Private
const getMedicines = async (req, res) => {
  try {
    const { search, category, status, timeFilter } = req.query;
    let query = { user: req.user._id };

    // Search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { doctorName: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    // Category filter
    if (category && category !== 'All') {
      query.category = category;
    }

    // Status filter
    if (status && status !== 'All') {
      query.status = status;
    }

    // Date/Time filter (Today, Tomorrow, This Week)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (timeFilter === 'Today') {
      const tonight = new Date(today);
      tonight.setHours(23, 59, 59, 999);
      query.startDate = { $lte: tonight };
      query.endDate = { $gte: today };
    } else if (timeFilter === 'Tomorrow') {
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowNight = new Date(tomorrow);
      tomorrowNight.setHours(23, 59, 59, 999);

      query.startDate = { $lte: tomorrowNight };
      query.endDate = { $gte: tomorrow };
    } else if (timeFilter === 'This Week') {
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);
      query.startDate = { $lte: nextWeek };
      query.endDate = { $gte: today };
    }

    const medicines = await Medicine.find(query).sort({ createdAt: -1 });

    res.json(medicines);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get medicine by ID
// @route   GET /api/medicine/:id
// @access  Private
const getMedicineById = async (req, res) => {
  try {
    const medicine = await Medicine.findOne({ _id: req.params.id, user: req.user._id });

    if (!medicine) {
      return res.status(404).json({ message: 'Medicine not found' });
    }

    res.json(medicine);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update medicine
// @route   PUT /api/medicine/:id
// @access  Private
const updateMedicine = async (req, res) => {
  try {
    const medicine = await Medicine.findOne({ _id: req.params.id, user: req.user._id });

    if (!medicine) {
      return res.status(404).json({ message: 'Medicine not found' });
    }

    const {
      name,
      description,
      dosage,
      medicineType,
      quantity,
      foodTiming,
      reminderTimes,
      startDate,
      endDate,
      doctorName,
      category,
      notes,
      status,
    } = req.body;

    if (name) medicine.name = name;
    if (description !== undefined) medicine.description = description;
    if (dosage) medicine.dosage = dosage;
    if (medicineType) medicine.medicineType = medicineType;
    if (quantity !== undefined) medicine.quantity = Number(quantity);
    if (foodTiming) medicine.foodTiming = foodTiming;

    if (reminderTimes) {
      let parsed = reminderTimes;
      if (typeof reminderTimes === 'string') {
        try { parsed = JSON.parse(reminderTimes); } catch (e) { parsed = [reminderTimes]; }
      }
      medicine.reminderTimes = parsed;
    }

    if (startDate) medicine.startDate = new Date(startDate);
    if (endDate) medicine.endDate = new Date(endDate);
    if (doctorName !== undefined) medicine.doctorName = doctorName;
    if (category) medicine.category = category;
    if (notes !== undefined) medicine.notes = notes;
    if (status) medicine.status = status;

    if (req.file) {
      medicine.image = `/uploads/${req.file.filename}`;
    }

    const updatedMedicine = await medicine.save();

    await ActivityLog.create({
      user: req.user._id,
      action: 'MEDICINE_UPDATED',
      details: `Updated medicine: ${updatedMedicine.name}`,
    });

    res.json(updatedMedicine);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete medicine
// @route   DELETE /api/medicine/:id
// @access  Private
const deleteMedicine = async (req, res) => {
  try {
    const medicine = await Medicine.findOneAndDelete({ _id: req.params.id, user: req.user._id });

    if (!medicine) {
      return res.status(404).json({ message: 'Medicine not found' });
    }

    // Clean up related reminders
    await Reminder.deleteMany({ medicine: medicine._id });

    await ActivityLog.create({
      user: req.user._id,
      action: 'MEDICINE_DELETED',
      details: `Deleted medicine: ${medicine.name}`,
    });

    res.json({ message: 'Medicine and associated reminders deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createMedicine,
  getMedicines,
  getMedicineById,
  updateMedicine,
  deleteMedicine,
};
