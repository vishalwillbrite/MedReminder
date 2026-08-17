const Reminder = require('../models/Reminder');
const Medicine = require('../models/Medicine');
const ActivityLog = require('../models/ActivityLog');

// Helper to format date string YYYY-MM-DD
const getTodayString = (dateObj = new Date()) => {
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// @desc    Get today's reminders for logged in user (ensures all scheduled time slots exist)
// @route   GET /api/reminders/today
// @access  Private
const getTodayReminders = async (req, res) => {
  try {
    const todayStr = getTodayString();
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

    // 1. Find all active medicines for the user valid for today
    const activeMedicines = await Medicine.find({
      user: req.user._id,
      status: 'Active',
      startDate: { $lte: endOfToday },
      endDate: { $gte: startOfToday },
    });

    // 2. Ensure today's reminder entries exist in DB for all active medicines and their reminderTimes
    for (const med of activeMedicines) {
      if (Array.isArray(med.reminderTimes)) {
        for (const timeSlot of med.reminderTimes) {
          const [hours, minutes] = timeSlot.split(':').map(Number);
          const scheduledDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours || 0, minutes || 0);

          try {
            await Reminder.updateOne(
              { medicine: med._id, dateString: todayStr, timeSlot },
              {
                $setOnInsert: {
                  user: req.user._id,
                  medicine: med._id,
                  scheduledTime: scheduledDate,
                  timeSlot,
                  dateString: todayStr,
                  dosage: med.dosage,
                  foodTiming: med.foodTiming,
                  status: 'Pending',
                },
              },
              { upsert: true }
            );
          } catch (err) {
            // Ignore duplicate key error on parallel upsert
          }
        }
      }
    }

    // 3. Auto-update any pending reminders whose scheduled time is > 30 minutes in past to "Missed"
    const overdueCutoff = new Date(now.getTime() - 30 * 60 * 1000);
    await Reminder.updateMany(
      {
        user: req.user._id,
        dateString: todayStr,
        status: 'Pending',
        scheduledTime: { $lt: overdueCutoff },
      },
      {
        $set: { status: 'Missed' },
      }
    );

    // 4. Fetch all today's reminders populated with medicine details
    const reminders = await Reminder.find({
      user: req.user._id,
      dateString: todayStr,
    })
      .populate('medicine')
      .sort({ scheduledTime: 1 });

    res.json(reminders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update reminder status (Taken / Missed / Skipped)
// @route   PATCH /api/reminders/:id/status
// @access  Private
const updateReminderStatus = async (req, res) => {
  try {
    const { status } = req.body; // 'Taken', 'Missed', 'Skipped', 'Pending'
    const reminder = await Reminder.findOne({ _id: req.params.id, user: req.user._id }).populate('medicine');

    if (!reminder) {
      return res.status(404).json({ message: 'Reminder not found' });
    }

    reminder.status = status;
    if (status === 'Taken') {
      reminder.takenAt = new Date();

      // Decrement medicine quantity if > 0
      if (reminder.medicine && reminder.medicine.quantity > 0) {
        reminder.medicine.quantity -= 1;
        await reminder.medicine.save();
      }
    } else {
      reminder.takenAt = null;
    }

    await reminder.save();

    await ActivityLog.create({
      user: req.user._id,
      action: `REMINDER_${status.toUpperCase()}`,
      details: `Marked ${reminder.medicine ? reminder.medicine.name : 'dose'} at ${reminder.timeSlot} as ${status}`,
    });

    res.json(reminder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getTodayReminders,
  updateReminderStatus,
};
