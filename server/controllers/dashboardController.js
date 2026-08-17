const Medicine = require('../models/Medicine');
const Reminder = require('../models/Reminder');
const ActivityLog = require('../models/ActivityLog');
const PushSubscription = require('../models/PushSubscription');

const getTodayString = (dateObj = new Date()) => {
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Convert 24h "HH:mm" to 12h "hh:mm AM/PM"
const format12Hour = (time24) => {
  if (!time24) return '';
  const [hStr, mStr] = time24.split(':');
  let h = parseInt(hStr, 10);
  const period = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  if (h === 0) h = 12;
  return `${String(h).padStart(2, '0')}:${mStr || '00'} ${period}`;
};

// Helper: Calculate streak (consecutive days with adherence >= 75%)
const calculateStreaks = async (userId) => {
  try {
    const now = new Date();
    let currentStreak = 0;
    let bestStreak = 0;
    let tempStreak = 0;

    // Check last 60 days
    for (let i = 0; i < 60; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = getTodayString(d);

      const dayReminders = await Reminder.find({ user: userId, dateString: dateStr });
      if (dayReminders.length === 0) {
        if (i === 0) continue; // Skip today if no doses scheduled yet
        break;
      }

      const taken = dayReminders.filter((r) => r.status === 'Taken').length;
      const rate = (taken / dayReminders.length) * 100;

      if (rate >= 75) {
        tempStreak++;
        if (i === 0 || currentStreak === i) {
          currentStreak++;
        }
        if (tempStreak > bestStreak) {
          bestStreak = tempStreak;
        }
      } else {
        if (i === 0) {
          currentStreak = 0;
        } else {
          tempStreak = 0;
        }
      }
    }

    return { currentStreak, bestStreak: Math.max(currentStreak, bestStreak) };
  } catch (err) {
    return { currentStreak: 0, bestStreak: 0 };
  }
};

// Helper: Formatted Time Remaining
const getTimeRemainingString = (scheduledDate) => {
  const diffMs = new Date(scheduledDate) - new Date();
  if (diffMs <= 0) return 'Due now';
  const diffMins = Math.floor(diffMs / (1000 * 60));
  if (diffMins < 60) return `in ${diffMins} min${diffMins === 1 ? '' : 's'}`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `in ${diffHours} hr${diffHours === 1 ? '' : 's'}`;
  const diffDays = Math.floor(diffHours / 24);
  return `in ${diffDays} day${diffDays === 1 ? '' : 's'}`;
};

// @desc    Get complete aggregated dashboard analytics payload
// @route   GET /api/dashboard/analytics
// @access  Private
const getDashboardAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;
    const todayStr = getTodayString();
    const now = new Date();

    // 1. Total Medicines & Active Prescriptions
    const totalMedicines = await Medicine.countDocuments({ user: userId });
    const activeMedicinesList = await Medicine.find({ user: userId, status: 'Active' }).sort({ name: 1 });
    const completedMedicinesCount = await Medicine.countDocuments({ user: userId, status: 'Completed' });
    const totalRemindersCount = await Reminder.countDocuments({ user: userId });

    // 2. Today's Reminders Breakdown & Timeline Schedule
    const todayRemindersRaw = await Reminder.find({ user: userId, dateString: todayStr })
      .populate('medicine')
      .sort({ timeSlot: 1 });

    const todaySchedule = todayRemindersRaw.map((r) => ({
      _id: r._id,
      medicine: r.medicine,
      medicineName: r.medicine ? r.medicine.name : 'Medicine',
      dosage: r.dosage || (r.medicine ? r.medicine.dosage : ''),
      foodTiming: r.foodTiming || (r.medicine ? r.medicine.foodTiming : ''),
      timeSlot: r.timeSlot,
      formattedTime: format12Hour(r.timeSlot),
      status: r.status,
      scheduledTime: r.scheduledTime,
      image: r.medicine ? r.medicine.image : '',
    }));

    const todayReminders = todaySchedule.length;
    const takenToday = todaySchedule.filter((r) => r.status === 'Taken').length;
    const missedToday = todaySchedule.filter((r) => r.status === 'Missed').length;
    const upcomingToday = todaySchedule.filter((r) => r.status === 'Pending').length;

    // Overall Adherence Rate Calculation
    const totalHistoricalReminders = await Reminder.countDocuments({ user: userId });
    const totalTakenHistorical = await Reminder.countDocuments({ user: userId, status: 'Taken' });
    const overallAdherenceRate =
      totalHistoricalReminders > 0
        ? Math.round((totalTakenHistorical / totalHistoricalReminders) * 100)
        : 100;

    // 3. Streak Metrics
    const streakData = await calculateStreaks(userId);

    // 4. Weekly Adherence Breakdown (Past 7 Days Mon - Sun)
    const weeklyAdherence = [];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = getTodayString(d);
      const dayName = days[d.getDay()];

      const dayReminders = await Reminder.find({ user: userId, dateString: dateStr });
      const taken = dayReminders.filter((r) => r.status === 'Taken').length;
      const missed = dayReminders.filter((r) => r.status === 'Missed').length;
      const scheduled = dayReminders.length;
      const adherence = scheduled > 0 ? Math.round((taken / scheduled) * 100) : 100;

      weeklyAdherence.push({
        day: dayName,
        date: dateStr,
        scheduled,
        taken,
        missed,
        adherence,
      });
    }

    // 5. Monthly Adherence Overview (Past 30 Days)
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const monthlyReminders = await Reminder.find({
      user: userId,
      scheduledTime: { $gte: thirtyDaysAgo, $lte: now },
    });

    const monthlyScheduled = monthlyReminders.length;
    const monthlyTaken = monthlyReminders.filter((r) => r.status === 'Taken').length;
    const monthlyMissed = monthlyReminders.filter((r) => r.status === 'Missed').length;
    const monthlyAdherenceRate =
      monthlyScheduled > 0 ? Math.round((monthlyTaken / monthlyScheduled) * 100) : 100;

    // Monthly breakdown by 4 weeks
    const monthlyWeeks = [];
    for (let w = 3; w >= 0; w--) {
      const weekStart = new Date(now);
      weekStart.setDate(weekStart.getDate() - (w * 7 + 6));
      const weekEnd = new Date(now);
      weekEnd.setDate(weekEnd.getDate() - w * 7);

      const weekReminders = monthlyReminders.filter((r) => {
        const t = new Date(r.scheduledTime);
        return t >= weekStart && t <= weekEnd;
      });

      const taken = weekReminders.filter((r) => r.status === 'Taken').length;
      const missed = weekReminders.filter((r) => r.status === 'Missed').length;
      const scheduled = weekReminders.length;
      const adherence = scheduled > 0 ? Math.round((taken / scheduled) * 100) : 100;

      monthlyWeeks.push({
        week: `Week ${4 - w}`,
        scheduled,
        taken,
        missed,
        adherence,
      });
    }

    const monthlyAdherence = {
      totalScheduled: monthlyScheduled,
      totalTaken: monthlyTaken,
      totalMissed: monthlyMissed,
      adherenceRate: monthlyAdherenceRate,
      weeks: monthlyWeeks,
    };

    // 6. Next Upcoming Pending Reminder with Live Countdown
    const nextUpcomingRaw = await Reminder.findOne({
      user: userId,
      status: 'Pending',
      scheduledTime: { $gte: now },
    })
      .populate('medicine')
      .sort({ scheduledTime: 1 });

    const nextReminder = nextUpcomingRaw
      ? {
          _id: nextUpcomingRaw._id,
          medicine: nextUpcomingRaw.medicine,
          medicineName: nextUpcomingRaw.medicine ? nextUpcomingRaw.medicine.name : 'Medicine',
          dosage: nextUpcomingRaw.dosage || (nextUpcomingRaw.medicine ? nextUpcomingRaw.medicine.dosage : ''),
          timeSlot: nextUpcomingRaw.timeSlot,
          formattedTime: format12Hour(nextUpcomingRaw.timeSlot),
          scheduledTime: nextUpcomingRaw.scheduledTime,
          timeRemaining: getTimeRemainingString(nextUpcomingRaw.scheduledTime),
        }
      : null;

    // 7. Upcoming Reminders List (Next 5-10 pending doses sorted chronologically)
    const upcomingRemindersRaw = await Reminder.find({
      user: userId,
      status: 'Pending',
    })
      .populate('medicine')
      .sort({ scheduledTime: 1 })
      .limit(10);

    const upcomingReminders = upcomingRemindersRaw.map((r) => ({
      _id: r._id,
      medicine: r.medicine,
      medicineName: r.medicine ? r.medicine.name : 'Medicine',
      dosage: r.dosage || (r.medicine ? r.medicine.dosage : ''),
      timeSlot: r.timeSlot,
      formattedTime: format12Hour(r.timeSlot),
      dateString: r.dateString,
      scheduledTime: r.scheduledTime,
      status: r.status,
      timeRemaining: getTimeRemainingString(r.scheduledTime),
    }));

    // 8. Recent Activity Logs (Top 10)
    const recentActivity = await ActivityLog.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(10);

    // 9. Notification Push Status
    const subCount = await PushSubscription.countDocuments({ user: userId });

    res.json({
      summary: {
        totalMedicines,
        todayReminders,
        takenToday,
        missedToday,
        upcomingToday,
        adherenceRate: overallAdherenceRate,
        currentStreak: streakData.currentStreak,
        bestStreak: streakData.bestStreak,
        totalReminders: totalRemindersCount,
      },
      todaySchedule,
      nextReminder,
      weeklyAdherence,
      monthlyAdherence,
      streak: streakData,
      activeMedicines: activeMedicinesList,
      upcomingReminders,
      recentActivity,
      notificationStatus: {
        pushEnabled: subCount > 0,
        subscriptionCount: subCount,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDashboardData: getDashboardAnalytics,
  getDashboardAnalytics,
};
