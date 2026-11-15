// -----------------------------------------------------------------------------
// Module Imports
// Import Capacitor LocalNotifications plugin and Capacitor platform utility
// -----------------------------------------------------------------------------
import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

// -----------------------------------------------------------------------------
// Service: NotificationService
// Manages alarm reminders for scheduled medication times
// -----------------------------------------------------------------------------
export const NotificationService = {
  // ---------------------------------------------------------------------------
  // Method: requestPermissions
  // Checks and requests notification permissions from the operating system
  // ---------------------------------------------------------------------------
  requestPermissions: async () => {
    try {
      if (Capacitor.isNativePlatform()) {
        const check = await LocalNotifications.checkPermissions();
        if (check.display !== 'granted') {
          const req = await LocalNotifications.requestPermissions();
          return req.display === 'granted';
        }
        return true;
      } else {
        // Fallback for desktop/web browser test mode
        if ('Notification' in window) {
          if (Notification.permission === 'granted') return true;
          const perm = await Notification.requestPermission();
          return perm === 'granted';
        }
      }
    } catch (err) {
      console.warn('Notification permission request skipped or not supported:', err);
    }
    return false;
  },

  // ---------------------------------------------------------------------------
  // Method: scheduleMedicineReminder
  // Schedules a daily repeating alarm notification at the specified HH:MM time
  // ---------------------------------------------------------------------------
  scheduleMedicineReminder: async (medicineId, medicineName, scheduledTime, conditionName = '') => {
    try {
      const [hourStr, minStr] = scheduledTime.split(':');
      const hour = parseInt(hourStr, 10);
      const minute = parseInt(minStr, 10);

      if (isNaN(hour) || isNaN(minute)) {
        console.error('Invalid scheduled_time format for notifications:', scheduledTime);
        return false;
      }

      if (Capacitor.isNativePlatform()) {
        await LocalNotifications.schedule({
          notifications: [
            {
              id: Number(medicineId),
              title: `Time to take ${medicineName}!`,
              body: conditionName
                ? `Daily dose for ${conditionName} scheduled at ${scheduledTime}`
                : `Your daily dose of ${medicineName} is scheduled now.`,
              schedule: {
                on: {
                  hour: hour,
                  minute: minute,
                },
                repeats: true,
                allowWhileIdle: true,
              },
              sound: 'beep.wav',
              actionTypeId: '',
              extra: {
                medicineId,
                scheduledTime,
              },
            },
          ],
        });
        console.log(`[NotificationService] Scheduled native alarm for ${medicineName} at ${scheduledTime}`);
        return true;
      } else {
        console.log(`[NotificationService Web] Alarm registered for ${medicineName} at ${scheduledTime}`);
        return true;
      }
    } catch (err) {
      console.error('Failed to schedule local notification:', err);
      return false;
    }
  },

  // ---------------------------------------------------------------------------
  // Method: cancelMedicineReminder
  // Cancels active alarms for a deleted or deactivated medicine
  // ---------------------------------------------------------------------------
  cancelMedicineReminder: async (medicineId) => {
    try {
      if (Capacitor.isNativePlatform()) {
        await LocalNotifications.cancel({
          notifications: [{ id: Number(medicineId) }],
        });
        console.log(`[NotificationService] Canceled alarm for medicine ID: ${medicineId}`);
      }
    } catch (err) {
      console.error('Failed to cancel notification:', err);
    }
  },
};
