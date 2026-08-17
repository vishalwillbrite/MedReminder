const Medicine = require('../models/Medicine');
const Reminder = require('../models/Reminder');
const ActivityLog = require('../models/ActivityLog');

const getTodayString = (dateObj = new Date()) => {
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// @desc    Get complete dashboard overview (Cards, Charts, Recent Activity)
// @route   GET /api/dashboard
// @access  Private
const getDashboardData = async (req, res) => {
  try {
    const userId = req.user._id;
    const todayStr = getTodayString();
    const now = new Date();

    // 1. Total Medicines
    const totalMedicines = await Medicine.countDocuments({ user: userId });

    // 2. Active & Completed Medicines
    const activeMedicinesCount = await Medicine.countDocuments({ user: userId, status: 'Active' });
    const completedMedicinesCount = await Medicine.countDocuments({ user: userId, status: 'Completed' });

    // 3. Today's Reminders Breakdown
    const todayReminders = await Reminder.find({ user: userId, dateString: todayStr });

    const todayCount = todayReminders.length;
    const takenToday = todayReminders.filter((r) => r.status === 'Taken').length;
    const missedToday = todayReminders.filter((r) => r.status === 'Missed').length;
    const upcomingToday = todayReminders.filter((r) => r.status === 'Pending').length;

    // 4. Weekly Progress Chart Data (Last 7 Days)
    const weeklyData = [];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = getTodayString(d);
      const dayName = days[d.getDay()];

      const dayReminders = await Reminder.find({ user: userId, dateString: dateStr });
      const taken = dayReminders.filter((r) => r.status === 'Taken').length;
      const missed = dayReminders.filter((r) => r.status === 'Missed').length;
      const total = dayReminders.length;

      weeklyData.push({
        day: dayName,
        date: dateStr,
        taken,
        missed,
        total,
        completionRate: total > 0 ? Math.round((taken / total) * 100) : 0,
      });
    }

    // 5. Medicine Type Completion Stats
    const medicineTypes = ['Tablet', 'Capsule', 'Syrup', 'Injection', 'Drops'];
    const typeDistribution = await Promise.all(
      medicineTypes.map(async (type) => {
        const count = await Medicine.countDocuments({ user: userId, medicineType: type });
        return { type, count };
      })
    );

    // 6. Recent Activity Log (Top 10)
    const recentActivity = await ActivityLog.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      summary: {
        totalMedicines,
        activeMedicines: activeMedicinesCount,
        completedMedicines: completedMedicinesCount,
        todayTotal: todayCount,
        todayTaken: takenToday,
        todayMissed: missedToday,
        todayUpcoming: upcomingToday,
        adherenceRate: todayCount > 0 ? Math.round((takenToday / todayCount) * 100) : 100,
      },
      charts: {
        weeklyProgress: weeklyData,
        typeDistribution: typeDistribution.filter((t) => t.count > 0),
      },
      recentActivity,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDashboardData,
};
