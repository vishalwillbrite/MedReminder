const cron = require('node-cron');
const Medicine = require('../models/Medicine');
const Reminder = require('../models/Reminder');
const User = require('../models/User');
const {
  sendMedicineReminder,
  sendMissedDoseNotification,
  sendDailySummary,
} = require('./pushNotificationService');
const logger = require('../utils/logger');

const getTodayString = (dateObj = new Date()) => {
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const initCronJobs = () => {
  // Run every minute "* * * * *"
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();
      const currentHours = String(now.getHours()).padStart(2, '0');
      const currentMinutes = String(now.getMinutes()).padStart(2, '0');
      const currentTimeSlot = `${currentHours}:${currentMinutes}`;
      const todayStr = getTodayString(now);

      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
      const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

      // 1. Auto-update expired medicines status to "Completed"
      const expiredMedicines = await Medicine.updateMany(
        {
          status: 'Active',
          endDate: { $lt: startOfToday },
        },
        {
          $set: { status: 'Completed' },
        }
      );

      if (expiredMedicines.modifiedCount > 0) {
        logger.cron(`[Cron Engine] Updated ${expiredMedicines.modifiedCount} medicines status to Completed`);
      }

      // 2. Find all active medicines with matching reminder time slot for this minute
      const activeMedicines = await Medicine.find({
        status: 'Active',
        startDate: { $lte: endOfToday },
        endDate: { $gte: startOfToday },
        reminderTimes: currentTimeSlot,
      }).populate('user');

      let createdCount = 0;
      for (const med of activeMedicines) {
        // Skip if user disabled reminders
        if (med.user && med.user.notificationSettings && med.user.notificationSettings.enableReminders === false) {
          continue;
        }

        const scheduledTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes(), 0);

        try {
          const res = await Reminder.updateOne(
            { medicine: med._id, dateString: todayStr, timeSlot: currentTimeSlot },
            {
              $setOnInsert: {
                user: med.user._id || med.user,
                medicine: med._id,
                scheduledTime,
                timeSlot: currentTimeSlot,
                dateString: todayStr,
                dosage: med.dosage,
                foodTiming: med.foodTiming,
                status: 'Pending',
              },
            },
            { upsert: true }
          );

          if (res.upsertedCount > 0) {
            createdCount++;

            const createdReminder = await Reminder.findOne({
              medicine: med._id,
              dateString: todayStr,
              timeSlot: currentTimeSlot,
            });

            // Send Real Web Push Notification
            await sendMedicineReminder(med, createdReminder);
          }
        } catch (e) {
          // Ignore duplicate key errors on parallel execution
        }
      }

      // 3. Detect Missed Doses (Overdue by > 30 minutes)
      const thirtyMinsAgo = new Date(now.getTime() - 30 * 60 * 1000);
      const missedReminders = await Reminder.find({
        status: 'Pending',
        scheduledTime: { $lt: thirtyMinsAgo },
      }).populate('medicine user');

      if (missedReminders.length > 0) {
        for (const rem of missedReminders) {
          rem.status = 'Missed';
          await rem.save();

          if (
            rem.user &&
            rem.medicine &&
            rem.user.notificationSettings &&
            rem.user.notificationSettings.enableMissedDoseAlerts !== false
          ) {
            await sendMissedDoseNotification(rem.medicine, rem);
          }
        }
      }

      // 4. Optional Daily Summary at 08:00 AM
      if (currentTimeSlot === '08:00') {
        const usersForSummary = await User.find({
          'notificationSettings.enableDailySummary': true,
        });

        for (const u of usersForSummary) {
          const todayDoses = await Reminder.find({ user: u._id, dateString: todayStr });
          if (todayDoses.length > 0) {
            const completed = todayDoses.filter((d) => d.status === 'Taken').length;
            await sendDailySummary(u, { total: todayDoses.length, completed });
          }
        }
      }

      if (createdCount > 0 || missedReminders.length > 0) {
        logger.cron(
          `[Cron Engine] Slot [${currentTimeSlot}]: Created ${createdCount} reminders, Marked ${missedReminders.length} as Missed.`
        );
      }
    } catch (error) {
      logger.error('[Cron Engine Error]:', error.message);
    }
  });

  logger.info('[Node-cron Engine Initialized]: Running every minute for Web Push Reminders');
};

module.exports = initCronJobs;
